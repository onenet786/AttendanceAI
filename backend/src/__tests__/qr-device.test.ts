import { describe, it, expect } from 'vitest';
import { QrService } from '../modules/devices/qr.service.js';
import { UnauthorizedError } from '../common/errors.js';

describe('QR Code Subsystem: Cryptographic Rotating Tokens & Anti-Replay', () => {
  const tenantId = 'tenant-test-123';
  const employeeId = 'emp-456';

  it('should successfully generate and verify a valid dynamic rotating QR token', async () => {
    const { token, secondsRemaining } = QrService.generateRotatingToken(tenantId, employeeId, 60);

    expect(token).toMatch(/^QR_ROT_/);
    expect(secondsRemaining).toBe(60);

    const verified = await QrService.verifyQrToken(tenantId, token);
    expect(verified.employeeId).toBe(employeeId);
    expect(verified.isRotating).toBe(true);
  });

  it('should reject a rotating token that has expired', async () => {
    // Generate token with negative duration (already expired)
    const { token } = QrService.generateRotatingToken(tenantId, employeeId, -5);

    await expect(QrService.verifyQrToken(tenantId, token)).rejects.toThrow(
      'Rotating QR code has expired'
    );
  });

  it('should reject tampered or modified rotating tokens', async () => {
    const { token } = QrService.generateRotatingToken(tenantId, employeeId, 60);
    // Alter the signature
    const tamperedToken = token.slice(0, -3) + 'XYZ';

    await expect(QrService.verifyQrToken(tenantId, tamperedToken)).rejects.toThrow(
      UnauthorizedError
    );
  });

  it('should reject cross-tenant token scans', async () => {
    const { token } = QrService.generateRotatingToken('tenant-A', employeeId, 60);

    // Attempt to verify under tenant-B
    await expect(QrService.verifyQrToken('tenant-B', token)).rejects.toThrow(
      'Cross-tenant QR code access is strictly prohibited'
    );
  });

  it('should prevent replay attacks by rejecting a second scan of the same rotating token', async () => {
    const { token } = QrService.generateRotatingToken(tenantId, employeeId, 60);

    // First scan: should succeed
    const firstScan = await QrService.verifyQrToken(tenantId, token);
    expect(firstScan.employeeId).toBe(employeeId);

    // Second scan (replay attack): must fail
    await expect(QrService.verifyQrToken(tenantId, token)).rejects.toThrow(
      'Replay attack detected'
    );
  });
});
