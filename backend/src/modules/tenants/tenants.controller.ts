import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TenantService } from './tenants.service.js';
import { sendResponse } from '../../common/response.js';

const createBranchSchema = z.object({
  companyId: z.string().uuid(),
  name: z.string().min(2),
  code: z.string().min(2).max(10).toUpperCase(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  geofenceRadius: z.number().min(10).default(200),
  isHeadquarters: z.boolean().default(false),
});

export class TenantController {
  public static async getCompanies(req: Request, res: Response, next: NextFunction) {
    try {
      const companies = await TenantService.getCompanies(req.tenantId!);
      return sendResponse({ res, data: companies });
    } catch (error) {
      return next(error);
    }
  }

  public static async getBranches(req: Request, res: Response, next: NextFunction) {
    try {
      const branches = await TenantService.getBranches(req.tenantId!);
      return sendResponse({ res, data: branches });
    } catch (error) {
      return next(error);
    }
  }

  public static async createBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = createBranchSchema.parse(req.body);
      const branch = await TenantService.createBranch(req.tenantId!, req.user!.id, payload);
      return sendResponse({ res, statusCode: 201, message: 'Branch created successfully', data: branch });
    } catch (error) {
      return next(error);
    }
  }

  public static async getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string | undefined;
      const departments = await TenantService.getDepartments(req.tenantId!, branchId);
      return sendResponse({ res, data: departments });
    } catch (error) {
      return next(error);
    }
  }

  public static async getDesignations(req: Request, res: Response, next: NextFunction) {
    try {
      const designations = await TenantService.getDesignations(req.tenantId!);
      return sendResponse({ res, data: designations });
    } catch (error) {
      return next(error);
    }
  }

  public static async getShifts(req: Request, res: Response, next: NextFunction) {
    try {
      const shifts = await TenantService.getShifts(req.tenantId!);
      return sendResponse({ res, data: shifts });
    } catch (error) {
      return next(error);
    }
  }
}
