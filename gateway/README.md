# Office Attendance Edge Gateway

The **Office Attendance Edge Gateway** is a lightweight local service designed to run on-premise (e.g. Raspberry Pi 4/5, Intel NUC, or Linux server) at each physical office branch (e.g., Lahore Head Office, Islamabad Branch).

## Responsibilities

1. **Direct Camera Interfacing**: Connects locally over LAN to IP cameras via RTSP (e.g. `rtsp://admin:pass@192.168.1.120:554/stream1`). The cloud server never needs open incoming RTSP ports.
2. **Local Face Extraction & OCR**: Detects faces or scans barcodes/QRs directly on local frames.
3. **Offline Queueing**: If the office broadband drops, punch events are persisted into a local SQLite queue with unique idempotency keys.
4. **Cloud Synchronization**: Once the internet connection is restored, punches are sent over HTTPS/WebSocket to the central **Attendance Engine** without event loss or duplication.
