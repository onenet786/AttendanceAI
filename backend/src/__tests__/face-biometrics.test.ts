import { describe, it, expect, beforeEach } from 'vitest';
import { FaceBiometricService } from '../modules/biometrics/face.service';
import { CamerasService } from '../modules/cameras/cameras.service';

describe('Phase 4: Face Biometrics & Camera Gateway Subsystem', () => {
  const tenantId = 'tenant-demo-corp';
  const branchId = 'branch-lahore';
  let faceService: FaceBiometricService;
  let camerasService: CamerasService;

  // Helper to generate a synthetic 128-dimensional vector
  const createVector = (seed: number, dims: number = 128): number[] => {
    const vec: number[] = [];
    for (let i = 0; i < dims; i++) {
      // Deterministic pseudo-random generation
      vec.push(Math.sin(seed + i * 0.3));
    }
    return FaceBiometricService.normalizeVector(vec);
  };

  beforeEach(() => {
    FaceBiometricService.clearGallery();
    FaceBiometricService.clearCooldowns();
    faceService = new FaceBiometricService();
    camerasService = new CamerasService();
  });

  describe('1. Vector Math & Normalization', () => {
    it('should compute exact Euclidean L2 norm and normalize vectors to length 1.0', () => {
      const rawVector = [3, 4]; // Length is sqrt(3^2 + 4^2) = 5
      expect(FaceBiometricService.vectorNorm(rawVector)).toBeCloseTo(5.0, 5);

      const normalized = FaceBiometricService.normalizeVector(rawVector);
      expect(normalized[0]).toBeCloseTo(0.6, 5);
      expect(normalized[1]).toBeCloseTo(0.8, 5);
      expect(FaceBiometricService.vectorNorm(normalized)).toBeCloseTo(1.0, 5);
    });

    it('should compute Cosine Similarity accurately: identical = 1.0, orthogonal = 0.0, opposite = -1.0', () => {
      const v1 = [1, 0, 0];
      const v2 = [1, 0, 0];
      const vOrthogonal = [0, 1, 0];
      const vOpposite = [-1, 0, 0];

      expect(FaceBiometricService.cosineSimilarity(v1, v2)).toBeCloseTo(1.0, 5);
      expect(FaceBiometricService.cosineSimilarity(v1, vOrthogonal)).toBeCloseTo(0.0, 5);
      expect(FaceBiometricService.cosineSimilarity(v1, vOpposite)).toBeCloseTo(-1.0, 5);
    });
  });

  describe('2. Face Enrollment & Identification', () => {
    it('should enroll an employee face template and match with high confidence', async () => {
      const empVector = createVector(42);

      await faceService.enrollFace(tenantId, 'emp-001', empVector, 0.98);

      // Candidate vector with slight camera noise (e.g. 95% similar)
      const noisyCandidate = empVector.map((val) => val + (Math.random() * 0.05 - 0.025));
      const matchResult = faceService.identifyFace(tenantId, noisyCandidate, branchId, 0.82);

      expect(matchResult.matched).toBe(true);
      expect(matchResult.employeeId).toBe('emp-001');
      expect(matchResult.confidence).toBeGreaterThan(0.82);
    });

    it('should reject unknown candidate vectors below confidence threshold', async () => {
      const empVector = createVector(10);
      await faceService.enrollFace(tenantId, 'emp-001', empVector, 0.95);

      // Totally different face vector
      const unknownPersonVector = createVector(999);
      const matchResult = faceService.identifyFace(tenantId, unknownPersonVector, branchId, 0.82);

      expect(matchResult.matched).toBe(false);
      expect(matchResult.confidence).toBeLessThan(0.82);
    });
  });

  describe('3. Anti-Spoofing & Liveness Verification', () => {
    it('should accept valid live human presentations (high liveness score)', () => {
      const result = faceService.verifyLiveness({
        livenessScore: 0.94,
        blinkDetected: true,
        headAngleYaw: 5,
        headAnglePitch: 2,
      });

      expect(result.isLive).toBe(true);
    });

    it('should reject synthetic 2D screen/paper presentation attacks', () => {
      const result = faceService.verifyLiveness({
        livenessScore: 0.45, // Screen replay detected
        blinkDetected: false,
      });

      expect(result.isLive).toBe(false);
      expect(result.reason).toContain('Possible 2D photo/screen presentation attack');
    });

    it('should reject extreme head angles exceeding 45 degrees', () => {
      const result = faceService.verifyLiveness({
        livenessScore: 0.92,
        headAngleYaw: 62, // Tilted sideways away from camera
      });

      expect(result.isLive).toBe(false);
      expect(result.reason).toContain('alignment threshold');
    });
  });

  describe('4. Duplicate Punch Cooldown & De-duplication', () => {
    it('should enforce 5-minute cooldown between repeated facial scans of the same employee', () => {
      const employeeId = 'emp-001';

      // First punch attempt: Allowed
      const punch1 = faceService.checkAndSetCooldown(tenantId, employeeId, 300);
      expect(punch1.allowed).toBe(true);
      expect(punch1.remainingSeconds).toBe(0);

      // Immediate second punch (e.g. employee lingering at turnstile): Blocked
      const punch2 = faceService.checkAndSetCooldown(tenantId, employeeId, 300);
      expect(punch2.allowed).toBe(false);
      expect(punch2.remainingSeconds).toBeGreaterThan(290);
    });
  });

  describe('5. Edge Gateway Offline Batch Synchronization', () => {
    it('should process and ingest queued offline punches from Edge Gateway SQLite cache', async () => {
      const emp1Vector = createVector(101);
      const emp2Vector = createVector(202);

      await faceService.enrollFace(tenantId, 'emp-101', emp1Vector);
      await faceService.enrollFace(tenantId, 'emp-202', emp2Vector);

      const batchEvents = [
        {
          eventId: 'offline-ev-1',
          cameraId: 'cam-lhr-01',
          embedding: emp1Vector,
          livenessScore: 0.96,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          eventId: 'offline-ev-2',
          cameraId: 'cam-lhr-01',
          embedding: emp2Vector,
          livenessScore: 0.98,
          timestamp: new Date(Date.now() - 1800000).toISOString(),
        },
      ];

      const syncResult = await camerasService.syncGatewayBatch(tenantId, 'dtk_gateway_token_123', batchEvents);

      expect(syncResult.totalReceived).toBe(2);
      expect(syncResult.syncedCount).toBe(2);
      expect(syncResult.rejectedCount).toBe(0);
    });
  });
});
