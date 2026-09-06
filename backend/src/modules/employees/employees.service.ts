import crypto from 'crypto';
import { prisma } from '../../lib/prisma.js';
import { ConflictError, NotFoundError } from '../../common/errors.js';
import { AuditService } from '../audit/audit.service.js';
import { EmployeeStatus, EmploymentType, Gender } from '@prisma/client';

export interface EmployeeFilterQuery {
  search?: string;
  branchId?: string;
  departmentId?: string;
  status?: EmployeeStatus;
  page?: number;
  limit?: number;
}

export class EmployeeService {
  public static async getEmployees(tenantId: string, query: EmployeeFilterQuery) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.departmentId ? { departmentId: query.departmentId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { firstName: { contains: s, mode: 'insensitive' } },
        { lastName: { contains: s, mode: 'insensitive' } },
        { employeeCode: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        include: {
          branch: { select: { id: true, name: true, code: true } },
          department: { select: { id: true, name: true } },
          designation: { select: { id: true, title: true } },
          shift: { select: { id: true, name: true, startTime: true, endTime: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public static async getEmployeeById(tenantId: string, id: string) {
    const employee = await prisma.employee.findFirst({
      where: { id, tenantId },
      include: {
        branch: true,
        department: true,
        team: true,
        designation: true,
        shift: true,
        manager: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true },
        },
        history: {
          orderBy: { effectiveDate: 'desc' },
          take: 10,
        },
        salaryStructure: true,
        documents: true,
      },
    });

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    return employee;
  }

  public static async createEmployee(
    tenantId: string,
    actorId: string,
    data: {
      companyId: string;
      branchId: string;
      departmentId: string;
      teamId?: string;
      designationId: string;
      employeeCode: string;
      firstName: string;
      lastName: string;
      fatherSpouseName?: string;
      gender?: Gender;
      dateOfBirth?: Date;
      nationalId?: string;
      photoUrl?: string;
      email: string;
      phone: string;
      address?: string;
      joiningDate: Date;
      employmentType?: EmploymentType;
      shiftId?: string;
      managerId?: string;
      bankName?: string;
      bankAccountNumber?: string;
      iban?: string;
    }
  ) {
    // Check duplicate code within tenant
    const existing = await prisma.employee.findFirst({
      where: { tenantId, employeeCode: data.employeeCode },
    });

    if (existing) {
      throw new ConflictError(`Employee with code ${data.employeeCode} already exists in this organization`);
    }

    // Generate permanent cryptographically signed QR token & barcode
    const qrToken = `QR_${tenantId.slice(0, 8)}_${data.employeeCode}_${crypto.randomBytes(8).toString('hex')}`;
    const barcode = `BC${data.employeeCode.replace(/\D/g, '').padStart(6, '0')}`;

    const employee = await prisma.employee.create({
      data: {
        tenantId,
        ...data,
        qrToken,
        barcode,
        status: EmployeeStatus.ACTIVE,
      },
      include: {
        branch: true,
        department: true,
        designation: true,
      },
    });

    // Record in Employee History
    await prisma.employeeHistory.create({
      data: {
        tenantId,
        employeeId: employee.id,
        eventType: 'HIRED',
        newValue: `Hired as ${employee.designation.title} in ${employee.department.name}`,
        effectiveDate: data.joiningDate,
        createdById: actorId,
      },
    });

    // Audit log
    await AuditService.log({
      tenantId,
      actorId,
      action: 'EMPLOYEE_CREATE',
      entity: 'Employee',
      entityId: employee.id,
      newValue: employee,
    });

    return employee;
  }

  public static async updateEmployee(
    tenantId: string,
    id: string,
    actorId: string,
    updateData: any
  ) {
    const existing = await prisma.employee.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundError('Employee not found');
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: updateData,
      include: {
        branch: true,
        department: true,
        designation: true,
      },
    });

    // If status changed, record in history
    if (updateData.status && updateData.status !== existing.status) {
      await prisma.employeeHistory.create({
        data: {
          tenantId,
          employeeId: id,
          eventType: 'STATUS_CHANGE',
          previousValue: existing.status,
          newValue: updateData.status,
          effectiveDate: new Date(),
          remarks: 'Status updated via admin panel',
          createdById: actorId,
        },
      });
    }

    await AuditService.log({
      tenantId,
      actorId,
      action: 'EMPLOYEE_UPDATE',
      entity: 'Employee',
      entityId: id,
      oldValue: existing,
      newValue: updated,
    });

    return updated;
  }
}
