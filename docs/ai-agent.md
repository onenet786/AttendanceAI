# Phase 6: AI Assistant / Agent Subsystem

## 1. Executive Summary

Phase 6 introduces an enterprise-grade, multi-tenant **AI Assistant & Agent Copilot** to the **AttendanceAI** SaaS platform.

The system features:
* **Multi-Turn Conversational Reasoning**: In-memory stateful conversation memory per session.
* **Deterministic & Safe Autonomous Tool Dispatching**: 7 registered business tools that directly interface with attendance calculation algorithms, employee records, turnstiles, CCTV edge gateways, and immutable audit logs.
* **Granular Role-Based Access Control (RBAC) Guardrails**: Non-supervisors or standard employees are strictly prohibited from invoking mutations or viewing unauthorized cross-tenant data.
* **Full Audit Trail Logging**: Every agent-mediated action records the actor, IP, tool name, execution timestamp, and parameter payload.
* **Zero External Lock-In**: Works completely offline out-of-the-box using rule-based and fuzzy entity matching, while also providing adapters for OpenAI / Anthropic / Local Ollama models via environment variables (`AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL_NAME`).

---

## 2. Business Tools Registry

| Tool Name | Description | Required Role | Parameter Schema |
| :--- | :--- | :--- | :--- |
| `search_employees` | Search staff across company branches by name, code, or department | All Roles | `{ query: string, branch?: string, department?: string }` |
| `get_attendance_summary` | Real-time headcount KPIs: scheduled, present, late, absent, on break, on leave | All Roles | `{ branch?: string }` |
| `get_employee_timesheet` | Multi-interval worked hour calculation, break tracking, and overtime | All Roles | `{ employeeIdentifier: string, date?: string }` |
| `get_absent_employees` | Identifies scheduled employees who have not registered a punch today | All Roles | `{ branch?: string }` |
| `correct_attendance_record` | Manual punch correction with mandatory audit reason and automated timesheet recalculation | `SUPER_ADMIN`, `ADMIN`, `SUPERVISOR` | `{ employeeId: string, eventType: 'CHECK_IN' \| 'CHECK_OUT', time: string, reason: string }` |
| `get_device_telemetry` | Real-time liveness, FPS, and offline SQLite buffer queues of turnstiles & cameras | All Roles | `{ branch?: string }` |
| `generate_attendance_report` | Executive compliance and punctuality summary with RFC 4180 CSV export link | `SUPER_ADMIN`, `ADMIN`, `SUPERVISOR`, `HR_MANAGER` | `{ period: 'today' \| 'this_week' \| 'this_month', branch?: string }` |

---

## 3. Security & Multi-Tenant Guardrails

1. **Strict Tenant Scoping**: All tool executions receive `context.tenantId` extracted from the validated JWT token or `X-Tenant-ID` header. No query can bypass tenant boundaries.
2. **Permission Denied Trapping**: When an unauthorized employee attempts to invoke a supervisor-only tool (e.g. `correct_attendance_record`), the execution engine intercepts the request and responds with `status: 'PERMISSION_DENIED'`, preventing any database mutations.
3. **Redacted Audit Entries**: Parameter inputs and sensitive employee attributes (e.g. bank details, passwords) are filtered before persisting in compliance audit logs.

---

## 4. API Endpoints

### 4.1 Process Chat Message
```http
POST /api/v1/agent/chat
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "message": "Who is absent today in Lahore Head Office?",
  "conversationId": "opt-conv-uuid-1"
}
```

#### Response:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Agent response generated successfully",
  "data": {
    "conversationId": "opt-conv-uuid-1",
    "message": "### 🚨 Absent & Unlogged Employees (2 Found)\n\nFor **Lahore Head Office**, the following scheduled team members have not registered a punch today...",
    "toolCalls": [
      {
        "id": "tool-call-uuid-88",
        "name": "get_absent_employees",
        "arguments": { "branch": "Lahore Head Office" },
        "status": "SUCCESS",
        "result": {
          "count": 2,
          "branch": "Lahore Head Office",
          "absentEmployees": [
            { "code": "EMP-014", "name": "Usman Tariq", "department": "Operations" }
          ]
        },
        "executionTimeMs": 42
      }
    ],
    "suggestedFollowUps": [
      "Send reminder to absent employees",
      "Show attendance summary for today",
      "Show timesheet for Alex Morgan"
    ]
  }
}
```

### 4.2 List Available Tools
```http
GET /api/v1/agent/tools
Authorization: Bearer <jwt-token>
```
Returns a list of tools available specifically for the user's role.

### 4.3 Get Session History
```http
GET /api/v1/agent/conversations/:conversationId
Authorization: Bearer <jwt-token>
```
Returns chronological messages, timestamps, and tool execution traces for the specified session.
