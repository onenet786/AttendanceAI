import crypto from 'crypto';
import { prisma } from '../../lib/prisma.js';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../common/errors.js';
import { DeviceStatus, DeviceType, AttendanceAction, AttendanceSource } from '@prisma/client';
import { AuditService } from '../audit/audit.service.js';
import { QrService } from './qr.service.js';
import { AttendanceService } from '../attendance/attendance.service.js';

export class DevicesService {
  /**
   * Registers a new physical device or terminal under a tenant branch.
   * Generates a high-entropy secret token (returned only once).
   */
  public static async registerDevice(
    tenantId: string,
    actorId: string,
    data: {
      branchId: string;
      name: string;
      deviceCode: string;
      deviceType: DeviceType;
      locationDescription?: string;
      firmwareVersion?: string;
    }
  ) {
    // Check duplicate code
    const existing = await prisma.device.findFirst({
      where: { tenantId, deviceCode: data.deviceCode },
    });

    if (existing) {
      throw new BadRequestError(`Device code '${data.deviceCode}' already exists in this organization`);
    }

    // Generate raw device API token
    const rawToken = `dtk_${tenantId.slice(0, 8)}_${crypto.randomBytes(24).toString('hex')}`;
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const device = await prisma.device.create({
      data: {
        tenantId,
        branchId: data.branchId,
        name: data.name,
        deviceCode: data.deviceCode,
        deviceType: data.deviceType,
        tokenHash,
        locationDescription: data.locationDescription,
        firmwareVersion: data.firmwareVersion || '1.0.0',
        status: DeviceStatus.ONLINE,
        lastHeartbeat: new Date(),
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
      },
    });

    await AuditService.log({
      tenantId,
      actorId,
      action: 'DEVICE_REGISTER',
      entity: 'Device',
      entityId: device.id,
      newValue: { name: device.name, deviceCode: device.deviceCode, deviceType: device.deviceType },
    });

    return {
      device,
      token: rawToken, // Displayed once to administrator during provisioning
    };
  }

  /**
   * Verifies incoming device raw token and updates heartbeat.
   */
  public static async authenticateDevice(rawToken: string) {
    if (!rawToken || typeof rawToken !== 'string') {
      throw new UnauthorizedError('Device authentication token is missing');
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const device = await prisma.device.findUnique({
      where: { tokenHash },
      include: { branch: true },
    });

    if (!device) {
      throw new UnauthorizedError('Invalid device authentication credentials');
    }

    if (device.status === DeviceStatus.ERROR) {
      throw new UnauthorizedError('Device has been decommissioned or locked by administrator');
    }

    // Update heartbeat
    await prisma.device.update({
      where: { id: device.id },
      data: {
        lastHeartbeat: new Date(),
        status: DeviceStatus.ONLINE,
      },
    });

    return device;
  }

  /**
   * Heartbeat ping endpoint for kiosk terminals
   */
  public static async processHeartbeat(
    rawToken: string,
    metadata?: { ipAddress?: string; firmwareVersion?: string }
  ) {
    const device = await this.authenticateDevice(rawToken);

    const updated = await prisma.device.update({
      where: { id: device.id },
      data: {
        lastHeartbeat: new Date(),
        status: DeviceStatus.ONLINE,
        ipAddress: metadata?.ipAddress || device.ipAddress,
        firmwareVersion: metadata?.firmwareVersion || device.firmwareVersion,
      },
    });

    return {
      status: 'ACK',
      deviceId: updated.id,
      name: updated.name,
      lastHeartbeat: updated.lastHeartbeat,
    };
  }

  /**
   * Lists devices with real-time online/offline computation (offline if > 120s without heartbeat)
   */
  public static async listDevices(tenantId: string, branchId?: string) {
    const devices = await prisma.device.findMany({
      where: {
        tenantId,
        ...(branchId ? { branchId } : {}),
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = Date.now();
    return devices.map((d) => {
      const isOnline = d.lastHeartbeat ? now - d.lastHeartbeat.getTime() < 120 * 1000 : false;
      const computedStatus = isOnline ? DeviceStatus.ONLINE : DeviceStatus.OFFLINE;

      return {
        id: d.id,
        name: d.name,
        deviceCode: d.deviceCode,
        deviceType: d.deviceType,
        branch: d.branch,
        ipAddress: d.ipAddress,
        firmwareVersion: d.firmwareVersion,
        locationDescription: d.locationDescription,
        status: computedStatus,
        lastHeartbeat: d.lastHeartbeat,
        createdAt: d.createdAt,
      };
    });
  }

  /**
   * Terminal Punch: Processes a hardware scan (QR or Barcode) from an authenticated device
   */
  public static async processTerminalPunch(
    deviceToken: string,
    data: {
      qrToken?: string;
      barcode?: string;
      eventType: AttendanceAction;
      confidenceScore?: number;
      snapshotUrl?: string;
    }
  ) {
    const device = await this.authenticateDevice(deviceToken);

    let employeeId: string | undefined;
    let source: AttendanceSource = AttendanceSource.QR;

    if (data.qrToken) {
      const verified = await QrService.verifyQrToken(device.tenantId, data.qrToken);
      employeeId = verified.employeeId;
      source = AttendanceSource.QR;
    } else if (data.barcode) {
      const employee = await prisma.employee.findFirst({
        where: { tenantId: device.tenantId, barcode: data.barcode },
      });
      if (!employee) throw new NotFoundError('No employee associated with this barcode');
      employeeId = employee.id;
      source = AttendanceSource.BARCODE;
    } else {
      throw new BadRequestError('Terminal scan requires either qrToken or barcode');
    }

    // Route to Central Attendance Engine
    return AttendanceService.recordPunch({
      tenantId: device.tenantId,
      employeeId,
      eventType: data.eventType,
      source,
      deviceId: device.id,
      branchId: device.branchId,
      confidenceScore: data.confidenceScore,
      snapshotUrl: data.snapshotUrl,
      verificationMethod: `${device.deviceType}_TERMINAL_SCAN`,
    });
  }
}
