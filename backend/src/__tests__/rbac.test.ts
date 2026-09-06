import { describe, it, expect } from 'vitest';
import { requirePermissions, requireRoles } from '../middlewares/rbac.middleware.js';
import { ForbiddenError, UnauthorizedError } from '../common/errors.js';

describe('RBAC Middleware', () => {
  it('should throw UnauthorizedError if user is not attached to request', () => {
    const req: any = {};
    const res: any = {};
    let errorPassed: any = null;
    const next = (err?: any) => {
      errorPassed = err;
    };

    requirePermissions('employee.view')(req, res, next);
    expect(errorPassed).toBeInstanceOf(UnauthorizedError);
  });

  it('should grant access if user has required permissions', () => {
    const req: any = {
      user: {
        id: 'u1',
        isSuperAdmin: false,
        permissions: ['employee.view', 'attendance.create'],
      },
    };
    const res: any = {};
    let calledNext = false;
    const next = (err?: any) => {
      if (!err) calledNext = true;
    };

    requirePermissions('employee.view')(req, res, next);
    expect(calledNext).toBe(true);
  });

  it('should deny access if user lacks one of the required permissions', () => {
    const req: any = {
      user: {
        id: 'u1',
        isSuperAdmin: false,
        permissions: ['employee.view'],
      },
    };
    const res: any = {};
    let errorPassed: any = null;
    const next = (err?: any) => {
      errorPassed = err;
    };

    requirePermissions('employee.view', 'payroll.process')(req, res, next);
    expect(errorPassed).toBeInstanceOf(ForbiddenError);
    expect(errorPassed.message).toContain('payroll.process');
  });

  it('should always allow superadmin', () => {
    const req: any = {
      user: {
        id: 'super-user',
        isSuperAdmin: true,
        permissions: [],
      },
    };
    const res: any = {};
    let calledNext = false;
    const next = (err?: any) => {
      if (!err) calledNext = true;
    };

    requireRoles('Company Admin')(req, res, next);
    expect(calledNext).toBe(true);
  });
});
