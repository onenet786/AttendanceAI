import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service.js';
import { sendResponse } from '../../common/response.js';

export class AnalyticsController {
  static async getAttendanceAnalytics(req: Request, res: Response) {
    const tenantId = (req as any).tenantId || 'demo-tenant-id';
    const month = (req.query.month as string) || '2026-09';
    const data = await AnalyticsService.getExecutiveAttendanceAnalytics(tenantId, month);
    return sendResponse({ res, data });
  }

  static async getPayrollAnalytics(req: Request, res: Response) {
    const tenantId = (req as any).tenantId || 'demo-tenant-id';
    const period = (req.query.period as string) || 'September 2026';
    const data = await AnalyticsService.getPayrollDisbursementAnalytics(tenantId, period);
    return sendResponse({ res, data });
  }

  static async export(req: Request, res: Response) {
    const tenantId = (req as any).tenantId || 'demo-tenant-id';
    const type = (req.query.type as string) || 'attendance';
    const format = ((req.query.format as string) || 'CSV').toUpperCase() as any;

    let payload: any;
    let title: string;
    if (type === 'payroll') {
      payload = await AnalyticsService.getPayrollDisbursementAnalytics(tenantId);
      title = 'Payroll_Disbursement_Analytics';
    } else {
      payload = await AnalyticsService.getExecutiveAttendanceAnalytics(tenantId);
      title = 'Executive_Attendance_Report';
    }

    const exportResult = AnalyticsService.exportReport(payload, format, title);
    res.setHeader('Content-Type', exportResult.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
    return res.send(exportResult.content);
  }
}
