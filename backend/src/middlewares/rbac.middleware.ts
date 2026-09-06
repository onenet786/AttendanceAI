import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../common/errors.js';

export function requirePermissions(...requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (req.user.isSuperAdmin) {
      return next();
    }

    const userPermissions = new Set(req.user.permissions);
    const hasAll = requiredPermissions.every((perm) => userPermissions.has(perm));

    if (!hasAll) {
      return next(
        new ForbiddenError(
          `Permission denied. Missing required permission(s): ${requiredPermissions
            .filter((p) => !userPermissions.has(p))
            .join(', ')}`
        )
      );
    }

    return next();
  };
}

export function requireRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (req.user.isSuperAdmin) {
      return next();
    }

    const userRoles = new Set(req.user.roles);
    const hasRole = allowedRoles.some((role) => userRoles.has(role));

    if (!hasRole) {
      return next(new ForbiddenError(`Access denied. Requires one of: ${allowedRoles.join(', ')}`));
    }

    return next();
  };
}
