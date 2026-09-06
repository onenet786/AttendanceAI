import { describe, it, expect } from 'vitest';
import { NotificationService } from '../modules/notifications/notification.service.js';

describe('Phase 10: Multi-Channel Notifications & Alert Dispatcher', () => {
  const tenantId = 'test-tenant-notifs';

  it('1. In-App Notifications > should list notifications, report unread count, and mark as read', async () => {
    const list = await NotificationService.listNotifications(tenantId);
    expect(list.length).toBeGreaterThan(0);

    const initialUnread = await NotificationService.getUnreadCount(tenantId);
    expect(initialUnread).toBeGreaterThan(0);

    // Find first unread notification
    const unread = list.find((n) => !n.isRead)!;
    const marked = await NotificationService.markAsRead(tenantId, unread.id);
    expect(marked?.isRead).toBe(true);

    // Mark all as read
    const count = await NotificationService.markAllAsRead(tenantId);
    expect(count).toBeGreaterThanOrEqual(0);

    const newUnread = await NotificationService.getUnreadCount(tenantId);
    expect(newUnread).toBe(0);
  });

  it('2. Automated Watchdog > should evaluate consecutive absenteeism and overtime alerts', () => {
    const alerts = NotificationService.evaluateAttendanceWatchdog(tenantId);
    expect(alerts.length).toBeGreaterThanOrEqual(3);

    const consecutiveAbsence = alerts.find((a) => a.rule === 'CONSECUTIVE_ABSENCE');
    expect(consecutiveAbsence).toBeDefined();
    expect(consecutiveAbsence?.severity).toBe('CRITICAL');

    const overtimeBreach = alerts.find((a) => a.rule === 'OVERTIME_BREACH');
    expect(overtimeBreach).toBeDefined();
    expect(overtimeBreach?.severity).toBe('WARNING');
  });

  it('3. Webhooks & HMAC Signatures > should register webhook and sign dispatched events', async () => {
    const sub = NotificationService.registerWebhook(
      tenantId,
      'https://example.com/webhooks/attendance',
      ['attendance.punch', 'payroll.locked']
    );

    expect(sub.secret).toContain('whsec_');
    expect(sub.targetUrl).toBe('https://example.com/webhooks/attendance');

    const payload = {
      event: 'attendance.punch',
      employeeId: 'EMP-001',
      action: 'CHECK_IN',
      timestamp: '2026-09-07T09:00:00Z',
    };

    const signature = NotificationService.signWebhookPayload(payload, sub.secret);
    expect(signature).toHaveLength(64); // SHA256 hex string

    // Dispatch webhook
    const dispatchResults = await NotificationService.dispatchWebhook(
      tenantId,
      'attendance.punch',
      payload
    );

    expect(dispatchResults.length).toBeGreaterThan(0);
    expect(dispatchResults[0].delivered).toBe(true);
    expect(dispatchResults[0].signature).toBe(`sha256=${signature}`);
  });
});
