import { prisma } from '../../lib/prisma.js';
import { DailyStatus } from '@prisma/client';

export class ReportsService {
  /**
   * Daily Attendance Report
   */
  public static async getDailyReport(
    tenantId: string,
    options: {
      date?: string;
      branchId?: string;
      departmentId?: string;
      status?: DailyStatus;
    }
  ) {
    const targetDate = options.date ? new Date(options.date) : new Date();
    targetDate.setUTCHours(0, 0, 0, 0);

    const whereDaily: any = {
      tenantId,
      date: targetDate,
      ...(options.branchId ? { branchId: options.branchId } : {}),
      ...(options.status ? { status: options.status } : {}),
    };

    if (options.departmentId) {
      whereDaily.employee = { departmentId: options.departmentId };
    }

    const records = await prisma.dailyAttendance.findMany({
      where: whereDaily,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
            department: { select: { id: true, name: true } },
            branch: { select: { id: true, name: true } },
          },
        },
        shift: { select: { name: true, startTime: true, endTime: true } },
      },
      orderBy: { employee: { employeeCode: 'asc' } },
    });

    // Summary calculations
    let totalPresent = 0;
    let totalLate = 0;
    let totalAbsent = 0;
    let totalLeave = 0;
    let totalOvertimeMinutes = 0;
    let totalWorkMinutes = 0;

    for (const r of records) {
      if (r.status === DailyStatus.PRESENT) totalPresent++;
      else if (r.status === DailyStatus.LATE) totalLate++;
      else if (r.status === DailyStatus.ABSENT) totalAbsent++;
      else if (r.status === DailyStatus.ON_LEAVE) totalLeave++;

      totalOvertimeMinutes += r.overtimeMinutes;
      totalWorkMinutes += r.totalWorkMinutes;
    }

    return {
      date: targetDate.toISOString().split('T')[0],
      summary: {
        totalRecords: records.length,
        present: totalPresent,
        late: totalLate,
        absent: totalAbsent,
        onLeave: totalLeave,
        totalWorkHours: +(totalWorkMinutes / 60).toFixed(1),
        totalOvertimeHours: +(totalOvertimeMinutes / 60).toFixed(1),
      },
      records: records.map((r) => ({
        id: r.id,
        employeeId: r.employeeId,
        employeeCode: r.employee.employeeCode,
        employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
        department: r.employee.department.name,
        branch: r.employee.branch.name,
        shift: r.shift ? `${r.shift.name} (${r.shift.startTime}-${r.shift.endTime})` : 'Flexible',
        firstIn: r.firstIn,
        lastOut: r.lastOut,
        totalWorkMinutes: r.totalWorkMinutes,
        workHoursFormatted: (r.totalWorkMinutes / 60).toFixed(1) + ' hrs',
        breakMinutes: r.totalBreakMinutes,
        lateMinutes: r.lateMinutes,
        earlyExitMinutes: r.earlyExitMinutes,
        overtimeMinutes: r.overtimeMinutes,
        status: r.status,
      })),
    };
  }

  /**
   * Monthly Summary Matrix per Employee
   */
  public static async getMonthlyReport(
    tenantId: string,
    options: {
      year?: number;
      month?: number; // 1 - 12
      branchId?: string;
      departmentId?: string;
    }
  ) {
    const now = new Date();
    const year = options.year || now.getUTCFullYear();
    const month = options.month !== undefined ? options.month - 1 : now.getUTCMonth();

    const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

    const whereEmployee: any = {
      tenantId,
      status: 'ACTIVE',
      ...(options.branchId ? { branchId: options.branchId } : {}),
      ...(options.departmentId ? { departmentId: options.departmentId } : {}),
    };

    const [employees, records] = await Promise.all([
      prisma.employee.findMany({
        where: whereEmployee,
        include: {
          department: { select: { name: true } },
          branch: { select: { name: true } },
        },
        orderBy: { employeeCode: 'asc' },
      }),
      prisma.dailyAttendance.findMany({
        where: {
          tenantId,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
    ]);

    // Map records by employeeId
    const recordsMap = new Map<string, typeof records>();
    for (const r of records) {
      if (!recordsMap.has(r.employeeId)) recordsMap.set(r.employeeId, []);
      recordsMap.get(r.employeeId)!.push(r);
    }

    const employeeRows = employees.map((emp) => {
      const empRecords = recordsMap.get(emp.id) || [];
      let daysPresent = 0;
      let daysLate = 0;
      let daysAbsent = 0;
      let daysLeave = 0;
      let totalWorkMinutes = 0;
      let totalOvertimeMinutes = 0;

      for (const rec of empRecords) {
        if (rec.status === DailyStatus.PRESENT) daysPresent++;
        else if (rec.status === DailyStatus.LATE) daysLate++;
        else if (rec.status === DailyStatus.ABSENT) daysAbsent++;
        else if (rec.status === DailyStatus.ON_LEAVE) daysLeave++;

        totalWorkMinutes += rec.totalWorkMinutes;
        totalOvertimeMinutes += rec.overtimeMinutes;
      }

      const totalWorkingDaysRecorded = daysPresent + daysLate + daysAbsent + daysLeave;
      const attendancePercentage =
        totalWorkingDaysRecorded > 0
          ? Math.round(((daysPresent + daysLate) / totalWorkingDaysRecorded) * 100)
          : 0;

      return {
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        department: emp.department.name,
        branch: emp.branch.name,
        daysPresent,
        daysLate,
        daysAbsent,
        daysLeave,
        totalWorkHours: +(totalWorkMinutes / 60).toFixed(1),
        totalOvertimeHours: +(totalOvertimeMinutes / 60).toFixed(1),
        attendancePercentage,
      };
    });

    return {
      period: `${year}-${String(month + 1).padStart(2, '0')}`,
      totalEmployees: employees.length,
      employees: employeeRows,
    };
  }

  /**
   * Exceptions Report (Late Arrivals, Early Departures, Missing Checkouts)
   */
  public static async getExceptionsReport(
    tenantId: string,
    options: {
      startDate?: string;
      endDate?: string;
      branchId?: string;
    }
  ) {
    const end = options.endDate ? new Date(options.endDate) : new Date();
    const start = options.startDate ? new Date(options.startDate) : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

    const records = await prisma.dailyAttendance.findMany({
      where: {
        tenantId,
        date: { gte: start, lte: end },
        ...(options.branchId ? { branchId: options.branchId } : {}),
        OR: [
          { lateMinutes: { gt: 0 } },
          { earlyExitMinutes: { gt: 0 } },
          { firstIn: { not: null }, lastOut: null },
        ],
      },
      include: {
        employee: {
          select: { employeeCode: true, firstName: true, lastName: true },
        },
        branch: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    });

    return records.map((r) => ({
      date: r.date.toISOString().split('T')[0],
      employeeCode: r.employee.employeeCode,
      employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
      branch: r.branch.name,
      lateMinutes: r.lateMinutes,
      earlyExitMinutes: r.earlyExitMinutes,
      hasMissingCheckout: !!r.firstIn && !r.lastOut,
      firstIn: r.firstIn,
      lastOut: r.lastOut,
      status: r.status,
    }));
  }

  /**
   * RFC 4180 CSV Export
   */
  public static async exportAttendanceCsv(
    tenantId: string,
    options: {
      date?: string;
      branchId?: string;
      departmentId?: string;
    }
  ): Promise<string> {
    const data = await this.getDailyReport(tenantId, options);

    const headers = [
      'Date',
      'Employee Code',
      'Employee Name',
      'Department',
      'Branch',
      'Shift',
      'First IN',
      'Last OUT',
      'Worked Hours',
      'Break Minutes',
      'Late Minutes',
      'Early Exit Minutes',
      'Overtime Minutes',
      'Status',
    ];

    const rows = data.records.map((r) => [
      data.date,
      `"${r.employeeCode}"`,
      `"${r.employeeName}"`,
      `"${r.department}"`,
      `"${r.branch}"`,
      `"${r.shift}"`,
      r.firstIn ? new Date(r.firstIn).toISOString().substring(11, 19) : '',
      r.lastOut ? new Date(r.lastOut).toISOString().substring(11, 19) : '',
      r.workHoursFormatted,
      r.breakMinutes,
      r.lateMinutes,
      r.earlyExitMinutes,
      r.overtimeMinutes,
      r.status,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
