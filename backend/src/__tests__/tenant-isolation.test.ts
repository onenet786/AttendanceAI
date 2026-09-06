import { describe, it, expect } from 'vitest';
import { enforceTenantIsolation } from '../middlewares/tenant.middleware.js';
import { ForbiddenError } from '../common/errors.js';

describe('Multi-Tenant Isolation Security Guard', () => {
  it('should allow request when user tenant matches tenant context', () => {
    const req: any = {
      user: {
        id: 'user-1',
        tenantId: 'tenant-aaa',
        isSuperAdmin: false,
      },
      headers: {
        'x-tenant-id': 'tenant-aaa',
      },
    };
    const res: any = {};
    let calledNext = false;
    const next = (err?: any) => {
      if (!err) calledNext = true;
    };

    enforceTenantIsolation(req, res, next);
    expect(calledNext).toBe(true);
    expect(req.tenantId).toBe('tenant-aaa');
  });

  it('should strictly reject request if tenant header attempts cross-tenant access to another tenant', () => {
    const req: any = {
      user: {
        id: 'user-1',
        tenantId: 'tenant-company-a',
        isSuperAdmin: false,
      },
      headers: {
        'x-tenant-id': 'tenant-company-b',
      },
    };
    const res: any = {};
    let errorPassed: any = null;
    const next = (err?: any) => {
      errorPassed = err;
    };

    enforceTenantIsolation(req, res, next);
    expect(errorPassed).toBeInstanceOf(ForbiddenError);
    expect(errorPassed.message).toContain('Tenant isolation violation');
  });

  it('should permit superadmin to inspect different tenants', () => {
    const req: any = {
      user: {
        id: 'super-admin-1',
        tenantId: 'tenant-platform',
        isSuperAdmin: true,
      },
      headers: {
        'x-tenant-id': 'tenant-company-b',
      },
    };
    const res: any = {};
    let calledNext = false;
    const next = (err?: any) => {
      if (!err) calledNext = true;
    };

    enforceTenantIsolation(req, res, next);
    expect(calledNext).toBe(true);
  });
});
