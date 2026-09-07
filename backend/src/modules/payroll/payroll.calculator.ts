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
   * Progressive monthly income tax bracket calculation (Default USD baseline)
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
   * Official Pakistani FBR Income Tax Slabs for Salaried Individuals (Tax Year 2024-2025 / 2025-2026)
   * Computed based on Annual Taxable Gross divided by 12 for monthly payroll deduction.
   * - Slab 1: Up to Rs. 600,000/yr (Rs. 50,000/mo) -> 0%
   * - Slab 2: Rs. 600,001 - 1,200,000/yr -> 5% of amount exceeding Rs. 600,000
   * - Slab 3: Rs. 1,200,001 - 2,200,000/yr -> Rs. 30,000 + 15% of amount exceeding Rs. 1,200,000
   * - Slab 4: Rs. 2,200,001 - 3,200,000/yr -> Rs. 180,000 + 25% of amount exceeding Rs. 2,200,000
   * - Slab 5: Rs. 3,200,001 - 4,100,000/yr -> Rs. 430,000 + 30% of amount exceeding Rs. 3,200,000
   * - Slab 6: Above Rs. 4,100,000/yr -> Rs. 700,000 + 35% of amount exceeding Rs. 4,100,000
   */
  static calculatePakistaniFbrTax(monthlyGross: number): { monthlyTax: number; annualTax: number; slab: string } {
    const annualGross = Math.max(0, monthlyGross * 12);
    let annualTax = 0;
    let slab = 'Slab 1: Up to PKR 600,000 (0%)';

    if (annualGross <= 600000) {
      annualTax = 0;
      slab = 'Slab 1: Up to PKR 600,000 (0%)';
    } else if (annualGross <= 1200000) {
      annualTax = (annualGross - 600000) * 0.05;
      slab = 'Slab 2: PKR 600,001 to 1,200,000 (5%)';
    } else if (annualGross <= 2200000) {
      annualTax = 30000 + (annualGross - 1200000) * 0.15;
      slab = 'Slab 3: PKR 1,200,001 to 2,200,000 (Rs. 30,000 + 15%)';
    } else if (annualGross <= 3200000) {
      annualTax = 180000 + (annualGross - 2200000) * 0.25;
      slab = 'Slab 4: PKR 2,200,001 to 3,200,000 (Rs. 180,000 + 25%)';
    } else if (annualGross <= 4100000) {
      annualTax = 430000 + (annualGross - 3200000) * 0.30;
      slab = 'Slab 5: PKR 3,200,001 to 4,100,000 (Rs. 430,000 + 30%)';
    } else {
      annualTax = 700000 + (annualGross - 4100000) * 0.35;
      slab = 'Slab 6: Above PKR 4,100,000 (Rs. 700,000 + 35%)';
    }

    const monthlyTax = Number((annualTax / 12).toFixed(2));
    return {
      monthlyTax,
      annualTax: Number(annualTax.toFixed(2)),
      slab,
    };
  }

  /**
   * Statutory Pakistani EOBI (Employees' Old-Age Benefits Institution) contribution
   * Standard employee share: PKR 370/month (Employer pays PKR 1,850/month)
   */
  static calculateEobi(basicSalary: number): number {
    if (basicSalary <= 0) return 0;
    return 370; // Standard fixed statutory employee share in PKR
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
