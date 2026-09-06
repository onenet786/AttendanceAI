import { Request, Response, NextFunction } from 'express';
import { PayrollService } from './payroll.service.js';

export class PayrollController {
  /**
   * Define or update employee salary structure
   */
  async upsertStructure(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
      const structure = await PayrollService.upsertSalaryStructure(tenantId, req.body);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Salary structure updated successfully',
        data: structure,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get salary structure for employee
   */
  async getStructure(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
      const { employeeId } = req.params;
      const structure = await PayrollService.getSalaryStructure(tenantId, employeeId);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: structure,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new payroll accounting period
   */
  async createPeriod(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
      const period = await PayrollService.createPayrollPeriod(tenantId, req.body);

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Payroll period created successfully',
        data: period,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Execute monthly payroll run for a period
   */
  async executeRun(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
      const { id } = req.params;
      const summary = await PayrollService.executePayrollRun(tenantId, id);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Monthly payroll batch calculated successfully',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lock a payroll period permanently
   */
  async lockPeriod(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
      const { id } = req.params;
      const approverId = req.user?.id || 'admin-user';
      const locked = await PayrollService.lockPayrollPeriod(tenantId, id, approverId);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Payroll period locked and finalized',
        data: locked,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List payslips for a specific period
   */
  async getPayslips(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant';
      const { id } = req.params;
      const payslips = await PayrollService.getPeriodPayslips(tenantId, id);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: payslips,
      });
    } catch (error) {
      next(error);
    }
  }
}
