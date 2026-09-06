export interface ExecutiveAttendanceMetrics {
  month: string;
  totalScheduledWorkingDays: number;
  totalEmployees: number;
  overallAttendanceRate: number; // e.g. 92.4
  punctualityIndex: number; // e.g. 88.5
  totalWorkedHours: number;
  totalOvertimeHours: number;
  totalLateArrivals: number;
  totalUnexcusedAbsences: number;
  branchBreakdown: {
    branchName: string;
    branchCode: string;
    staffCount: number;
    attendanceRate: number;
    punctualityRate: number;
  }[];
  departmentBreakdown: {
    departmentName: string;
    staffCount: number;
    attendanceRate: number;
  }[];
}

export interface PayrollDisbursementAnalytics {
  periodName: string;
  currency: string;
  totalGrossDisbursed: number;
  totalNetDisbursed: number;
  totalTaxWithheld: number;
  totalProvidentFundContribution: number;
  totalAttendancePenalties: number;
  departmentSummaries: {
    department: string;
    headcount: number;
    totalGross: number;
    totalNet: number;
  }[];
}

export type ExportFormat = 'CSV' | 'JSON' | 'HTML_PDF';
