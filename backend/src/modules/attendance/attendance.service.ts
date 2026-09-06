import { prisma } from '../../lib/prisma.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { AttendanceAction, AttendanceSource, DailyStatus } from '@prisma/client';
import { getSocketServer } from '../../socket/index.js';

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
}

export class AttendanceService {
  public static async recordPunch(params: RecordPunchParams) {
    // 1. Resolve Employee
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
      include: {
        shift: true,
        branch: true,
      },
    });

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    const now = new Date();

    // 2. Anti-fraud: Cooldown check (last punch within 30 seconds)
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
    const recentDuplicate = await prisma.attendanceEvent.findFirst({
      where: {
        tenantId: params.tenantId,
        employeeId,
        timestamp: { gte: thirtySecondsAgo },
      },
    });

    const isSuspicious = !!recentDuplicate || (params.confidenceScore !== undefined && params.confidenceScore < 0.75);

    // 3. Create Immutable Attendance Event
    const event = await prisma.attendanceEvent.create({
      data: {
        tenantId: params.tenantId,
        employeeId,
        eventType: params.eventType,
        source: params.source,
        timestamp: now,
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

    // 4. Update Daily Attendance Record (Date stripped to midnight UTC)
    const todayMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    let daily = await prisma.dailyAttendance.findUnique({
      where: {
        tenantId_employeeId_date: {
          tenantId: params.tenantId,
          employeeId,
          date: todayMidnight,
        },
      },
    });

    const shift = employee.shift;
    let lateMinutes = 0;
    let status: DailyStatus = DailyStatus.PRESENT;

    if (!daily) {
      // First check-in of the day
      if (shift && params.eventType === AttendanceAction.CHECK_IN) {
        const [shiftHour, shiftMin] = shift.startTime.split(':').map(Number);
        const shiftStartToday = new Date(todayMidnight);
        shiftStartToday.setUTCHours(shiftHour, shiftMin, 0, 0);

        const diffMinutes = Math.floor((now.getTime() - shiftStartToday.getTime()) / (1000 * 60));
        if (diffMinutes > shift.gracePeriodMinutes) {
          lateMinutes = diffMinutes;
          status = DailyStatus.LATE;
        }
      }

      daily = await prisma.dailyAttendance.create({
        data: {
          tenantId: params.tenantId,
          employeeId,
          branchId: employee.branchId,
          shiftId: employee.shiftId,
          date: todayMidnight,
          firstIn: now,
          lastOut: params.eventType === AttendanceAction.CHECK_OUT ? now : null,
          totalWorkMinutes: 0,
          lateMinutes,
          status,
        },
      });
    } else {
      // Subsequent punch today
      const updateData: any = {};
      if (params.eventType === AttendanceAction.CHECK_OUT) {
        updateData.lastOut = now;
        if (daily.firstIn) {
          const totalMinutes = Math.max(0, Math.floor((now.getTime() - daily.firstIn.getTime()) / (1000 * 60)));
          updateData.totalWorkMinutes = totalMinutes;
        }
      }
      daily = await prisma.dailyAttendance.update({
        where: { id: daily.id },
        data: updateData,
      });
    }

    // 5. Broadcast to WebSocket clients for live dashboard updates
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
        });
      }
    } catch (e) {
      // Non-blocking socket broadcast failure
    }

    return { event, daily };
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
