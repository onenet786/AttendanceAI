import { ExecutiveAttendanceMetrics, PayrollDisbursementAnalytics, ExportFormat } from './analytics.types.js';

export class AnalyticsService {
  static async getExecutiveAttendanceAnalytics(tenantId: string, month: string = '2026-09'): Promise<ExecutiveAttendanceMetrics> {
    return {
      month,
      totalScheduledWorkingDays: 22,
      totalEmployees: 22,
      overallAttendanceRate: 91.8,
      punctualityIndex: 86.4,
      totalWorkedHours: 3640.5,
      totalOvertimeHours: 142.0,
      totalLateArrivals: 18,
      totalUnexcusedAbsences: 8,
      branchBreakdown: [
        {
          branchName: 'Lahore Head Office',
          branchCode: 'LHR-01',
          staffCount: 14,
          attendanceRate: 93.2,
          punctualityRate: 88.0,
        },
        {
          branchName: 'Islamabad Regional Branch',
          branchCode: 'ISB-01',
          staffCount: 8,
          attendanceRate: 89.4,
          punctualityRate: 83.5,
        },
      ],
      departmentBreakdown: [
        { departmentName: 'Information Technology', staffCount: 7, attendanceRate: 96.1 },
        { departmentName: 'Human Resources', staffCount: 4, attendanceRate: 94.5 },
        { departmentName: 'Accounts & Finance', staffCount: 4, attendanceRate: 92.0 },
        { departmentName: 'Operations', staffCount: 4, attendanceRate: 88.2 },
        { departmentName: 'Sales & BD', staffCount: 3, attendanceRate: 84.6 },
      ],
    };
  }

  static async getPayrollDisbursementAnalytics(tenantId: string, periodName: string = 'September 2026'): Promise<PayrollDisbursementAnalytics> {
    return {
      periodName,
      currency: 'USD',
      totalGrossDisbursed: 139500.0,
      totalNetDisbursed: 118240.5,
      totalTaxWithheld: 14210.25,
      totalProvidentFundContribution: 6975.0,
      totalAttendancePenalties: 74.25,
      departmentSummaries: [
        { department: 'Information Technology', headcount: 7, totalGross: 49500.0, totalNet: 41800.0 },
        { department: 'Accounts & Finance', headcount: 4, totalGross: 27000.0, totalNet: 22950.0 },
        { department: 'Human Resources', headcount: 4, totalGross: 24000.0, totalNet: 20400.0 },
        { department: 'Operations', headcount: 4, totalGross: 21000.0, totalNet: 17850.0 },
        { department: 'Sales & BD', headcount: 3, totalGross: 18000.0, totalNet: 15240.5 },
      ],
    };
  }

  static formatAsCsv(headers: string[], rows: (string | number)[][]): string {
    const headerLine = headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',');
    const dataLines = rows.map((r) =>
      r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')
    );
    return [headerLine, ...dataLines].join('\r\n');
  }

  static formatAsPrintHtml(title: string, metrics: any): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1e293b; }
    h1 { font-size: 24px; color: #0f172a; border-bottom: 2px solid #6366f1; padding-bottom: 8px; }
    .badge { background: #e0e7ff; color: #4338ca; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; }
    th { background: #f8fafc; font-weight: 600; }
  </style>
</head>
<body>
  <h1>AttendanceAI — ${title}</h1>
  <p>Generated on ${new Date().toUTCString()} | Multi-Tenant Verified Engine</p>
  <pre>${JSON.stringify(metrics, null, 2)}</pre>
</body>
</html>`;
  }

  static exportReport(data: any, format: ExportFormat, title: string = 'Executive_Report') {
    if (format === 'JSON') {
      return {
        contentType: 'application/json',
        filename: `${title.toLowerCase()}_${Date.now()}.json`,
        content: JSON.stringify(data, null, 2),
      };
    } else if (format === 'HTML_PDF') {
      return {
        contentType: 'text/html',
        filename: `${title.toLowerCase()}_${Date.now()}.html`,
        content: this.formatAsPrintHtml(title, data),
      };
    } else {
      // CSV
      const rows: (string | number)[][] = [];
      let headers: string[] = ['Metric', 'Value'];
      for (const [key, val] of Object.entries(data)) {
        if (typeof val !== 'object') {
          rows.push([key, String(val)]);
        }
      }
      return {
        contentType: 'text/csv',
        filename: `${title.toLowerCase()}_${Date.now()}.csv`,
        content: this.formatAsCsv(headers, rows),
      };
    }
  }
}
