# Enterprise Security Architecture & Policies

## 1. Zero-Trust Access & Tenant Boundary Isolation

1. **Strict Server-Side Derivation**: The backend never accepts `tenant_id`, `user_id`, or `role` blindly from client payloads. All identity attributes are extracted from cryptographically verified JWT access tokens.
2. **PostgreSQL Tenant Isolation**: Every repository method automatically applies `{ tenantId: user.tenantId }`. Cross-tenant queries are blocked before reaching database execution.
3. **Password Security**: Passwords are hashed using bcrypt with salt rounds configurable up to 14 (or Argon2id). Raw passwords are never logged or stored.

---

## 2. RTSP Camera & Gateway Security

1. **Encrypted RTSP Credentials**: RTSP URLs with camera credentials are encrypted in PostgreSQL using AES-256-GCM.
2. **No Frontend Exposure**: Camera passwords and internal RTSP streams are **never** forwarded to client browsers.
3. **Local Attendance Gateway Token Authentication**: Gateways authenticate via pre-shared cryptographically hashed tokens with automatic heartbeat verification.

---

## 3. Anti-Fraud & Attendance Verification

1. **Anti-Replay Protection**: QR codes support rotating signed JWT tokens with 30-second expiry windows.
2. **Cooldown Detection**: Immediate rapid punches for the same employee within 60 seconds are flagged and prevented from generating duplicate check-ins.
3. **Biometric Confidence Thresholds**: Face and voice matches return confidence scores (0.00 - 1.00). Events below the company-configured threshold (default 0.85) are flagged as suspicious and routed for supervisor approval rather than auto-verified.
4. **Geolocation Geofencing**: Lat/Long coordinates from mobile punches are mathematically checked against the Branch radius using the Haversine formula.

---

## 4. Immutable Audit Trail

All modifying business actions (creation, editing, salary modification, attendance correction, payroll locking) generate an immutable record in `audit_logs` capturing:
* Actor ID and Tenant ID
* Action name and entity target
* JSON diff (`oldValue` vs `newValue`) with sensitive keys (passwords, tokens) permanently redacted
* Request IP address and User Agent string
