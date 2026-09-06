import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { UnauthorizedError } from '../common/errors.js';
import { prisma } from '../lib/prisma.js';
import { AuthenticatedUser } from '../types/express.js';

interface JwtPayload {
  userId: string;
  tenantId: string;
  isSuperAdmin?: boolean;
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;

    // Fetch user with roles and permissions
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account is inactive or no longer exists');
    }

    // Extract roles and flat permissions list
    const roleNames: string[] = [];
    const permissionSet = new Set<string>();

    for (const ur of user.userRoles) {
      roleNames.push(ur.role.name);
      for (const rp of ur.role.permissions) {
        permissionSet.add(rp.permission.action);
      }
    }

    const authUser: AuthenticatedUser = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isSuperAdmin: user.isSuperAdmin,
      roles: roleNames,
      permissions: Array.from(permissionSet),
    };

    req.user = authUser;
    req.tenantId = user.tenantId;

    return next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token has expired'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid token signature'));
    }
    return next(err);
  }
}
