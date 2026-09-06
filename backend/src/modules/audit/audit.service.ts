import { prisma } from '../../lib/prisma.js';

interface CreateAuditLogParams {
  tenantId: string;
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
}

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'refreshtoken',
  'secret',
  'twofactorsecret',
  'rtspurlencrypted',
]);

function redactSensitiveData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = redactSensitiveData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export class AuditService {
  public static async log({
    tenantId,
    actorId,
    action,
    entity,
    entityId,
    oldValue,
    newValue,
    ipAddress,
    userAgent,
  }: CreateAuditLogParams) {
    try {
      return await prisma.auditLog.create({
        data: {
          tenantId,
          actorId,
          action,
          entity,
          entityId,
          oldValue: oldValue ? JSON.stringify(redactSensitiveData(oldValue)) : null,
          newValue: newValue ? JSON.stringify(redactSensitiveData(newValue)) : null,
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      // Never crash the primary request if audit logging encounters a database hiccup,
      // but log an error to standard error for monitoring
      console.error('[AuditService Error]: Failed to write audit log entry', error);
      return null;
    }
  }
}
