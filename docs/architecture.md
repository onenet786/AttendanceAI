# AttendanceAI: System Architecture Specifications

## 1. High-Level System Architecture

The platform is designed as an enterprise-grade, multi-tenant SaaS architecture supporting concurrent attendance sources, real-time analytics, AI tool execution, task workflows, and payroll calculations.

```mermaid
flowchart TB
    subgraph CLIENTS ["Clients & Ingestion Surfaces"]
        WEB["Next.js Web App\n(app.yourdomain.com)"]
        MOB["Mobile App (PWA / Flutter)"]
        BC["Barcode & QR Readers"]
        CAMS["IP CCTV Cameras (RTSP)"]
        WBCAM["Browser Webcams"]
        MIC["Microphone (Voice Commands)"]
    end

    subgraph PROXY ["Reverse Proxy & Edge Ingress"]
        NGX["Nginx Reverse Proxy & SSL\n(Ubuntu / aaPanel Coexistence)"]
    end

    subgraph GATEWAY ["Local Office Attendance Gateway"]
        OAG["Edge Attendance Gateway\n(Local Worker / RTSP Decoder / Face Embedding)"]
        LDB[("Local SQLite Queue\n(Offline Buffer)")]
        OAG <--> LDB
    end

    subgraph API_TIER ["Application Layer (Node.js + TypeScript)"]
        AUTH["Auth & Multi-Tenant Guard"]
        ATT_ENG["Attendance Engine\n(Single Source of Truth)"]
        PAY_ENG["Payroll Calculation Engine"]
        TASK_ENG["Task & Project Engine"]
        AGENT["AI Tool-Calling Agent\n(Whisper STT / LLM)"]
        AUDIT["Immutable Audit Logger"]
        WS["WebSocket / Socket.IO Hub"]
    end

    subgraph DATA_TIER ["Persistence Layer"]
        PG[("PostgreSQL\n(Multi-Tenant + pgvector)")]
        RD[("Redis\n(Rate-limiting / Cache / BullMQ)")]
        FS[("Isolated Storage\n(/storage/uploads)")]
    end

    WEB & MOB --> NGX
    BC & WBCAM & MIC --> NGX
    CAMS --> OAG
    OAG -->|Secure Sync / WebSocket| NGX

    NGX --> AUTH
    AUTH --> ATT_ENG & PAY_ENG & TASK_ENG & AGENT
    ATT_ENG & PAY_ENG & TASK_ENG & AGENT --> AUDIT
    AUDIT --> PG
    ATT_ENG & PAY_ENG & TASK_ENG --> WS
    WS --> WEB & MOB

    API_TIER --> RD
    API_TIER --> FS
    API_TIER --> PG
```

---

## 2. Core Principle: The Central Attendance Engine

All attendance events regardless of origin—IP camera, webcam, QR code, barcode, voice, or manual punch—flow into **one central Attendance Engine**.

```mermaid
flowchart LR
    QR["QR Code"] --> ENGINE
    BAR["Barcode"] --> ENGINE
    CAM["IP Camera (via Gateway)"] --> ENGINE
    WCAM["Webcam"] --> ENGINE
    FACE["Face Recognition"] --> ENGINE
    VOICE["Voice Punch"] --> ENGINE
    MAN["Manual Entry"] --> ENGINE

    subgraph ENGINE ["Central Attendance Engine"]
        V1["Anti-Fraud & Cooldown Check"] --> V2["Device Authentication"]
        V2 --> V3["Shift & Rule Resolution"]
        V3 --> V4["Consolidated Event Calculator\n(IN / OUT / Break / Overtime / Late)"]
    end

    ENGINE --> DB[("PostgreSQL (Immutable Event & Daily Logs)")]
    ENGINE --> RT["Socket.IO Live Dashboard Broadcast"]
```

---

## 3. Multi-Tenancy & Data Isolation Model

Every tenant-scoped table features a mandatory `tenant_id` column.
Tenant isolation is enforced strictly at:
1. **Network / JWT Layer**: Incoming tokens bind each user to their `tenant_id` and assigned `company_id`/`branch_id`.
2. **Middleware Layer**: The `tenant.middleware.ts` rejects any request where the tenant context is missing or forged.
3. **Repository / Query Layer**: All Prisma database operations automatically scope queries with `{ where: { tenantId } }`.
4. **PostgreSQL RLS (Row Level Security)**: Optional defence-in-depth policy guarantees that database queries cannot return data belonging to another tenant.

```mermaid
sequenceDiagram
    participant User as Client Request
    participant Middleware as Tenant Middleware
    participant Controller as API Controller
    participant Service as Business Service
    participant DB as PostgreSQL

    User->>Middleware: Request with JWT (Bearer Token)
    Middleware->>Middleware: Verify Token & Extract tenant_id
    alt Invalid or Mismatched Tenant
        Middleware-->>User: 403 Forbidden
    else Valid Tenant
        Middleware->>Controller: Forward with req.tenantId
        Controller->>Service: Call Method(params, tenantId)
        Service->>DB: prisma.model.findMany({ where: { tenantId } })
        DB-->>Service: Tenant-Isolated Data
        Service-->>Controller: Return Result
        Controller-->>User: 200 OK
    end
```

---

## 4. Production Coexistence with Existing aaPanel Server

The host server already serves an active production website. The new SaaS platform runs in complete isolation:

| Dimension | Existing Website | New AttendanceAI Platform |
|---|---|---|
| **Domain** | `existing-domain.com` | `app.yourdomain.com` & `api.yourdomain.com` |
| **Database** | Existing DB on port 5432 | Dedicated DB: `attendance_ai_db` (dedicated user) |
| **Application Process** | Existing PHP / Node process | PM2 cluster / Docker container on port `3041` (API) & `3042` (Web) |
| **Reverse Proxy** | Main Nginx server block | Separate Nginx vhost configuration files |
| **Storage & Uploads** | Existing web root | `/www/wwwroot/attendance-ai/storage/` |
| **Logs** | Existing log files | `/www/wwwroot/attendance-ai/logs/` |

---

## 5. Technology Stack Summary

- **API Runtime**: Node.js v20+ / v24, TypeScript, Express.js with modular layered services.
- **Real-Time**: Socket.IO with Redis adapter for horizontal scaling.
- **ORM & Database**: Prisma ORM with PostgreSQL 15+, `pgvector` for conversational AI memory & document embeddings.
- **Validation**: Zod runtime schema validation on every request DTO.
- **Authentication**: JWT access tokens (15m expiration) + cryptographically secure rotating refresh tokens (7d) stored with hash verification.
- **Frontend**: Next.js 14 / React + TypeScript + modern enterprise design system.
