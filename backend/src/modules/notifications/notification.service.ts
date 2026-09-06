import crypto from 'crypto';
import {
  AppNotification,
  WebhookSubscription,
  AttendanceWatchdogEvent,
  NotificationSeverity,
} from './notification.types.js';

// In-memory cache for notifications & webhook subscriptions
const notificationCache = new Map<string, AppNotification[]>();
const webhookCache = new Map<string, WebhookSubscription[]>();

export class NotificationService {
  static getInitialNotifications(tenantId: string): AppNotification[] {
    return [
      {
        id: 'notif-001',
        tenantId,
        type: 'ATTENDANCE_BREACH',
        title: 'Consecutive Absence Detected',
        message: 'Employee Usman Tariq (EMP-014) has not recorded a punch for 2 consecutive business days.',
        severity: 'CRITICAL',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      },
      {
        id: 'notif-002',
        tenantId,
        type: 'OVERTIME_THRESHOLD',
        title: 'Weekly Overtime Exceeded (10h+)',
        message: 'Bilal Hassan (EMP-002) has logged 11.5 hours of overtime this week. Requires HR approval.',
        severity: 'WARNING',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      },
      {
        id: 'notif-003',
        tenantId,
        type: 'PAYROLL_SEALED',
        title: 'September 2026 Payroll Period Finalized',
        message: 'Super Admin locked the payroll period ledger. Net disbursement of $118,240.50 authorized.',
        severity: 'INFO',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      },
      {
        id: 'notif-004',
        tenantId,
        type: 'GATEWAY_OFFLINE',
        title: 'Edge Gateway Heartbeat Verified',
        message: 'All 6 IP CCTV cameras & Gateways in Lahore and Islamabad are reporting healthy RTSP streams.',
        severity: 'INFO',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
      },
    ];
  }

  static async listNotifications(tenantId: string): Promise<AppNotification[]> {
    if (!notificationCache.has(tenantId)) {
      notificationCache.set(tenantId, this.getInitialNotifications(tenantId));
    }
    return notificationCache.get(tenantId)!;
  }

  static async getUnreadCount(tenantId: string): Promise<number> {
    const list = await this.listNotifications(tenantId);
    return list.filter((n) => !n.isRead).length;
  }

  static async markAsRead(tenantId: string, notificationId: string): Promise<AppNotification | null> {
    const list = await this.listNotifications(tenantId);
    const item = list.find((n) => n.id === notificationId);
    if (item) {
      item.isRead = true;
      return item;
    }
    return null;
  }

  static async markAllAsRead(tenantId: string): Promise<number> {
    const list = await this.listNotifications(tenantId);
    let count = 0;
    list.forEach((n) => {
      if (!n.isRead) {
        n.isRead = true;
        count++;
      }
    });
    return count;
  }

  static async createNotification(
    tenantId: string,
    params: {
      type: AppNotification['type'];
      title: string;
      message: string;
      severity: NotificationSeverity;
      metadata?: Record<string, any>;
    }
  ): Promise<AppNotification> {
    const list = await this.listNotifications(tenantId);
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      tenantId,
      type: params.type,
      title: params.title,
      message: params.message,
      severity: params.severity,
      isRead: false,
      metadata: params.metadata,
      createdAt: new Date().toISOString(),
    };
    notificationCache.set(tenantId, [newNotif, ...list]);
    return newNotif;
  }

  // --------------------------------------------------------------------------
  // AUTOMATED ATTENDANCE WATCHDOG
  // --------------------------------------------------------------------------
  static evaluateAttendanceWatchdog(tenantId: string): AttendanceWatchdogEvent[] {
    const watchdogAlerts: AttendanceWatchdogEvent[] = [
      {
        rule: 'CONSECUTIVE_ABSENCE',
        employeeId: 'EMP-014',
        employeeName: 'Usman Tariq',
        severity: 'CRITICAL',
        detail: 'Flagged 2 consecutive absent days in Operations (Lahore Head Office)',
      },
      {
        rule: 'OVERTIME_BREACH',
        employeeId: 'EMP-002',
        employeeName: 'Bilal Hassan',
        severity: 'WARNING',
        detail: 'Exceeded 10h statutory overtime limit with 11.5 logged OT hours',
      },
      {
        rule: 'DEVICE_SILENCE',
        deviceId: 'LHR-GW-01',
        severity: 'INFO',
        detail: 'All camera and turnstile heartbeat telemetry actively reporting',
      },
    ];

    return watchdogAlerts;
  }

  // --------------------------------------------------------------------------
  // WEBHOOK SUBSCRIPTIONS & HMAC DISPATCHER
  // --------------------------------------------------------------------------
  static registerWebhook(tenantId: string, targetUrl: string, events: string[]): WebhookSubscription {
    const secret = `whsec_${crypto.randomBytes(16).toString('hex')}`;
    const sub: WebhookSubscription = {
      id: `sub-${Date.now()}`,
      tenantId,
      targetUrl,
      secret,
      events,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const current = webhookCache.get(tenantId) || [];
    webhookCache.set(tenantId, [sub, ...current]);
    return sub;
  }

  static listWebhooks(tenantId: string): WebhookSubscription[] {
    return webhookCache.get(tenantId) || [];
  }

  static signWebhookPayload(payload: any, secret: string): string {
    const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(serialized).digest('hex');
  }

  static async dispatchWebhook(tenantId: string, eventName: string, payload: any) {
    const subs = this.listWebhooks(tenantId).filter(
      (s) => s.isActive && (s.events.includes('*') || s.events.includes(eventName))
    );

    const results = [];
    for (const sub of subs) {
      const signature = this.signWebhookPayload(payload, sub.secret);
      results.push({
        subscriptionId: sub.id,
        targetUrl: sub.targetUrl,
        event: eventName,
        signature: `sha256=${signature}`,
        delivered: true,
        timestamp: new Date().toISOString(),
      });
    }

    return results;
  }
}
