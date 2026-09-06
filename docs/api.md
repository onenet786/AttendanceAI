# API Specifications & Developer Guide

## 1. Base URL & Versioning

All API endpoints are versioned with `/api/v1/`:
- **Development**: `http://localhost:3041/api/v1`
- **Production**: `https://api.yourdomain.com/api/v1`
- **Interactive Swagger Documentation**: `http://localhost:3041/api/v1/docs`

---

## 2. Standardized Response Format

Every API endpoint responds with a consistent JSON envelope:

### Success Response (200 / 201)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Error Response (400 / 401 / 403 / 404 / 500)
```json
{
  "success": false,
  "statusCode": 403,
  "error": "Forbidden",
  "message": "Access denied: Tenant isolation policy violation",
  "details": null,
  "timestamp": "2026-09-07T01:45:00.000Z"
}
```

---

## 3. Authentication & Headers

Protected routes require a Bearer token in the `Authorization` header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

For tenant-level scoping across shared API gateways:
```http
X-Tenant-ID: <tenant-uuid-or-slug>
```

---

## 4. Phase 1 Core Endpoints

### Authentication (`/api/v1/auth`)
* `POST /api/v1/auth/login` - Authenticate with email & password; returns JWT access + refresh token
* `POST /api/v1/auth/refresh` - Rotate refresh token & issue new access token
* `POST /api/v1/auth/logout` - Revoke active refresh token session
* `GET /api/v1/auth/me` - Retrieve authenticated user profile, permissions, and tenant context

### Organization & Branches (`/api/v1/organization`)
* `GET /api/v1/organization/companies` - List companies under tenant
* `GET /api/v1/organization/branches` - List branches with geolocation and headquarters flags
* `POST /api/v1/organization/branches` - Create branch (Admin only)
* `GET /api/v1/organization/departments` - List departments
* `POST /api/v1/organization/departments` - Create department
* `GET /api/v1/organization/teams` - List teams within departments

### Employee Management (`/api/v1/employees`)
* `GET /api/v1/employees` - List employees with pagination, search, branch/department filtering
* `GET /api/v1/employees/:id` - Detailed employee profile, job history, contact, manager
* `POST /api/v1/employees` - Register new employee (requires `employee.create` permission)
* `PUT /api/v1/employees/:id` - Update employee details (requires `employee.edit` permission)
* `DELETE /api/v1/employees/:id` - Terminate/Archive employee (requires `employee.delete` permission)

### Audit Logs (`/api/v1/audit-logs`)
* `GET /api/v1/audit-logs` - Query immutable audit trail with actor, entity, date range filters

### Real-Time Live Attendance (`/api/v1/attendance/live` & WebSockets)
* `GET /api/v1/attendance/live/summary` - Current count of Present, Absent, Late, On Leave for today
* `WebSocket /socket.io` - Real-time stream: `attendance:event`, `dashboard:stats_update`

---

## 5. Phase 2 Attendance Engine & Reporting Endpoints

### Attendance Calculations & Events (`/api/v1/attendance`)
* `POST /api/v1/attendance/punch` - Multi-interval punch ingress (`CHECK_IN`, `CHECK_OUT`, `BREAK_IN`, `BREAK_OUT`)
* `POST /api/v1/attendance/correct` - Supervisor manual override with mandatory audit reason and automated timesheet recalculation
* `GET /api/v1/attendance/timesheets` - Query daily multi-interval worked hours, breaks, late arrivals, and overtime
* `GET /api/v1/attendance/daily` - Daily attendance ledger by branch, department, shift

### Enterprise Reports (`/api/v1/reports`)
* `GET /api/v1/reports/daily` - Daily status breakdowns
* `GET /api/v1/reports/monthly` - Full monthly 31-day attendance matrix with attendance percentages
* `GET /api/v1/reports/exceptions` - Lateness, early departure, and absenteeism exception audit
* `GET /api/v1/reports/export-csv` - Compliant RFC 4180 CSV export

---

## 6. Phase 3 Device Management, QR & Barcodes (`/api/v1/devices`)

### Hardware Devices & Terminals
* `GET /api/v1/devices` - List registered turnstiles, biometric terminals, and barcode scanners
* `POST /api/v1/devices/register` - Provision new hardware terminal and generate scoped `dtk_...` API token
* `POST /api/v1/devices/heartbeat` - Hardware liveness check, status synchronization, and offline buffer queue reporting
* `POST /api/v1/devices/terminal-punch` - Hardware terminal scanner ingress with header token authentication (`X-Device-Token`)

### QR Badges & Barcode Credentials
* `GET /api/v1/devices/qr/permanent/:employeeId` - Retrieve cryptographic permanent badge token
* `GET /api/v1/devices/qr/dynamic/:employeeId` - Generate HMAC-SHA256 signed rotating token with 30–60s countdown and anti-replay nonce
* `POST /api/v1/devices/qr/verify` - Validate static or dynamic rotating QR payload with nonce cache check
* `GET /api/v1/devices/barcode/:employeeId` - Generate standard Code128 payload for 1D laser & CCD scanners

---

## 7. Phase 4 Face Biometrics & IP Camera Ingress

### Biometrics (`/api/v1/biometrics/face`)
* `POST /api/v1/biometrics/face/enroll` - Enroll normalized 512-dim facial vector embedding
* `POST /api/v1/biometrics/face/identify` - Vector Cosine Similarity lookup against branch gallery
* `POST /api/v1/biometrics/face/webcam-punch` - Single-step biometric check-in with liveness evaluation

### IP Cameras & Edge Gateways (`/api/v1/cameras`)
* `GET /api/v1/cameras` - List registered CCTV camera streams and Edge Gateway statuses
* `POST /api/v1/cameras` - Register new IP camera RTSP stream configuration
* `POST /api/v1/cameras/gateway/match-stream` - Real-time stream detection ingress from Edge Gateway (`X-Gateway-Token`)
* `POST /api/v1/cameras/gateway/sync-batch` - Ingest offline buffered punches from Edge Gateway SQLite queue

---

## 8. Phase 5 Voice-Based Attendance & Speech AI (`/api/v1/voice`)

### Biometric Voiceprint Enrollment & Verification
* `POST /api/v1/voice/enroll` - Enroll normalized 128-dimensional acoustic MFCC voiceprint vector for employee
* `POST /api/v1/voice/verify` - Cosine similarity comparison between incoming audio feature vector and employee profile (threshold $\ge 0.80$)

### Voice Attendance & Natural Language Intent Processing
* `POST /api/v1/voice/command` - Primary multimodal endpoint accepting raw audio/speech transcript + optional acoustic vector. Parses natural language intent (`CHECK_IN`, `CHECK_OUT`, `BREAK_START`, `BREAK_END`, `HOURS_QUERY`, `STATUS_QUERY`, `TEAM_QUERY`), executes biometric validation, dispatches into Central Attendance Engine (`source: 'VOICE'`), and returns natural spoken audio response text.
* `POST /api/v1/voice/parse-intent` - Lightweight testing endpoint to classify natural language intent and slots without triggering attendance mutations.

---

## 9. Phase 6 AI Assistant / Agent Subsystem (`/api/v1/agent`)

### Multi-Turn Conversational Reasoning & Tool Dispatching
* `POST /api/v1/agent/chat` - Send natural language prompt with optional `conversationId`. Dispatches registered business tools (`search_employees`, `get_attendance_summary`, `get_employee_timesheet`, `get_absent_employees`, `correct_attendance_record`, `get_device_telemetry`, `generate_attendance_report`), applies strict RBAC validation, and returns synthesized markdown answer with structured tool execution cards.
* `GET /api/v1/agent/tools` - Introspect list of available tools, descriptions, parameter schemas, and permissions for authenticated user role.
* `GET /api/v1/agent/conversations/:id` - Retrieve full chronological message and tool execution trace history for an active session.

---

## 10. Phase 7 Enterprise Payroll & Salary Engine (`/api/v1/payroll`)

### Salary Structure Configuration
* `POST /api/v1/payroll/salary-structure` - Define or update employee base salary, standard allowances (housing, transport, medical), custom deductions, and currency
* `GET /api/v1/payroll/salary-structure/:employeeId` - Retrieve active salary breakdown and compensation parameters for an employee

### Payroll Periods & Reconciliation Runs
* `POST /api/v1/payroll/periods` - Open a monthly or custom payroll processing window
* `POST /api/v1/payroll/periods/:periodId/run` - Execute batch payroll computation. Reconciles raw multi-interval punches, applies overtime multipliers ($1.5\times$), deducts unapproved absences and lateness infractions, and applies progressive income tax slabs ($0\% - 35\%$) and statutory Provident Fund ($5\%$)
* `POST /api/v1/payroll/periods/:periodId/lock` - Seal and finalize payroll period. Enforces immutability: locked periods reject subsequent batch re-runs and historical modifications
* `GET /api/v1/payroll/periods/:periodId/payslips` - Retrieve itemized digital payslips for all processed employees within the period
