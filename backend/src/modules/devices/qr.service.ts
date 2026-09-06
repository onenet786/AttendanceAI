import crypto from 'crypto';
import { prisma } from '../../lib/prisma.js';
import { BadRequestError, UnauthorizedError } from '../../common/errors.js';
import { config } from '../../config/index.js';

interface RotatingPayload {
  tId: string;   // tenantId
  eId: string;   // employeeId
  exp: number;   // unix timestamp in seconds
  nonce: string; // unique random nonce
}

// In-memory anti-replay cache for rotating tokens (stores used nonces until token expiry)
const usedNonces = new Map<string, number>();

// Clean up expired nonces every 60 seconds
setInterval(() => {
  const now = Math.floor(Date.now() / 1000);
  for (const [nonce, expiry] of usedNonces.entries()) {
    if (now > expiry) {
      usedNonces.delete(nonce);
    }
  }
}, 60000);

export class QrService {
  private static getSecret(): string {
    return config.JWT_SECRET || 'fallback_qr_secret_key_change_in_production';
  }

  /**
   * Generates a permanent opaque badge QR token for an employee badge
   */
  public static generatePermanentToken(tenantId: string, employeeCode: string): string {
    const raw = `QR_PERM_${tenantId.slice(0, 8)}_${employeeCode}_${crypto.randomBytes(12).toString('hex')}`;
    return raw;
  }

  /**
   * Generates an HMAC-SHA256 signed rotating QR code with expiration (default 60s)
   */
  public static generateRotatingToken(
    tenantId: string,
    employeeId: string,
    expiresInSeconds: number = 60
  ): { token: string; expiresAt: string; secondsRemaining: number } {
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const nonce = crypto.randomBytes(8).toString('hex');

    const payload: RotatingPayload = {
      tId: tenantId,
      eId: employeeId,
      exp,
      nonce,
    };

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.getSecret())
      .update(payloadBase64)
      .digest('base64url');

    const token = `QR_ROT_${payloadBase64}.${signature}`;

    return {
      token,
      expiresAt: new Date(exp * 1000).toISOString(),
      secondsRemaining: expiresInSeconds,
    };
  }

  /**
   * Verifies an incoming QR token (either permanent badge token or dynamic rotating token)
   * Enforces HMAC validation, expiration checks, and anti-replay protection.
   */
  public static async verifyQrToken(
    tenantId: string,
    tokenString: string
  ): Promise<{ employeeId: string; isRotating: boolean }> {
    if (!tokenString || typeof tokenString !== 'string') {
      throw new BadRequestError('Invalid QR token format');
    }

    // 1. Check if it's a dynamic rotating token
    if (tokenString.startsWith('QR_ROT_')) {
      const parts = tokenString.replace('QR_ROT_', '').split('.');
      if (parts.length !== 2) {
        throw new BadRequestError('Malformed rotating QR token structure');
      }

      const [payloadBase64, providedSignature] = parts;

      // Verify cryptographic signature
      const expectedSignature = crypto
        .createHmac('sha256', this.getSecret())
        .update(payloadBase64)
        .digest('base64url');

      if (providedSignature !== expectedSignature) {
        throw new UnauthorizedError('Cryptographic signature mismatch. Possible tampered QR code.');
      }

      let payload: RotatingPayload;
      try {
        payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
      } catch (e) {
        throw new BadRequestError('Invalid payload encoding in rotating QR token');
      }

      // Check tenant match
      if (payload.tId !== tenantId) {
        throw new UnauthorizedError('Cross-tenant QR code access is strictly prohibited');
      }

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (now > payload.exp) {
        throw new UnauthorizedError('Rotating QR code has expired. Please refresh your screen.');
      }

      // Anti-replay check: ensure nonce hasn't been used before
      if (usedNonces.has(payload.nonce)) {
        throw new UnauthorizedError('Replay attack detected: This rotating QR code has already been scanned.');
      }

      // Mark nonce as used until its expiration time
      usedNonces.set(payload.nonce, payload.exp);

      return {
        employeeId: payload.eId,
        isRotating: true,
      };
    }

    // 2. Permanent badge token resolution
    const employee = await prisma.employee.findFirst({
      where: {
        tenantId,
        qrToken: tokenString,
      },
      select: { id: true, status: true },
    });

    if (!employee) {
      throw new BadRequestError('Unrecognized or invalid permanent employee QR badge');
    }

    if (employee.status !== 'ACTIVE') {
      throw new UnauthorizedError(`Employee account is currently ${employee.status}`);
    }

    return {
      employeeId: employee.id,
      isRotating: false,
    };
  }
}
