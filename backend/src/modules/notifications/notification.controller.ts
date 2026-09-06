import { Request, Response } from 'express';
import { NotificationService } from './notification.service.js';
import { sendResponse } from '../../common/response.js';

export class NotificationController {
  static async list(req: Request, res: Response) {
    const tenantId = (req as any).tenantId || 'demo-tenant-id';
    const notifs = await NotificationService.listNotifications(tenantId);
    return sendResponse({ res, data: notifs });
  }

  static async getUnreadCount(req: Request, res: Response) {
    const tenantId = (req as any).tenantId || 'demo-tenant-id';
    const count = await NotificationService.getUnreadCount(tenantId);
    return sendResponse({ res, data: { unreadCount: count } });
  }

  static async markRead(req: Request, res: Response) {
    const tenantId = (req as any).tenantId || 'demo-tenant-id';
    const { id } = req.params;
    const item = await NotificationService.markAsRead(tenantId, id);
    return sendResponse({ res, data: item });
  }

  static async markAllRead(req: Request, res: Response) {
    const tenantId = (req as any).tenantId || 'demo-tenant-id';
    const count = await NotificationService.markAllAsRead(tenantId);
    return sendResponse({ res, data: { markedReadCount: count } });
  }

  static async runWatchdog(req: Request, res: Response) {
    const tenantId = (req as any).tenantId || 'demo-tenant-id';
    const alerts = NotificationService.evaluateAttendanceWatchdog(tenantId);
    return sendResponse({ res, data: alerts });
  }

  static async registerWebhook(req: Request, res: Response) {
    const tenantId = (req as any).tenantId || 'demo-tenant-id';
    const { targetUrl, events } = req.body;
    const sub = NotificationService.registerWebhook(tenantId, targetUrl, events || ['*']);
    return sendResponse({ res, statusCode: 201, data: sub });
  }

  static async listWebhooks(req: Request, res: Response) {
    const tenantId = (req as any).tenantId || 'demo-tenant-id';
    const list = NotificationService.listWebhooks(tenantId);
    return sendResponse({ res, data: list });
  }
}
