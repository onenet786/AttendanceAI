# Unified Attendance Engine Specifications (Phase 2)

## 1. Overview

The **Attendance Engine** serves as the single source of truth for all attendance events across the entire enterprise. Regardless of whether an event originates from an IP CCTV camera, biometric face terminal, signed QR code, barcode reader, mobile GPS punch, voice command, or manual punch, it is processed through the identical calculation pipeline.

---

## 2. Multi-Interval IN/OUT Calculation Algorithm

Employees frequently punch in and out multiple times per day (e.g. lunch breaks, client field visits, split shifts). The system never assumes a single IN and OUT.

### Formula
$$\text{Total Worked Minutes} = \sum_{i=1}^{n} (\text{OUT}_i - \text{IN}_i)$$

$$\text{Break Minutes} = \sum (\text{BREAK\_END} - \text{BREAK\_START}) + \sum_{i=1}^{n-1} (\text{IN}_{i+1} - \text{OUT}_i)$$

### Example Calculation
| Time | Punch Action | Session State | Accumulator |
|---|---|---|---|
| **08:58 AM** | `CHECK_IN` | Active Session 1 Begins | First IN recorded |
| **01:00 PM** | `CHECK_OUT` | Session 1 Ends | Worked: 4 hrs 2 mins (242m) |
| **02:00 PM** | `CHECK_IN` | Active Session 2 Begins | Break: 1 hr (60m) logged |
| **05:30 PM** | `CHECK_OUT` | Session 2 Ends | Worked: 3 hrs 30 mins (210m) |

**Day Summary**:
- Total Worked Time: `452 minutes` (7.5 hours)
- Break Time: `60 minutes` (1.0 hour)
- Overtime: `30 minutes` (beyond 8-hour shift)
- Day Status: `PRESENT`

---

## 3. Shift Rule Resolution

Each employee is assigned a `Shift` defining:
* `startTime`: e.g. `"09:00"`
* `endTime`: e.g. `"17:00"`
* `gracePeriodMinutes`: e.g. `15`
* `lateThresholdMinutes`: e.g. `30`
* `earlyExitThresholdMinutes`: e.g. `15`
* `fullDayMinutes`: e.g. `480` (8 hours)
* `halfDayMinutes`: e.g. `240` (4 hours)

### Arrival Evaluation
* Arrival at or before `09:15` (within 15m grace) $\to$ **On Time** (`lateMinutes = 0`, Status: `PRESENT`).
* Arrival at `09:16` $\to$ **Late** (`lateMinutes = 16`, Status: `LATE`).

### Early Exit Evaluation
* Punch OUT before `16:45` (earlier than 15m threshold) $\to$ **Early Exit** recorded with delta minutes.

---

## 4. Leave Schedule Priority

If an approved `Leave` record exists for an employee covering the date, the engine automatically resolves the day status to **`ON_LEAVE`**, suppressing unexcused absence penalties.

---

## 5. Supervisor Manual Corrections

Supervisors can adjust or add missing punches via `/api/v1/attendance/correct`:
- **Mandatory Reason**: Requires at least 5 characters explanation (e.g. *"Turnstile power outage"*).
- **Audit Logging**: An immutable record is created in `audit_logs` linking the supervisor ID, employee ID, and timestamps.
- **Auto-Recalculation**: The daily attendance record for that date is recalculated immediately.

---

## 6. Reporting & CSV Exports

* `GET /api/v1/attendance/reports/daily`: Consolidated daily records with present/late/absent counts.
* `GET /api/v1/attendance/reports/monthly`: Attendance matrix per employee (worked hours, overtime, attendance %).
* `GET /api/v1/attendance/reports/exceptions`: Isolated list of late arrivals and missing checkouts.
* `GET /api/v1/attendance/reports/export-csv`: Downloadable RFC 4180 CSV export.
