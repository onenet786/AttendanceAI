import { prisma } from '../../lib/prisma.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { AttendanceAction, AttendanceSource, DailyStatus, Shift } from '@prisma/client';
import { getSocketServer } from '../../socket/index.js';
import { AuditService } from '../audit/audit.service.js';

interface RecordPunchParams {
  tenantId: string;
  employeeId?: string;
  qrToken?: string;
  barcode?: string;
  eventType: AttendanceAction;
  source: AttendanceSource;
  deviceId?: string;
  branchId?: string;
  latitude?: number;
  longitude?: number;
  confidenceScore?: number;
  snapshotUrl?: string;
  verificationMethod?: string;
  createdById?: string;
  remarks?: string;
  customTimestamp?: Date;
}

interface CalculatedIntervals {
  firstIn: Date | null;
  lastOut: Date | null;
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  workingIntervals: Array<{ start: Date; end: Date; minutes: number }>;
  breakIntervals: Array<{ start: Date; end: Date; minutes: number }>;
}

export class AttendanceService {
  /**
   * Helper function to compute multiple IN/OUT intervals and break durations.
   * Accurately supports complex days (e.g. IN 09:00, OUT 13:00, IN 14:00, OUT 17:30)
   */
  public static calculatePunches(events: Array<{ eventType: AttendanceAction; timestamp: Date }>): CalculatedIntervals {
    if (!events || events.length === 0) {
      return {
        firstIn: null,
        lastOut: null,
        totalWorkMinutes: 0,
        totalBreakMinutes: 0,
        workingIntervals: [],
        breakIntervals: [],
      };
    }

    // Sort chronologically ascending
    const sorted = [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    let firstIn: Date | null = null;
    let lastOut: Date | null = null;
    let currentIn: Date | null = null;
    let lastExitTime: Date | null = null;

    const workingIntervals: Array<{ start: Date; end: Date; minutes: number }> = [];
    const breakIntervals: Array<{ start: Date; end: Date; minutes: number }> = [];

    const isExitAction = (action: AttendanceAction) =>
      action === AttendanceAction.CHECK_OUT ||
      action === AttendanceAction.BREAK_START ||
      action === AttendanceAction.TEMPORARY_OUT;

    const isEntryAction = (action: AttendanceAction) =>
      action === AttendanceAction.CHECK_IN ||
      action === AttendanceAction.BREAK_END ||
      action === AttendanceAction.TEMPORARY_IN ||
      action === AttendanceAction.OFFICIAL_DUTY;

    for (const ev of sorted) {
      if (isEntryAction(ev.eventType)) {
        if (!firstIn) firstIn = ev.timestamp;

        // If we previously had an exit, the time between exit and this new entry is break time
        if (lastExitTime && !currentIn) {
          const breakMins = Math.max(0, Math.floor((ev.timestamp.getTime() - lastExitTime.getTime()) / (1000 * 60)));
          if (breakMins > 0) {
            breakIntervals.push({ start: lastExitTime, end: ev.timestamp, minutes: breakMins });
          }
          lastExitTime = null;
        }

        if (!currentIn) {
          currentIn = ev.timestamp;
        }
      } else if (isExitAction(ev.eventType)) {
        lastOut = ev.timestamp;

        if (currentIn) {
          const workMins = Math.max(0, Math.floor((ev.timestamp.getTime() - currentIn.getTime()) / (1000 * 60)));
          workingIntervals.push({ start: currentIn, end: ev.timestamp, minutes: workMins });
          currentIn = null;
        }
        lastExitTime = ev.timestamp;
      }
    }

    // If an employee is still clocked in without a closing punch:
    if (currentIn) {
      const now = new Date();
      // If the punch is today, calculate minutes worked so far
      const sameDay = currentIn.toDateString() === now.toDateString();
      if (sameDay) {
        const liveMins = Math.max(0, Math.floor((now.getTime() - currentIn.getTime()) / (1000 * 60)));
        workingIntervals.push({ start: currentIn, end: now, minutes: liveMins });
      }
    }

    const totalWorkMinutes = workingIntervals.reduce((acc, curr) => acc + curr.minutes, 0);
    const totalBreakMinutes = breakIntervals.reduce((acc, curr) => acc + curr.minutes, 0);

    return {
      firstIn,
      lastOut,
      totalWorkMinutes,
      totalBreakMinutes,
      workingIntervals,
      breakIntervals,
    };
  }

  /**
   * Recalculates consolidated DailyAttendance for an employee on a given date.
   */
  public static async recalculateDailyRecord(
    tenantId: string,
    employeeId: string,
    targetDate: Date,
    shiftOverride?: Shift | null
  ) {
    const startOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 23, 59, 59, 999));

    // Fetch employee with assigned shift and branch
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { shift: true, branch: true },
    });

    if (!employee) return null;
    const shift = shiftOverride !== undefined ? shiftOverride : employee.shift;

    // Check approved leave for this date
    const approvedLeave = await prisma.leave.findFirst({
      where: {
        tenantId,
        employeeId,
        status: 'APPROVED',
        startDate: { lte: endOfDay },
        endDate: { gte: startOfDay },
      },
    });

    if (approvedLeave) {
      return prisma.dailyAttendance.upsert({
        where: {
          tenantId_employeeId_date: {
            tenantId,
            employeeId,
            date: startOfDay,
          },
        },
        update: {
          status: DailyStatus.ON_LEAVE,
          remarks: `Approved ${approvedLeave.leaveType} Leave`,
        },
        create: {
          tenantId,
          employeeId,
          branchId: employee.branchId,
          shiftId: employee.shiftId,
          date: startOfDay,
          status: DailyStatus.ON_LEAVE,
          remarks: `Approved ${approvedLeave.leaveType} Leave`,
        },
      });
    }

    // Fetch all attendance events for this day
    const dayEvents = await prisma.attendanceEvent.findMany({
      where: {
        tenantId,
        employeeId,
        timestamp: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { timestamp: 'asc' },
    });

    if (dayEvents.length === 0) {
      // Check if weekend according to shift workDays (e.g. "1,2,3,4,5" where Mon=1, Sun=7)
      const dayOfWeek = targetDate.getUTCDay() === 0 ? 7 : targetDate.getUTCDay();
      const isWorkDay = shift?.workDays ? shift.workDays.split(',').map(Number).includes(dayOfWeek) : true;

      const autoStatus = isWorkDay ? DailyStatus.ABSENT : DailyStatus.WEEKEND;

      return prisma.dailyAttendance.upsert({
        where: {
          tenantId_employeeId_date: {
            tenantId,
            employeeId,
            date: startOfDay,
          },
        },
        update: {
          status: autoStatus,
          totalWorkMinutes: 0,
          totalBreakMinutes: 0,
          lateMinutes: 0,
          earlyExitMinutes: 0,
          overtimeMinutes: 0,
        },
        create: {
          tenantId,
          employeeId,
          branchId: employee.branchId,
          shiftId: employee.shiftId,
          date: startOfDay,
          status: autoStatus,
          totalWorkMinutes: 0,
          totalBreakMinutes: 0,
          lateMinutes: 0,
          earlyExitMinutes: 0,
          overtimeMinutes: 0,
        },
      });
    }

    const { firstIn, lastOut, totalWorkMinutes, totalBreakMinutes } = this.calculatePunches(dayEvents);

    let lateMinutes = 0;
    let earlyExitMinutes = 0;
    let overtimeMinutes = 0;
    let status: DailyStatus = DailyStatus.PRESENT;

    if (shift && firstIn) {
      const [startHour, startMinute] = shift.startTime.split(':').map(Number);
      const shiftStartTime = new Date(startOfDay);
      shiftStartTime.setUTCHours(startHour, startMinute, 0, 0);

      const arrivalDiffMinutes = Math.floor((firstIn.getTime() - shiftStartTime.getTime()) / (1000 * 60));
      if (arrivalDiffMinutes > shift.gracePeriodMinutes) {
        lateMinutes = arrivalDiffMinutes;
        status = DailyStatus.LATE;
      }

      if (lastOut) {
        const [endHour, endMinute] = shift.endTime.split(':').map(Number);
        const shiftEndTime = new Date(startOfDay);
        shiftEndTime.setUTCHours(endHour, endMinute, 0, 0);

        const earlyDiffMinutes = Math.floor((shiftEndTime.getTime() - lastOut.getTime()) / (1000 * 60));
        if (earlyDiffMinutes > shift.earlyExitThresholdMinutes) {
          earlyExitMinutes = earlyDiffMinutes;
        }
      }

      // Overtime calculation
      if (totalWorkMinutes > shift.fullDayMinutes) {
        overtimeMinutes = totalWorkMinutes - shift.fullDayMinutes;
      }

      // Half day determination
      if (totalWorkMinutes > 0 && totalWorkMinutes < shift.halfDayMinutes) {
        status = DailyStatus.HALF_DAY;
      }
    }

    return prisma.dailyAttendance.upsert({
      where: {
        tenantId_employeeId_date: {
          tenantId,
          employeeId,
          date: startOfDay,
        },
      },
      update: {
        firstIn,
        lastOut,
        totalWorkMinutes,
        totalBreakMinutes,
        lateMinutes,
        earlyExitMinutes,
        overtimeMinutes,
        status,
        shiftId: employee.shiftId,
      },
      create: {
        tenantId,
        employeeId,
        branchId: employee.branchId,
        shiftId: employee.shiftId,
        date: startOfDay,
        firstIn,
        lastOut,
        totalWorkMinutes,
        totalBreakMinutes,
        lateMinutes,
        earlyExitMinutes,
        overtimeMinutes,
        status,
      },
    });
  }

  /**
   * Central entry point for all punch ingress: Camera, Face, QR, Barcode, Voice, Manual
   */
  public static async recordPunch(params: RecordPunchParams) {
    let employeeId = params.employeeId;

    if (!employeeId && params.qrToken) {
      const emp = await prisma.employee.findFirst({
        where: { tenantId: params.tenantId, qrToken: params.qrToken },
      });
      if (!emp) throw new NotFoundError('Invalid or expired QR token');
      employeeId = emp.id;
    } else if (!employeeId && params.barcode) {
      const emp = await prisma.employee.findFirst({
        where: { tenantId: params.tenantId, barcode: params.barcode },
      });
      if (!emp) throw new NotFoundError('No employee matched with this barcode');
      employeeId = emp.id;
    }

    if (!employeeId) {
      throw new BadRequestError('Employee identifier (employeeId, qrToken, or barcode) is required');
    }

    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, tenantId: params.tenantId },
      include: { shift: true, branch: true },
    });

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    const punchTimestamp = params.customTimestamp || new Date();

    // Anti-fraud: Cooldown check (last punch within 30 seconds)
    const thirtySecondsAgo = new Date(punchTimestamp.getTime() - 30 * 1000);
    const recentDuplicate = await prisma.attendanceEvent.findFirst({
      where: {
        tenantId: params.tenantId,
        employeeId,
        timestamp: { gte: thirtySecondsAgo, lte: punchTimestamp },
      },
    });

    const isSuspicious = !!recentDuplicate || (params.confidenceScore !== undefined && params.confidenceScore < 0.75);

    // Create Immutable Attendance Event
    const event = await prisma.attendanceEvent.create({
      data: {
        tenantId: params.tenantId,
        employeeId,
        eventType: params.eventType,
        source: params.source,
        timestamp: punchTimestamp,
        deviceId: params.deviceId,
        branchId: params.branchId || employee.branchId,
        latitude: params.latitude,
        longitude: params.longitude,
        confidenceScore: params.confidenceScore,
        snapshotUrl: params.snapshotUrl,
        verificationMethod: params.verificationMethod,
        createdById: params.createdById,
        isSuspicious,
        remarks: params.remarks || (isSuspicious ? 'Rapid duplicate punch or low confidence' : null),
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
      },
    });

    // Recalculate daily consolidated metrics
    const daily = await this.recalculateDailyRecord(params.tenantId, employeeId, punchTimestamp, employee.shift);

    // Emit live WebSocket notification
    try {
      const io = getSocketServer();
      if (io) {
        io.to(params.tenantId).emit('attendance:event', {
          event: {
            id: event.id,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            employeeCode: employee.employeeCode,
            eventType: event.eventType,
            source: event.source,
            timestamp: event.timestamp,
            photoUrl: employee.photoUrl,
            branchName: employee.branch?.name,
          },
          daily,
        });
      }
    } catch (e) {
      // Non-blocking socket error
    }

    return { event, daily };
  }

  /**
   * Manual Attendance Correction with Supervisor audit trail.
   */
  public static async requestCorrection(
    tenantId: string,
    actorId: string,
    data: {
      employeeId: string;
      eventType: AttendanceAction;
      timestamp: Date;
      reason: string;
    }
  ) {
    if (!data.reason || data.reason.trim().length < 5) {
      throw new BadRequestError('A valid reason (min 5 chars) is mandatory for attendance corrections');
    }

    const employee = await prisma.employee.findFirst({
      where: { id: data.employeeId, tenantId },
    });

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    const event = await prisma.attendanceEvent.create({
      data: {
        tenantId,
        employeeId: data.employeeId,
        eventType: data.eventType,
        source: AttendanceSource.MANUAL,
        timestamp: data.timestamp,
        createdById: actorId,
        verificationMethod: 'MANUAL_SUPERVISOR_CORRECTION',
        remarks: `Correction Reason: ${data.reason}`,
      },
    });

    // Re-run the daily engine for that specific calendar date
    const daily = await this.recalculateDailyRecord(tenantId, data.employeeId, data.timestamp);

    // Record in immutable AuditLog
    await AuditService.log({
      tenantId,
      actorId,
      action: 'ATTENDANCE_CORRECTION',
      entity: 'AttendanceEvent',
      entityId: event.id,
      newValue: {
        employeeId: data.employeeId,
        eventType: data.eventType,
        timestamp: data.timestamp,
        reason: data.reason,
      },
    });

    return { event, daily };
  }

  /**
   * Detailed punch timeline for a single employee on a specific date.
   */
  public static async getEmployeeTimeline(tenantId: string, employeeId: string, targetDateStr?: string) {
    const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
    const startOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate(), 23, 59, 59, 999));

    const [events, daily, employee] = await Promise.all([
      prisma.attendanceEvent.findMany({
        where: {
          tenantId,
          employeeId,
          timestamp: { gte: startOfDay, lte: endOfDay },
        },
        orderBy: { timestamp: 'asc' },
      }),
      prisma.dailyAttendance.findUnique({
        where: {
          tenantId_employeeId_date: {
            tenantId,
            employeeId,
            date: startOfDay,
          },
        },
        include: { shift: true },
      }),
      prisma.employee.findUnique({
        where: { id: employeeId },
        select: { id: true, firstName: true, lastName: true, employeeCode: true, photoUrl: true },
      }),
    ]);

    const intervalAnalysis = this.calculatePunches(events);

    return {
      employee,
      date: startOfDay,
      daily,
      events,
      intervals: intervalAnalysis.workingIntervals,
      breaks: intervalAnalysis.breakIntervals,
      summary: {
        totalWorkMinutes: intervalAnalysis.totalWorkMinutes,
        totalBreakMinutes: intervalAnalysis.totalBreakMinutes,
        firstIn: intervalAnalysis.firstIn,
        lastOut: intervalAnalysis.lastOut,
      },
    };
  }

  public static async getLiveSummary(tenantId: string, branchId?: string) {
    const todayMidnight = new Date();
    todayMidnight.setUTCHours(0, 0, 0, 0);

    const whereDaily: any = {
      tenantId,
      date: todayMidnight,
      ...(branchId ? { branchId } : {}),
    };

    const totalEmployees = await prisma.employee.count({
      where: {
        tenantId,
        status: 'ACTIVE',
        ...(branchId ? { branchId } : {}),
      },
    });

    const records = await prisma.dailyAttendance.findMany({
      where: whereDaily,
      select: { status: true },
    });

    let present = 0;
    let late = 0;
    let onLeave = 0;

    for (const r of records) {
      if (r.status === DailyStatus.PRESENT) present++;
      else if (r.status === DailyStatus.LATE) late++;
      else if (r.status === DailyStatus.ON_LEAVE) onLeave++;
    }

    const absent = Math.max(0, totalEmployees - (present + late + onLeave));

    return {
      totalEmployees,
      present,
      late,
      absent,
      onLeave,
    };
  }

  public static async getRecentEvents(tenantId: string, limit: number = 20) {
    return prisma.attendanceEvent.findMany({
      where: { tenantId },
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            photoUrl: true,
          },
        },
        branch: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  public static async getDailyRecords(tenantId: string, dateStr?: string, branchId?: string) {
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    targetDate.setUTCHours(0, 0, 0, 0);

    return prisma.dailyAttendance.findMany({
      where: {
        tenantId,
        date: targetDate,
        ...(branchId ? { branchId } : {}),
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            photoUrl: true,
            department: { select: { name: true } },
          },
        },
        branch: { select: { id: true, name: true } },
        shift: { select: { id: true, name: true, startTime: true, endTime: true } },
      },
      orderBy: { firstIn: 'desc' },
    });
  }
}
