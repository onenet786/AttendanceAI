/**
 * Local Office Attendance Gateway
 * Runs on local office mini-PC or server (e.g. Raspberry Pi 5 / Intel NUC)
 * Connects directly to local RTSP IP Cameras and Edge Scanners.
 * Buffers punches locally if internet is interrupted.
 */

interface QueuedPunch {
  idempotencyKey: string;
  employeeId?: string;
  qrToken?: string;
  barcode?: string;
  source: 'CAMERA' | 'FACE' | 'QR' | 'BARCODE';
  eventType: 'CHECK_IN' | 'CHECK_OUT';
  timestamp: string;
  confidenceScore?: number;
  snapshotUrl?: string;
  retryCount: number;
}

export class EdgeAttendanceGateway {
  private apiUrl: string;
  private deviceToken: string;
  private offlineQueue: QueuedPunch[] = [];
  private isOnline: boolean = true;
  private isSyncing: boolean = false;

  constructor(apiUrl: string, deviceToken: string) {
    this.apiUrl = apiUrl;
    this.deviceToken = deviceToken;
    console.log(`[EdgeGateway]: Initialized pointing to ${apiUrl}`);
  }

  public enqueuePunch(punch: Omit<QueuedPunch, 'idempotencyKey' | 'retryCount'>) {
    const queuedItem: QueuedPunch = {
      ...punch,
      idempotencyKey: `GW_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      retryCount: 0,
    };

    this.offlineQueue.push(queuedItem);
    console.log(`[EdgeGateway]: Event enqueued (${queuedItem.source} -> ${queuedItem.eventType}). Queue length: ${this.offlineQueue.length}`);
    this.flushQueue();
  }

  public async flushQueue() {
    if (this.isSyncing || this.offlineQueue.length === 0) return;
    this.isSyncing = true;

    while (this.offlineQueue.length > 0) {
      const current = this.offlineQueue[0];
      try {
        const res = await fetch(`${this.apiUrl}/api/v1/attendance/punch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.deviceToken}`,
            'X-Idempotency-Key': current.idempotencyKey,
          },
          body: JSON.stringify({
            employeeId: current.employeeId,
            qrToken: current.qrToken,
            barcode: current.barcode,
            eventType: current.eventType,
            source: current.source,
            confidenceScore: current.confidenceScore,
            snapshotUrl: current.snapshotUrl,
          }),
        });

        if (res.ok) {
          this.offlineQueue.shift(); // Remove successfully synced event
          this.isOnline = true;
          console.log(`[EdgeGateway Sync]: Successfully synchronized punch ${current.idempotencyKey}`);
        } else {
          current.retryCount++;
          if (res.status >= 400 && res.status < 500) {
            // Client error (e.g. invalid employee code), discard to prevent queue poison
            console.error(`[EdgeGateway Sync]: Discarding rejected punch: ${res.statusText}`);
            this.offlineQueue.shift();
          } else {
            console.warn(`[EdgeGateway Sync]: Server responded with ${res.status}. Will retry.`);
            break;
          }
        }
      } catch (networkError) {
        this.isOnline = false;
        console.warn(`[EdgeGateway Offline]: Cloud API unreachable. Queueing ${this.offlineQueue.length} events for reconnection.`);
        break;
      }
    }

    this.isSyncing = false;
  }

  public startHeartbeat(intervalMs: number = 30000) {
    setInterval(() => {
      console.log(`[EdgeGateway Heartbeat]: Device alive. Online status: ${this.isOnline}, Buffered queue: ${this.offlineQueue.length}`);
      if (this.offlineQueue.length > 0) {
        this.flushQueue();
      }
    }, intervalMs);
  }
}
