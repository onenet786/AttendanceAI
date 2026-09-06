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

