import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DevicesService } from './devices.service.js';
import { QrService } from './qr.service.js';
import { sendResponse } from '../../common/response.js';
import { AttendanceAction, DeviceType } from '@prisma/client';

const registerDeviceSchema = z.object({
  branchId: z.string().uuid(),
  name: z.string().min(2),
  deviceCode: z.string().min(2).max(20).toUpperCase(),
  deviceType: z.nativeEnum(DeviceType),
  locationDescription: z.string().optional(),
  firmwareVersion: z.string().optional(),
});

const terminalPunchSchema = z.object({
  qrToken: z.string().optional(),
  barcode: z.string().optional(),
  eventType: z.nativeEnum(AttendanceAction).default(AttendanceAction.CHECK_IN),
  confidenceScore: z.number().min(0).max(1).optional(),
  snapshotUrl: z.string().url().optional(),
});

const generateQrSchema = z.object({
  employeeId: z.string().uuid(),
  expiresInSeconds: z.number().min(15).max(300).default(60),
});

export class DevicesController {
  public static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = registerDeviceSchema.parse(req.body);
      const result = await DevicesService.registerDevice(
        req.tenantId!,
        req.user!.id,
        payload
      );

      return sendResponse({
        res,
        statusCode: 201,
        message: 'Device provisioned successfully. Save this token; it will not be displayed again.',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  public static async heartbeat(req: Request, res: Response, next: NextFunction) {
    try {
      const token = (req.headers['x-device-token'] || req.body.token) as string;
      const ip = req.ip || req.socket.remoteAddress;
      const firmwareVersion = req.body.firmwareVersion;

      const result = await DevicesService.processHeartbeat(token, {
        ipAddress: ip,
        firmwareVersion,
      });

      return sendResponse({ res, data: result });
    } catch (error) {
      return next(error);
    }
  }

  public static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string | undefined;
      const devices = await DevicesService.listDevices(req.tenantId!, branchId);
      return sendResponse({ res, data: devices });
    } catch (error) {
      return next(error);
    }
  }

  public static async generateRotatingQr(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId, expiresInSeconds } = generateQrSchema.parse(req.body);
      const result = QrService.generateRotatingToken(
        req.tenantId!,
        employeeId,
        expiresInSeconds
      );

      return sendResponse({
        res,
        message: 'Dynamic QR token generated',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  public static async terminalPunch(req: Request, res: Response, next: NextFunction) {
    try {
      const token = (req.headers['x-device-token'] || req.body.deviceToken) as string;
      const payload = terminalPunchSchema.parse(req.body);

      const result = await DevicesService.processTerminalPunch(token, payload);

      return sendResponse({
        res,
        statusCode: 201,
        message: 'Terminal attendance punch registered successfully',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
