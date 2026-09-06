import { describe, it, expect } from 'vitest';
import { AttendanceService } from '../modules/attendance/attendance.service.js';
import { AttendanceAction } from '@prisma/client';

describe('Attendance Calculation Engine: Multi-Interval & Break Tracking', () => {
  it('should accurately calculate total worked hours and break time across multiple IN/OUT punches', () => {
    // Scenario: Employee punches IN at 09:00, OUT at 13:00, IN at 14:00, OUT at 17:30
    const baseDate = new Date('2026-09-07T00:00:00.000Z');

    const in1 = new Date(baseDate);
    in1.setUTCHours(9, 0, 0, 0);

    const out1 = new Date(baseDate);
    out1.setUTCHours(13, 0, 0, 0); // 4 hours work (240 min)

    const in2 = new Date(baseDate);
    in2.setUTCHours(14, 0, 0, 0); // 1 hour break (60 min) between 13:00 and 14:00

    const out2 = new Date(baseDate);
    out2.setUTCHours(17, 30, 0, 0); // 3.5 hours work (210 min)

    const events = [
      { eventType: AttendanceAction.CHECK_IN, timestamp: in1 },
      { eventType: AttendanceAction.CHECK_OUT, timestamp: out1 },
      { eventType: AttendanceAction.CHECK_IN, timestamp: in2 },
      { eventType: AttendanceAction.CHECK_OUT, timestamp: out2 },
    ];

    const result = AttendanceService.calculatePunches(events);

    // Total Work: 240 + 210 = 450 minutes (7.5 hours)
    expect(result.totalWorkMinutes).toBe(450);
    expect(result.totalBreakMinutes).toBe(60);
    expect(result.workingIntervals.length).toBe(2);
    expect(result.breakIntervals.length).toBe(1);
    expect(result.firstIn).toEqual(in1);
    expect(result.lastOut).toEqual(out2);
  });

  it('should handle BREAK_START and BREAK_END action types seamlessly', () => {
    // Scenario: IN at 09:00, BREAK_START at 12:00, BREAK_END at 12:45, OUT at 17:00
    const baseDate = new Date('2026-09-07T00:00:00.000Z');

    const inTime = new Date(baseDate);
    inTime.setUTCHours(9, 0, 0, 0);

    const breakStart = new Date(baseDate);
    breakStart.setUTCHours(12, 0, 0, 0); // 3 hours (180 min) work

    const breakEnd = new Date(baseDate);
    breakEnd.setUTCHours(12, 45, 0, 0); // 45 min break

    const outTime = new Date(baseDate);
    outTime.setUTCHours(17, 0, 0, 0); // 4 hours 15 min (255 min) work

    const events = [
      { eventType: AttendanceAction.CHECK_IN, timestamp: inTime },
      { eventType: AttendanceAction.BREAK_START, timestamp: breakStart },
      { eventType: AttendanceAction.BREAK_END, timestamp: breakEnd },
      { eventType: AttendanceAction.CHECK_OUT, timestamp: outTime },
    ];

    const result = AttendanceService.calculatePunches(events);

    // Total Work: 180 + 255 = 435 minutes (7.25 hours)
    expect(result.totalWorkMinutes).toBe(435);
    expect(result.totalBreakMinutes).toBe(45);
    expect(result.workingIntervals.length).toBe(2);
  });

  it('should return empty metrics if no events exist', () => {
    const result = AttendanceService.calculatePunches([]);
    expect(result.totalWorkMinutes).toBe(0);
    expect(result.totalBreakMinutes).toBe(0);
    expect(result.firstIn).toBeNull();
    expect(result.lastOut).toBeNull();
  });
});
