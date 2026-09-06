import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../common/errors.js';

export function enforceTenantIsolation(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new UnauthorizedError('Tenant isolation requires an authenticated user context'));
  }

  const headerTenantId = req.headers['x-tenant-id'] as string | undefined;

  // If header is provided, it must match user's assigned tenant, unless superadmin
  if (headerTenantId && headerTenantId !== req.user.tenantId && !req.user.isSuperAdmin) {
    return next(new ForbiddenError('Tenant isolation violation: Cannot access data from another tenant'));
  }

  req.tenantId = req.user.tenantId;
  return next();
}
