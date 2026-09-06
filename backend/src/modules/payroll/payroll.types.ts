export interface SalaryStructureInput {
  employeeId: string;
  basicSalary: number;
  houseAllowance?: number;
  transportAllowance?: number;
  medicalAllowance?: number;
  otherAllowances?: number;
  taxDeductionPercent?: number;
  currency?: string;
  effectiveDate?: string;
}

export interface AttendancePayrollMetrics {
  totalScheduledDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  onLeaveDays: number;
  totalWorkedHours: number;
  overtimeHours: number;
}

export interface PayslipBreakdown {
  employeeId: string;
  basicSalary: number;
  allowances: {
    house: number;
    transport: number;
    medical: number;
    other: number;
    total: number;
  };
  overtime: {
    hours: number;
    hourlyRate: number;
    multiplier: number;
    totalPay: number;
  };
  grossSalary: number;
  deductions: {
    incomeTax: number;
    providentFund: number;
    latenessPenalty: number;
    unpaidAbsenceDeduction: number;
    total: number;
  };
  netSalary: number;
  currency: string;
}

export interface PayrollPeriodCreateInput {
  name: string;
  companyId: string;
  startDate: string;
  endDate: string;
  periodType?: 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY' | 'DAILY';
}

export interface PayrollRunSummary {
  periodId: string;
  periodName: string;
  processedEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPayout: number;
  totalOvertimeDisbursed: number;
  currency: string;
  status: 'DRAFT' | 'CALCULATING' | 'REVIEW' | 'APPROVED' | 'LOCKED';
}
