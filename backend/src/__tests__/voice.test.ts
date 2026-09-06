import { describe, it, expect, beforeEach } from 'vitest';
import { VoiceService } from '../modules/voice/voice.service';

describe('Phase 5: Voice Attendance & Voice Commands Subsystem', () => {
  const tenantId = 'tenant-demo-corp';
  const employeeId = 'emp-001';
  let voiceService: VoiceService;

  // Helper to generate a synthetic 128-dimensional acoustic spectral vector
  const createVoiceVector = (seed: number, dims: number = 128): number[] => {
    const vec: number[] = [];
    for (let i = 0; i < dims; i++) {
      vec.push(Math.sin(seed + i * 0.45) * Math.cos(seed * 0.2 + i * 0.1));
    }
    return VoiceService.normalizeVector(vec);
  };

  beforeEach(() => {
    VoiceService.clearCache();
    voiceService = new VoiceService();
  });

  describe('1. Natural Language Intent Parser', () => {
    it('should accurately parse CHECK_IN commands with varied phrasing', () => {
      const phrases = [
        'Clock me in',
        'Please check in',
        'Punch in for morning shift',
        'Starting work today',
        'I have arrived at office',
      ];

      for (const phrase of phrases) {
        const result = VoiceService.parseVoiceIntent(phrase);
        expect(result.intent).toBe('CHECK_IN');
        expect(result.confidence).toBeGreaterThan(0.9);
      }
    });

    it('should accurately parse CHECK_OUT commands with varied phrasing', () => {
      const phrases = [
        'Clock me out',
        'Check out for today',
        'Punch out heading home',
        'Done for the day wrap up',
        'Ending my shift',
      ];

      for (const phrase of phrases) {
        const result = VoiceService.parseVoiceIntent(phrase);
        expect(result.intent).toBe('CHECK_OUT');
        expect(result.confidence).toBeGreaterThan(0.9);
      }
    });

    it('should accurately parse BREAK_START and BREAK_END commands', () => {
      const startPhrases = ['Going on lunch break', 'Start break', 'Taking a coffee break'];
      for (const phrase of startPhrases) {
        const result = VoiceService.parseVoiceIntent(phrase);
        expect(result.intent).toBe('BREAK_START');
      }

      const endPhrases = ['Back from break', 'Ending break', 'Finished lunch resuming work'];
      for (const phrase of endPhrases) {
        const result = VoiceService.parseVoiceIntent(phrase);
        expect(result.intent).toBe('BREAK_END');
      }
    });

    it('should parse queries for status, hours, and team attendance', () => {
      expect(VoiceService.parseVoiceIntent('What is my attendance status today?').intent).toBe('STATUS_QUERY');
      expect(VoiceService.parseVoiceIntent('How many hours have I worked this week?').intent).toBe('HOURS_QUERY');

      const teamQuery = VoiceService.parseVoiceIntent('Who is absent today in Lahore?');
      expect(teamQuery.intent).toBe('TEAM_QUERY');
      expect(teamQuery.extractedParameters.branchName).toBe('LAHORE');
    });

    it('should classify unhandled or out-of-domain phrases as UNKNOWN', () => {
      const result = VoiceService.parseVoiceIntent('What is the weather in Paris?');
      expect(result.intent).toBe('UNKNOWN');
      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('2. Acoustic Voice Biometric Verification', () => {
    it('should enroll voiceprint and verify authentic voice with high acoustic confidence', async () => {
      const enrolledVector = createVoiceVector(77);
      await voiceService.enrollVoiceprint(tenantId, employeeId, enrolledVector);

      // Same voice with subtle microphone ambient noise
      const candidateVoice = enrolledVector.map((val) => val + (Math.random() * 0.04 - 0.02));
      const auth = voiceService.verifyVoiceprint(tenantId, employeeId, candidateVoice, 0.80);

      expect(auth.verified).toBe(true);
      expect(auth.confidence).toBeGreaterThan(0.80);
      expect(auth.message).toContain('Voiceprint verified');
    });

    it('should reject impostor voiceprints below acoustic threshold', async () => {
      const enrolledVector = createVoiceVector(12);
      await voiceService.enrollVoiceprint(tenantId, employeeId, enrolledVector);

      // Completely different speaker voice vector
      const impostorVector = createVoiceVector(888);
      const auth = voiceService.verifyVoiceprint(tenantId, employeeId, impostorVector, 0.80);

      expect(auth.verified).toBe(false);
      expect(auth.confidence).toBeLessThan(0.80);
      expect(auth.message).toContain('below required');
    });
  });

  describe('3. Voice Command Execution & Central Attendance Engine Routing', () => {
    it('should execute voice punch, invoke central engine, and return conversational spoken response', async () => {
      const voiceVector = createVoiceVector(55);
      await voiceService.enrollVoiceprint(tenantId, employeeId, voiceVector);

      const commandResult = await voiceService.processVoiceCommand({
        tenantId,
        employeeId,
        transcript: 'Clock me in for today',
        candidateVoiceVector: voiceVector,
        branchId: 'branch-lhr',
      });

      expect(commandResult.success).toBe(true);
      expect(commandResult.intent).toBe('CHECK_IN');
      expect(commandResult.spokenResponse).toContain('checked you in');
      expect(commandResult.punch).toBeDefined();
    });

    it('should respond to voice queries with natural conversational answers', async () => {
      const hoursResult = await voiceService.processVoiceCommand({
        tenantId,
        employeeId,
        transcript: 'How many hours have I worked this week?',
      });

      expect(hoursResult.success).toBe(true);
      expect(hoursResult.intent).toBe('HOURS_QUERY');
      expect(hoursResult.spokenResponse).toContain('working hours');

      const teamResult = await voiceService.processVoiceCommand({
        tenantId,
        employeeId,
        transcript: 'Who is absent today in Lahore?',
      });

      expect(teamResult.success).toBe(true);
      expect(teamResult.intent).toBe('TEAM_QUERY');
      expect(teamResult.spokenResponse).toContain('Lahore');
    });

    it('should block voice punch if voice biometric authentication fails', async () => {
      const authenticVoice = createVoiceVector(90);
      await voiceService.enrollVoiceprint(tenantId, employeeId, authenticVoice);

      const impostorVoice = createVoiceVector(333);
      const result = await voiceService.processVoiceCommand({
        tenantId,
        employeeId,
        transcript: 'Clock me in',
        candidateVoiceVector: impostorVoice, // Impostor voice
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('VOICE_AUTHENTICATION_FAILED');
      expect(result.spokenResponse).toContain('Voice authentication failed');
    });
  });
});
