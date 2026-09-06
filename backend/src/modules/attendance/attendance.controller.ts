import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AttendanceService } from './attendance.service.js';
import { ReportsService } from './reports.service.js';
import { sendResponse } from '../../common/response.js';
import { AttendanceAction, AttendanceSource, DailyStatus } from '@prisma/client';

const recordPunchSchema = z.object({
  employeeId: z.string().uuid().optional(),
  qrToken: z.string().optional(),
  barcode: z.string().optional(),
  eventType: z.nativeEnum(AttendanceAction),
  source: z.nativeEnum(AttendanceSource),
  deviceId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
  snapshotUrl: z.string().url().optional(),
  verificationMethod: z.string().optional(),
  remarks: z.string().optional(),
});

const correctionSchema = z.object({
  employeeId: z.string().uuid(),
  eventType: z.nativeEnum(AttendanceAction),
  timestamp: z.string().datetime().transform((val) => new Date(val)),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

export class AttendanceController {
  public static async punch(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = recordPunchSchema.parse(req.body);
      const result = await AttendanceService.recordPunch({
        tenantId: req.tenantId!,
        createdById: req.user?.id,
        ...payload,
      });

      return sendResponse({
        res,
        statusCode: 201,
        message: 'Attendance event processed successfully',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  public static async correct(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = correctionSchema.parse(req.body);
      const result = await AttendanceService.requestCorrection(
        req.tenantId!,
        req.user!.id,
        payload
      );

      return sendResponse({
        res,
        statusCode: 200,
        message: 'Attendance punch corrected and re-calculated successfully',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  public static async getEmployeeTimeline(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;
      const { date } = req.query;

      const timeline = await AttendanceService.getEmployeeTimeline(
        req.tenantId!,
        employeeId,
        date as string | undefined
      );

      return sendResponse({ res, data: timeline });
    } catch (error) {
      return next(error);
    }
  }

  public static async getLiveSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string | undefined;
      const summary = await AttendanceService.getLiveSummary(req.tenantId!, branchId);
      return sendResponse({ res, data: summary });
    } catch (error) {
      return next(error);
    }
  }

  public static async getRecentEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const events = await AttendanceService.getRecentEvents(req.tenantId!, limit);
      return sendResponse({ res, data: events });
    } catch (error) {
      return next(error);
    }
  }

  public static async getDailyRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const { date, branchId } = req.query;
      const records = await AttendanceService.getDailyRecords(
        req.tenantId!,
        date as string | undefined,
        branchId as string | undefined
      );
      return sendResponse({ res, data: records });
    } catch (error) {
      return next(error);
    }
  }

  // Reporting Endpoints
  public static async getDailyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { date, branchId, departmentId, status } = req.query;
      const report = await ReportsService.getDailyReport(req.tenantId!, {
        date: date as string,
        branchId: branchId as string,
        departmentId: departmentId as string,
        status: status as DailyStatus,
      });
      return sendResponse({ res, data: report });
    } catch (error) {
      return next(error);
    }
  }

  public static async getMonthlyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { year, month, branchId, departmentId } = req.query;
      const report = await ReportsService.getMonthlyReport(req.tenantId!, {
        year: year ? parseInt(year as string, 10) : undefined,
        month: month ? parseInt(month as string, 10) : undefined,
        branchId: branchId as string,
        departmentId: departmentId as string,
      });
      return sendResponse({ res, data: report });
    } catch (error) {
      return next(error);
    }
  }

  public static async getExceptionsReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, branchId } = req.query;
      const exceptions = await ReportsService.getExceptionsReport(req.tenantId!, {
        startDate: startDate as string,
        endDate: endDate as string,
        branchId: branchId as string,
      });
      return sendResponse({ res, data: exceptions });
    } catch (error) {
      return next(error);
    }
  }

  public static async exportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const { date, branchId, departmentId } = req.query;
      const csvData = await ReportsService.exportAttendanceCsv(req.tenantId!, {
        date: date as string,
        branchId: branchId as string,
        departmentId: departmentId as string,
      });

      const filename = `attendance-report-${date || new Date().toISOString().split('T')[0]}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csvData);
    } catch (error) {
      return next(error);
    }
  }
}
