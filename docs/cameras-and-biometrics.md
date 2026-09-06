# IP Cameras, RTSP Edge Gateway & Face Biometrics Architecture

## 1. Overview & Privacy Architecture

The **AttendanceAI** biometric and computer vision pipeline is built on a **Privacy-First, Bandwidth-Efficient Edge-to-Cloud Architecture**.

### Why Not Direct Cloud RTSP Streaming?
Streaming 4K or 1080p RTSP video feeds across the public internet from dozens of branch cameras into a cloud server causes:
* **Massive Bandwidth Saturation**: A single 1080p H.264 stream consumes 3–6 Mbps. Ten cameras consume 30–60 Mbps of continuous uplink bandwidth.
* **Severe Latency & Jitter**: Cloud video frame decoding adds 2–4 seconds of network latency.
* **Privacy & Compliance Violations**: Transmitting continuous 24/7 video feeds of employees over the internet violates GDPR, regional data sovereignty, and corporate privacy mandates.

### The AttendanceAI Solution: On-Premise Edge Gateways
```mermaid
flowchart LR
    subgraph LAN ["Local Office LAN (Zero Internet Exposure)"]
        CAM1["IP Camera 1\n(Gate 1 - RTSP)"] --> GW["AttendanceAI Edge Gateway\n(Raspberry Pi 5 / Intel NUC)"]
        CAM2["IP Camera 2\n(Lobby Turnstile)"] --> GW
        CAM3["IP Camera 3\n(Warehouse Dock)"] --> GW
        GW <--> SQLITE[("Local SQLite Queue\n(Offline Buffer)")]
    end

    subgraph CLOUD ["AttendanceAI Cloud API (api.yourdomain.com)"]
        AUTH["Token & Tenant Auth\n(X-Gateway-Token)"]
        VEC["Cosine Similarity Matcher\n(512-dim Gallery Vector)"]
        PUNCH["Central Attendance Engine\n(IN / OUT / Breaks)"]
        AUTH --> VEC --> PUNCH
    end

    GW -->|HTTPS/WSS Lightweight JSON Metadata (<10 KB)| AUTH
```

1. **Local RTSP Stream Decoding**: On-premise Edge Gateway daemon pulls high-res RTSP streams over LAN.
2. **Local Face Crop & Embedding Extraction**: The Gateway runs an edge AI inference engine (FaceNet, InsightFace, or MobileFaceNet) to detect facial landmarks, verify liveness, and extract a normalized 512-dimensional vector embedding.
3. **Lightweight Transmission**: Only the mathematical vector embedding ($\approx 2 \text{ KB}$), timestamp, camera identifier, and optional cropped snapshot thumbnail are sent to the Cloud API.
4. **Offline Resiliency**: If internet connectivity drops, the Edge Gateway records punch events into its local encrypted SQLite queue and automatically flushes them in chronological order via `/api/v1/cameras/gateway/sync-batch` when connection restores.

---

## 2. Face Biometrics Engine Specifications

### 2.1 512-Dimensional Vector Normalization & Cosine Similarity
Every facial template is normalized to a unit Euclidean hypersphere ($L_2$ norm = 1.000):

$$\|v\|_2 = \sqrt{\sum_{i=1}^{512} v_i^2}$$

$$\hat{v} = \frac{v}{\|v\|_2}$$

When comparing candidate vector $A$ against enrolled gallery vector $B$, the **Cosine Similarity** is the dot product:

$$\text{CosineSimilarity}(A, B) = \sum_{i=1}^{512} \hat{A}_i \cdot \hat{B}_i$$

* **1.000**: Perfect identical match.
* **$\ge 0.820$**: High-security operational threshold for enterprise staff identification.
* **$< 0.820$**: Rejected as unrecognized visitor / impostor.
* **$0.000$**: Completely orthogonal / unrelated biometric features.

### 2.2 Anti-Spoofing & Liveness Guard
To prevent presentation attacks (e.g. holding up a colleague's printed photograph or smartphone display):
* **Texture & Frequency Analysis**: Detects high-frequency moiré patterns and screen refresh reflections characteristic of OLED/LCD panels.
* **Eye Blink & Micro-Movement Verification**: Verifies Eye Aspect Ratio (EAR) variations across 3–5 consecutive video frames.
* **Head Angle Constraints**: Frontal yaw and pitch must be within $\pm 45^\circ$.
* **Minimum Liveness Threshold**: Must exceed $0.85$ ($85\%$). Presentation attacks under $0.85$ are immediately rejected and logged with security flags.

### 2.3 5-Minute Duplicate Punch Cooldown
When employees converse near entry turnstiles or linger in camera view:
* The system enforces a **300-second (5-minute) per-employee cooldown window**.
* The first detection triggers the punch.
* Subsequent recognitions within 300 seconds are safely suppressed without generating spam punch events or false intermediate check-outs.

---

## 3. Edge Gateway Daemon Specifications

### 3.1 Recommended Hardware
* **Entry / Medium Branches (1–4 Cameras)**: Raspberry Pi 5 (8GB) with Hailo-8 M.2 AI accelerator or Coral Edge TPU.
* **Large Campuses (5–16 Cameras)**: Intel NUC i5/i7 or mini-PC with Intel OpenVINO / NVIDIA Jetson Orin Nano.

### 3.2 Offline SQLite Buffer Queue Schema
```sql
CREATE TABLE IF NOT EXISTS offline_punches (
    event_id TEXT PRIMARY KEY,
    camera_id TEXT NOT NULL,
    embedding_json TEXT NOT NULL,
    liveness_score REAL NOT NULL,
    captured_at TIMESTAMP NOT NULL,
    snapshot_base64 TEXT,
    sync_status TEXT DEFAULT 'PENDING'
);
```

### 3.3 Batch Sync Ingress Payload (`POST /api/v1/cameras/gateway/sync-batch`)
```json
{
  "events": [
    {
      "eventId": "offline-b82-01",
      "cameraId": "cam-lhr-01",
      "embedding": [0.034, -0.012, 0.089, ...],
      "livenessScore": 0.96,
      "timestamp": "2026-09-07T08:58:12.000Z"
    }
  ]
}
```

---

## 4. API Endpoint Reference

### Biometrics (`/api/v1/biometrics/face`)
* `POST /api/v1/biometrics/face/enroll`: Enroll 512-dim facial vector embedding for an employee.
* `POST /api/v1/biometrics/face/identify`: Query candidate vector against branch employee gallery without creating a punch.
* `POST /api/v1/biometrics/face/webcam-punch`: Single-step biometric check-in for front-desk tablets, employee web portal, and laptops.

### Cameras & Edge Gateways (`/api/v1/cameras`)
* `GET /api/v1/cameras`: List all registered CCTV camera streams and their associated gateway status.
* `POST /api/v1/cameras`: Register a new IP camera RTSP stream configuration.
* `POST /api/v1/cameras/gateway/match-stream`: Real-time detection ingress from local edge gateway (`X-Gateway-Token` auth).
* `POST /api/v1/cameras/gateway/sync-batch`: Replay and synchronize queued offline punches after network reconnection.
