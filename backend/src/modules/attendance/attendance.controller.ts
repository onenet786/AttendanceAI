import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AttendanceService } from './attendance.service.js';
import { sendResponse } from '../../common/response.js';
import { AttendanceAction, AttendanceSource } from '@prisma/client';

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
}
