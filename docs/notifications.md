# Phase 10: Multi-Channel Notifications & Alert Dispatcher

The **AttendanceAI Alert & Notification Engine** delivers real-time situational awareness across administrative dashboards and third-party webhooks.

---

## 1. Automated Watchdog Rules

The automated background watchdog continuously monitors attendance telemetry:

1. **Consecutive Absenteeism Rule**:
   - Triggers when an employee records **2 or more consecutive business days** without an authorized leave or check-in punch.
   - Severity: `CRITICAL`
   - Action: Notifies HR managers and dispatches alert to employee's emergency contact.

2. **Statutory Overtime Threshold Breach Rule**:
   - Triggers when an employee accrues **over 10 hours of overtime in a single week**.
   - Severity: `WARNING`
   - Action: Prompts department supervisor for formal sign-off before payroll cycle close.

3. **Hardware Gateway Silence Rule**:
   - Triggers when an Edge Gateway or CCTV RTSP stream ceases sending heartbeat pings for **more than 10 minutes**.
   - Severity: `CRITICAL`
   - Action: Alerts system administrator of possible on-premise network or turnstile power outage.

---

## 2. In-App Notification Center
- Real-time unread counter badge displayed on the global top header.
- Interactive notification tray with severity color codes:
  - `CRITICAL`: Red `#ef4444`
  - `WARNING`: Amber `#f59e0b`
  - `INFO`: Sky `#0ea5e9`
- "Mark as Read" per item and "Mark all read" global action.

---

## 3. HMAC-Signed Webhook Dispatcher
External services (e.g. Slack, MS Teams, Zapier, custom ERPs) can subscribe to real-time events.

### 3.1 Supported Webhook Events
- `attendance.punch`: Triggered on every new verified punch.
- `attendance.breach`: Triggered on consecutive absenteeism or late arrival breaches.
- `payroll.locked`: Triggered when monthly payroll is finalized.
- `device.offline`: Triggered on hardware gateway heartbeat drop.

### 3.2 HMAC-SHA256 Signature Verification
Every outgoing webhook request includes a cryptographic signature in the `X-Attendance-Signature` header:
$$\text{Signature} = \text{HMAC-SHA256}(\text{Secret}, \text{Payload JSON})$$

---

## 4. API Specification (`/api/v1/notifications`)

### 4.1 In-App Notifications
- `GET /api/v1/notifications` - List recent notifications
- `GET /api/v1/notifications/unread-count` - Get active unread badge count
- `PATCH /api/v1/notifications/:id/read` - Mark single notification as read
- `POST /api/v1/notifications/read-all` - Mark all notifications as read
- `GET /api/v1/notifications/watchdog` - Evaluate active watchdog rules

### 4.2 Webhook Subscriptions
- `POST /api/v1/notifications/webhooks` - Register new webhook destination
  ```json
  {
    "targetUrl": "https://api.yourcompany.com/attendance-webhook",
    "events": ["attendance.punch", "payroll.locked"]
  }
  ```
- `GET /api/v1/notifications/webhooks` - List active webhook endpoints
