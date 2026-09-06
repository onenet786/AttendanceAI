import { Request, Response } from 'express';
import { TasksService } from './tasks.service.js';
import { sendResponse } from '../../common/response.js';

export class TasksController {
  static async listProjects(req: Request, res: Response) {
    const tenantId = (req as any).tenantId || 'demo-tenant-id';
    const projects = await TasksService.listProjects(tenantId);
    return sendResponse({ res, data: projects });
  }

  static async createProject(req: Request, res: Response) {
    const tenantId = (req as any).tenantId || 'demo-tenant-id';
    const companyId = (req as any).companyId || 'demo-company-id';
    const project = await TasksService.createProject(tenantId, companyId, req.body);
    return sendResponse({ res, statusCode: 201, data: project });
  }

  static async listTasks(req: Request, res: Response) {
    const tenantId = (req as any).tenantId || 'demo-tenant-id';
    const projectId = req.query.projectId as string | undefined;
    const tasks = await TasksService.listTasks(tenantId, projectId);
    return sendResponse({ res, data: tasks });
  }

  static async createTask(req: Request, res: Response) {
    const tenantId = (req as any).tenantId || 'demo-tenant-id';
    const creatorId = (req as any).userId || 'admin-user-id';
    const task = await TasksService.createTask(tenantId, creatorId, req.body);
    return sendResponse({ res, statusCode: 201, data: task });
  }

  static async updateStatus(req: Request, res: Response) {
    const tenantId = (req as any).tenantId || 'demo-tenant-id';
    const { taskId } = req.params;
    const { status } = req.body;
    const updated = await TasksService.updateTaskStatus(tenantId, taskId, status);
    return sendResponse({ res, data: updated });
  }

  static async logTime(req: Request, res: Response) {
    const tenantId = (req as any).tenantId || 'demo-tenant-id';
    const entry = await TasksService.logTaskTime(tenantId, req.body);
    return sendResponse({ res, statusCode: 201, data: entry });
  }

  static async reconcile(req: Request, res: Response) {
    const tenantId = (req as any).tenantId || 'demo-tenant-id';
    const employeeId = req.query.employeeId as string || 'emp-001';
    const date = req.query.date as string || new Date().toISOString().split('T')[0];
    const clockedHours = Number(req.query.clockedHours || 8.0);
    const result = await TasksService.reconcileAttendanceWithTasks(tenantId, employeeId, date, clockedHours);
    return sendResponse({ res, data: result });
  }
}
