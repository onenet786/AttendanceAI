import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma.js';
import { sendResponse } from '../../common/response.js';

export class AuditController {
  public static async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
      const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '25', 10)));
      const skip = (page - 1) * limit;

      const where: any = { tenantId: req.tenantId! };
      if (req.query.entity) where.entity = req.query.entity;
      if (req.query.action) where.action = req.query.action;

      const [total, items] = await Promise.all([
        prisma.auditLog.count({ where }),
        prisma.auditLog.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      return sendResponse({
        res,
        data: items,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}
