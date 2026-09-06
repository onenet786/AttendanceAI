import { AttendancePayrollMetrics, PayslipBreakdown } from './payroll.types.js';

export interface SalaryStructureConfig {
  basicSalary: number;
  houseAllowance?: number;
  transportAllowance?: number;
  medicalAllowance?: number;
  otherAllowances?: number;
  taxDeductionPercent?: number;
  currency?: string;
}

export class PayrollCalculator {
  /**
   * Standard daily rate based on monthly basic pay and 30-day baseline
   */
  static calculateDailyRate(basicSalary: number, daysInMonth: number = 30): number {
    if (daysInMonth <= 0) return 0;
    return Number((basicSalary / daysInMonth).toFixed(2));
  }

  /**
   * Standard hourly rate based on standard 8-hour workday
   */
  static calculateHourlyRate(dailyRate: number, hoursPerDay: number = 8): number {
    if (hoursPerDay <= 0) return 0;
    return Number((dailyRate / hoursPerDay).toFixed(2));
  }

  /**
   * Overtime pay calculation with approved overtime multiplier (e.g. 1.5x)
   */
  static calculateOvertimePay(
    hourlyRate: number,
    overtimeHours: number,
    multiplier: number = 1.5
  ): number {
    if (overtimeHours <= 0) return 0;
    return Number((overtimeHours * hourlyRate * multiplier).toFixed(2));
  }

  /**
   * Attendance penalty deductions:
   * - Full daily rate per unexcused absent day
   * - 0.5 daily rate deduction for every 3 late arrivals
   */
  static calculateAttendanceDeductions(
    dailyRate: number,
    absentDays: number,
    lateDays: number
  ): { latenessPenalty: number; unpaidAbsenceDeduction: number; total: number } {
    const unpaidAbsenceDeduction = Number((Math.max(0, absentDays) * dailyRate).toFixed(2));
    const lateBlocks = Math.floor(Math.max(0, lateDays) / 3);
    const latenessPenalty = Number((lateBlocks * 0.5 * dailyRate).toFixed(2));

    return {
      latenessPenalty,
      unpaidAbsenceDeduction,
      total: Number((unpaidAbsenceDeduction + latenessPenalty).toFixed(2)),
    };
  }

  /**
   * Progressive monthly income tax bracket calculation
   * Bracket 1: $0 - $1,000      -> 0%
   * Bracket 2: $1,001 - $2,500  -> 5% of excess over $1,000
   * Bracket 3: $2,501 - $5,000  -> $75 + 12.5% of excess over $2,500
   * Bracket 4: $5,001 - $10,000 -> $387.5 + 22.5% of excess over $5,000
   * Bracket 5: > $10,000        -> $1,512.5 + 35% of excess over $10,000
   */
  static calculateProgressiveTax(monthlyTaxableGross: number, customTaxPercent?: number): number {
    if (customTaxPercent !== undefined && customTaxPercent > 0) {
      return Number(((monthlyTaxableGross * customTaxPercent) / 100).toFixed(2));
    }

    if (monthlyTaxableGross <= 1000) {
      return 0;
    } else if (monthlyTaxableGross <= 2500) {
      return Number(((monthlyTaxableGross - 1000) * 0.05).toFixed(2));
    } else if (monthlyTaxableGross <= 5000) {
      return Number((75 + (monthlyTaxableGross - 2500) * 0.125).toFixed(2));
    } else if (monthlyTaxableGross <= 10000) {
      return Number((387.5 + (monthlyTaxableGross - 5000) * 0.225).toFixed(2));
    } else {
      return Number((1512.5 + (monthlyTaxableGross - 10000) * 0.35).toFixed(2));
    }
  }

  /**
   * Statutory Provident Fund calculation (default: 5% of basic salary)
   */
  static calculateProvidentFund(basicSalary: number, percentage: number = 5): number {
    return Number(((basicSalary * percentage) / 100).toFixed(2));
  }

  /**
   * Compute comprehensive itemized payslip breakdown
   */
  static computePayslip(
    employeeId: string,
    structure: SalaryStructureConfig,
    attendance: AttendancePayrollMetrics
  ): PayslipBreakdown {
    const basic = structure.basicSalary;
    const house = structure.houseAllowance || 0;
    const transport = structure.transportAllowance || 0;
    const medical = structure.medicalAllowance || 0;
    const other = structure.otherAllowances || 0;
    const totalAllowances = Number((house + transport + medical + other).toFixed(2));

    const dailyRate = this.calculateDailyRate(basic, attendance.totalScheduledDays || 30);
    const hourlyRate = this.calculateHourlyRate(dailyRate, 8);
    const overtimePay = this.calculateOvertimePay(hourlyRate, attendance.overtimeHours, 1.5);

    const grossSalary = Number((basic + totalAllowances + overtimePay).toFixed(2));

    // Deductions
    const attendanceDeductions = this.calculateAttendanceDeductions(
      dailyRate,
      attendance.absentDays,
      attendance.lateDays
    );

    const incomeTax = this.calculateProgressiveTax(grossSalary, structure.taxDeductionPercent);
    const providentFund = this.calculateProvidentFund(basic, 5);

    const totalDeductions = Number(
      (
        attendanceDeductions.total +
        incomeTax +
        providentFund
      ).toFixed(2)
    );

    const netSalary = Number(Math.max(0, grossSalary - totalDeductions).toFixed(2));

    return {
      employeeId,
      basicSalary: basic,
      allowances: {
        house,
        transport,
        medical,
        other,
        total: totalAllowances,
      },
      overtime: {
        hours: attendance.overtimeHours,
        hourlyRate,
        multiplier: 1.5,
        totalPay: overtimePay,
      },
      grossSalary,
      deductions: {
        incomeTax,
        providentFund,
        latenessPenalty: attendanceDeductions.latenessPenalty,
        unpaidAbsenceDeduction: attendanceDeductions.unpaidAbsenceDeduction,
        total: totalDeductions,
      },
      netSalary,
      currency: structure.currency || 'USD',
    };
  }
}
