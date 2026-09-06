import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { EmployeeService } from './employees.service.js';
import { sendResponse } from '../../common/response.js';
import { EmployeeStatus, EmploymentType, Gender } from '@prisma/client';

const createEmployeeSchema = z.object({
  companyId: z.string().uuid(),
  branchId: z.string().uuid(),
  departmentId: z.string().uuid(),
  teamId: z.string().uuid().optional(),
  designationId: z.string().uuid(),
  employeeCode: z.string().min(2).max(20),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  fatherSpouseName: z.string().optional(),
  gender: z.nativeEnum(Gender).default(Gender.MALE),
  dateOfBirth: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
  nationalId: z.string().optional(),
  photoUrl: z.string().url().optional(),
  email: z.string().email(),
  phone: z.string().min(7),
  address: z.string().optional(),
  joiningDate: z.string().datetime().transform((val) => new Date(val)),
  employmentType: z.nativeEnum(EmploymentType).default(EmploymentType.FULL_TIME),
  shiftId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  iban: z.string().optional(),
});

export class EmployeeController {
  public static async getEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, branchId, departmentId, status, page, limit } = req.query;

      const result = await EmployeeService.getEmployees(req.tenantId!, {
        search: search as string,
        branchId: branchId as string,
        departmentId: departmentId as string,
        status: status as EmployeeStatus,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      return sendResponse({
        res,
        data: result.items,
        meta: result.meta,
      });
    } catch (error) {
      return next(error);
    }
  }

  public static async getEmployeeById(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await EmployeeService.getEmployeeById(req.tenantId!, req.params.id);
      return sendResponse({ res, data: employee });
    } catch (error) {
      return next(error);
    }
  }

  public static async createEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = createEmployeeSchema.parse(req.body);
      const employee = await EmployeeService.createEmployee(
        req.tenantId!,
        req.user!.id,
        payload
      );

      return sendResponse({
        res,
        statusCode: 201,
        message: 'Employee created successfully',
        data: employee,
      });
    } catch (error) {
      return next(error);
    }
  }

  public static async updateEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await EmployeeService.updateEmployee(
        req.tenantId!,
        req.params.id,
        req.user!.id,
        req.body
      );

      return sendResponse({
        res,
        message: 'Employee updated successfully',
        data: updated,
      });
    } catch (error) {
      return next(error);
    }
  }
}
