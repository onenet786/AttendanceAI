# AttendanceAI: Enterprise AI-Powered Multi-Tenant HR, Attendance, Task & Payroll Platform

AttendanceAI is a production-grade multi-tenant SaaS platform built for high-scale enterprise workforce management. It combines a unified **Central Attendance Engine** (handling IP CCTV cameras, Webcams, Face recognition, QR codes, Barcodes, Voice punches, Mobile and Manual inputs) with automated payroll processing, task management, role-based access control, and an autonomous tool-calling AI agent.

---

## Key Capabilities

* **Multi-Tenant Architecture**: Complete data isolation with `tenant_id` scoping at network, service, and database layers.
* **Unified Attendance Engine**: Ingests multiple inputs (CCTV, QR, Face, Barcode, Voice) into a single event resolution pipeline.
* **Complex Shift Calculations**: Configurable grace periods, late arrival, early departure, multi-IN/OUT calculation, overtime, and break time tracking.
* **Edge Attendance Gateway**: Local office daemon for RTSP camera ingestion, face recognition vector extraction, and offline buffering.
* **Configurable Payroll Engine**: Multi-period (monthly, biweekly, weekly), salary structures, allowances, tax deductions, and immutable locked payslips.
* **Task & Project Management**: Subtasks, recurring tasks, automated alerts, checklists, and time tracking.
* **Tool-Calling AI Assistant**: Voice and text command processing via structured tools; semantic search powered by `pgvector`.
* **Zero-Downtime Coexistence**: Ready for direct deployment on Ubuntu/aaPanel servers alongside existing production sites.

---

## Directory Layout

```
AttendanceAI/
├── backend/            # Express/Node.js + TypeScript REST & WebSocket Server
│   ├── prisma/         # Prisma Schema, Migrations, and Seeders
│   └── src/            # Modular Layered Architecture (Auth, Tenants, Employees, Attendance, Audit)
├── frontend/           # Modern Enterprise SaaS Web Client (React / Next.js)
├── gateway/            # Edge Attendance Gateway Agent for RTSP CCTV & Offline Queue
├── docs/               # System Architecture, Database Schema, API Docs & aaPanel Deployment
├── .env.example        # Environment variable template
└── README.md           # This document
```

---

## Development Setup

### 1. Backend Setup
```bash
cd backend
cp ../.env.example .env
npm install
npx prisma generate
npx prisma db push # or npx prisma migrate dev
npm run seed
npm run dev
```

The API will be available at `http://localhost:4000`, and OpenAPI / Swagger documentation at `http://localhost:4000/api/v1/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The Web Application will be available at `http://localhost:3000`.

---

## Documentation Links

* [Architecture Specifications](docs/architecture.md)
* [Database Design & Schema](docs/database.md)
* [Production Deployment & aaPanel Coexistence Guide](docs/deployment.md)
