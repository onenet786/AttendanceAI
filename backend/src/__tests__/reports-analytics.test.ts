import { describe, it, expect } from 'vitest';
import { AnalyticsService } from '../modules/reports/analytics.service.js';

describe('Phase 9: Comprehensive Reports, Analytics & Export Hub', () => {
  const tenantId = 'test-tenant-analytics';

  it('1. Executive Attendance Analytics > should aggregate rates, branches, and departments', async () => {
    const data = await AnalyticsService.getExecutiveAttendanceAnalytics(tenantId, '2026-09');
    expect(data.month).toBe('2026-09');
    expect(data.overallAttendanceRate).toBeGreaterThan(90);
    expect(data.punctualityIndex).toBeGreaterThan(80);
    expect(data.branchBreakdown.length).toBe(2);
    expect(data.departmentBreakdown.length).toBe(5);
  });

  it('2. Payroll Disbursement Analytics > should compute department summaries and statutory totals', async () => {
    const data = await AnalyticsService.getPayrollDisbursementAnalytics(tenantId, 'September 2026');
    expect(data.totalGrossDisbursed).toBe(139500.0);
    expect(data.totalNetDisbursed).toBe(118240.5);
    expect(data.totalTaxWithheld).toBe(14210.25);
    expect(data.totalProvidentFundContribution).toBe(6975.0);
    expect(data.departmentSummaries.length).toBe(5);
  });

  it('3. Multi-Format Export Engine > should export in CSV, JSON, and HTML_PDF formats', async () => {
    const analytics = await AnalyticsService.getExecutiveAttendanceAnalytics(tenantId);

    // CSV format
    const csvExport = AnalyticsService.exportReport(analytics, 'CSV', 'Attendance_Test');
    expect(csvExport.contentType).toBe('text/csv');
    expect(csvExport.filename).toContain('.csv');
    expect(csvExport.content).toContain('"Metric","Value"');

    // JSON format
    const jsonExport = AnalyticsService.exportReport(analytics, 'JSON', 'Attendance_Test');
    expect(jsonExport.contentType).toBe('application/json');
    expect(jsonExport.filename).toContain('.json');
    const parsed = JSON.parse(jsonExport.content);
    expect(parsed.overallAttendanceRate).toBe(analytics.overallAttendanceRate);

    // HTML / PDF format
    const htmlExport = AnalyticsService.exportReport(analytics, 'HTML_PDF', 'Attendance_Test');
    expect(htmlExport.contentType).toBe('text/html');
    expect(htmlExport.filename).toContain('.html');
    expect(htmlExport.content).toContain('<!DOCTYPE html>');
  });
});
