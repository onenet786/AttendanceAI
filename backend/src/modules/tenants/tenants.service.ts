import { prisma } from '../../lib/prisma.js';
import { AuditService } from '../audit/audit.service.js';

export class TenantService {
  public static async getCompanies(tenantId: string) {
    return prisma.company.findMany({
      where: { tenantId },
      include: {
        branches: true,
        departments: true,
      },
    });
  }

  public static async getBranches(tenantId: string) {
    return prisma.branch.findMany({
      where: { tenantId },
      include: {
        company: { select: { id: true, name: true } },
        _count: {
          select: { employees: true, devices: true, cameras: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  public static async createBranch(
    tenantId: string,
    actorId: string,
    data: {
      companyId: string;
      name: string;
      code: string;
      address?: string;
      city?: string;
      country?: string;
      latitude?: number;
      longitude?: number;
      geofenceRadius?: number;
      isHeadquarters?: boolean;
    }
  ) {
    const branch = await prisma.branch.create({
      data: {
        tenantId,
        ...data,
      },
    });

    await AuditService.log({
      tenantId,
      actorId,
      action: 'BRANCH_CREATE',
      entity: 'Branch',
      entityId: branch.id,
      newValue: branch,
    });

    return branch;
  }

  public static async getDepartments(tenantId: string, branchId?: string) {
    return prisma.department.findMany({
      where: {
        tenantId,
        ...(branchId ? { branchId } : {}),
      },
      include: {
        teams: true,
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  public static async getDesignations(tenantId: string) {
    return prisma.designation.findMany({
      where: { tenantId },
      orderBy: { level: 'asc' },
    });
  }

  public static async getShifts(tenantId: string) {
    return prisma.shift.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }
}
