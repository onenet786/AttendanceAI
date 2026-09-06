export type NotificationSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type NotificationType =
  | 'ATTENDANCE_BREACH'
  | 'OVERTIME_THRESHOLD'
  | 'GATEWAY_OFFLINE'
  | 'PAYROLL_SEALED'
  | 'TASK_ASSIGNED';

export interface AppNotification {
  id: string;
  tenantId: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: NotificationSeverity;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface WebhookSubscription {
  id: string;
  tenantId: string;
  targetUrl: string;
  secret: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
}

export interface AttendanceWatchdogEvent {
  rule: 'CONSECUTIVE_ABSENCE' | 'OVERTIME_BREACH' | 'DEVICE_SILENCE';
  employeeId?: string;
  employeeName?: string;
  deviceId?: string;
  severity: NotificationSeverity;
  detail: string;
}
