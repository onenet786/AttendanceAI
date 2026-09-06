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
