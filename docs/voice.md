# Phase 5: Voice-Based Attendance, Voice Commands & Speech AI Engine

## 1. Executive Summary

Phase 5 introduces hands-free voice biometric authentication, natural language speech-to-intent understanding, and spoken voice AI assistant capabilities to the **AttendanceAI** enterprise platform.

Employees and supervisors can speak naturally into browser kiosks, mobile devices, or hands-free conference terminals. The audio stream is analyzed using:
1. **Acoustic Speaker Biometrics**: 128-dimensional Mel-Frequency Cepstral Coefficient (MFCC) feature vector representation and cosine similarity scoring ($\ge 0.80$).
2. **Speech-to-Text Processing**: Streaming Whisper STT or Web Speech API transcription.
3. **Natural Language Understanding (NLU)**: Multi-intent semantic parsing supporting standard attendance verbs, lunch/break management, shift status queries, weekly timesheet queries, and team occupancy queries.
4. **Central Attendance Engine Routing**: All voice-driven actions route directly into `AttendanceService.recordPunch()` with `source: 'VOICE'`.
5. **Conversational Spoken Feedback**: Dynamically synthesized spoken responses confirming identity, timestamps, worked hours, or team status.

---

## 2. Acoustic Biometric Voiceprint Architecture

### 2.1 128-Dimensional MFCC Feature Vectors
* Speech signals are sampled at 16kHz Mono.
* Framed into 25ms windows with 10ms overlap and Hann windowing.
* Filtered across a 40-channel Mel-scale filterbank spanning 300Hz to 8000Hz.
* Logarithmic power spectra are transformed via Discrete Cosine Transform (DCT) into 128 acoustic cepstral coefficients.
* Vectors are $L_2$-normalized prior to storage and comparison:
  $$\hat{v} = \frac{v}{\|v\|_2} = \frac{v}{\sqrt{\sum_{i=1}^{128} v_i^2}}$$

### 2.2 Biometric Verification Math
Given an incoming speaker vector $A$ and enrolled employee template vector $B$:
$$\text{Cosine Similarity} = \cos(\theta) = \frac{A \cdot B}{\|A\|_2 \|B\|_2} = \sum_{i=1}^{128} \hat{A}_i \cdot \hat{B}_i$$

* **Authentication Threshold**:
  * $\text{Score} \ge 0.80$: **Authenticated** (Identity confirmed).
  * $\text{Score} < 0.80$: **Rejected** (Biometric mismatch; unauthorized speaker blocked from punching for another employee).

---

## 3. Natural Language Intent Grammar

The NLU engine extracts structured intent and slot parameters from freeform speech.

| Intent | Sample Utterances | Dispatched Action |
| :--- | :--- | :--- |
| `CHECK_IN` | *"Clock me in for today"*, *"Start my shift"*, *"Good morning, sign me in"* | `AttendanceService.recordPunch({ eventType: 'CHECK_IN', source: 'VOICE' })` |
| `CHECK_OUT` | *"Clock me out, wrapping up shift"*, *"End my shift"*, *"Sign me out for today"* | `AttendanceService.recordPunch({ eventType: 'CHECK_OUT', source: 'VOICE' })` |
| `BREAK_START` | *"Going on lunch break"*, *"Starting 30-min break"*, *"Heading to cafeteria"* | Logs break interval start; updates active timesheet status |
| `BREAK_END` | *"Back from lunch"*, *"Finished my break"*, *"Resume shift"* | Logs break interval end; resumes worked hour accumulation |
| `HOURS_QUERY` | *"How many hours did I work this week?"*, *"What are my total hours?"* | Computes cumulative $\sum (OUT_i - IN_i)$ for employee in current pay period |
| `STATUS_QUERY` | *"What is my attendance status today?"*, *"Am I checked in?"* | Queries today's active punch ledger and reports exact check-in time |
| `TEAM_QUERY` | *"Who is absent in the office right now?"*, *"Team status"* | Queries branch attendance ledger; returns scheduled vs present vs absent headcounts |

---

## 4. API Endpoints

### 4.1 Enroll Voiceprint
```http
POST /api/v1/voice/enroll
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "emp-uuid-1",
  "voiceVector": [0.082, -0.145, 0.231, ... 128 elements]
}
```

### 4.2 Process Voice Command
```http
POST /api/v1/voice/command
Authorization: Bearer <token>
Content-Type: application/json

{
  "speechText": "Clock me in for today",
  "employeeId": "emp-uuid-1",
  "voiceVector": [0.081, -0.142, 0.229, ... 128 elements],
  "branch": "Lahore Head Office"
}
```

#### Response:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Voice command executed successfully",
  "data": {
    "intent": "CHECK_IN",
    "authenticated": true,
    "confidence": 0.964,
    "responseText": "Hello Alex Morgan, your acoustic voiceprint has been verified (96.4% match). You are clocked in at 09:00:15 AM. Have a productive day!",
    "punchEvent": {
      "id": "punch-uuid-88",
      "eventType": "CHECK_IN",
      "source": "VOICE",
      "timestamp": "2026-09-07T09:00:15.000Z"
    }
  }
}
```

---

## 5. Security & Anti-Spoofing

1. **Speaker Identity Pinning**: A user cannot trigger a punch on behalf of another colleague without a matched voiceprint ($\ge 0.80$).
2. **Replay Attack Resistance**: Every client audio transmission includes an anti-replay nonce and client timestamp (rejected if older than 30s).
3. **Redaction in Audit Trail**: Acoustic vectors are never exposed in plaintext logs; only one-way SHA-256 digests are retained for compliance verification.
