import { describe, it, expect } from 'vitest';
import { PayrollCalculator } from '../modules/payroll/payroll.calculator.js';
import { PayrollService } from '../modules/payroll/payroll.service.js';

describe('Phase 7: Payroll Management Subsystem', () => {
  const tenantId = 'tenant-demo-uuid-001';

  describe('1. Rate Multipliers & Attendance Deductions Math', () => {
    it('should compute standard daily and hourly rates accurately', () => {
      const dailyRate = PayrollCalculator.calculateDailyRate(6000, 30);
      expect(dailyRate).toBe(200.0);

      const hourlyRate = PayrollCalculator.calculateHourlyRate(dailyRate, 8);
      expect(hourlyRate).toBe(25.0);
    });

    it('should compute approved overtime with 1.5x multiplier', () => {
      const hourlyRate = 25.0;
      const overtimePay = PayrollCalculator.calculateOvertimePay(hourlyRate, 4, 1.5);
      expect(overtimePay).toBe(150.0); // 4 * 25 * 1.5 = 150
    });

    it('should apply full daily rate for absent days and penalize lateness in blocks of 3', () => {
      const dailyRate = 200.0;

      // Case A: 2 absent days, 7 late days -> 2 blocks of 3 lateness = 2 * 0.5 * 200 = 200
      const deductions = PayrollCalculator.calculateAttendanceDeductions(dailyRate, 2, 7);
      expect(deductions.unpaidAbsenceDeduction).toBe(400.0);
      expect(deductions.latenessPenalty).toBe(200.0);
      expect(deductions.total).toBe(600.0);

      // Case B: 0 absent days, 2 late days -> below threshold of 3, no penalty
      const zeroPenalty = PayrollCalculator.calculateAttendanceDeductions(dailyRate, 0, 2);
      expect(zeroPenalty.latenessPenalty).toBe(0);
      expect(zeroPenalty.total).toBe(0);
    });
  });

  describe('2. Progressive Tax Slabs & Statutory Funds', () => {
    it('should evaluate progressive income tax brackets correctly', () => {
      // Bracket 1: <= 1000 -> 0
      expect(PayrollCalculator.calculateProgressiveTax(800)).toBe(0);

      // Bracket 2: 2000 -> (2000 - 1000) * 0.05 = 50
      expect(PayrollCalculator.calculateProgressiveTax(2000)).toBe(50.0);

      // Bracket 3: 4000 -> 75 + (4000 - 2500) * 0.125 = 75 + 187.5 = 262.5
      expect(PayrollCalculator.calculateProgressiveTax(4000)).toBe(262.5);

      // Custom percentage override
      expect(PayrollCalculator.calculateProgressiveTax(5000, 10)).toBe(500.0);
    });

    it('should calculate 5% statutory provident fund contribution', () => {
      const pf = PayrollCalculator.calculateProvidentFund(6000, 5);
      expect(pf).toBe(300.0);
    });
  });

  describe('3. Comprehensive Attendance-to-Gross Payslip Breakdown', () => {
    it('should calculate itemized gross, deductions, and net pay', () => {
      const structure = {
        basicSalary: 6000,
        houseAllowance: 1200,
        transportAllowance: 400,
        medicalAllowance: 300,
        currency: 'USD',
      };

      const attendance = {
        totalScheduledDays: 30,
        presentDays: 28,
        absentDays: 1, // 1 * $200 = $200
        lateDays: 3, // 1 block * $100 = $100
        onLeaveDays: 1,
        totalWorkedHours: 176,
        overtimeHours: 4, // 4 * $25 * 1.5 = $150
      };

      const payslip = PayrollCalculator.computePayslip('emp-test-01', structure, attendance);

      // Gross = Basic (6000) + Allowances (1900) + OT (150) = 8050
      expect(payslip.grossSalary).toBe(8050.0);
      expect(payslip.allowances.total).toBe(1900.0);
      expect(payslip.overtime.totalPay).toBe(150.0);

      // Deductions: Absence (200) + Lateness (100) + PF (300) + Tax (Bracket 4 on 8050: 387.5 + (8050-5000)*0.225 = 1073.75)
      expect(payslip.deductions.unpaidAbsenceDeduction).toBe(200.0);
      expect(payslip.deductions.latenessPenalty).toBe(100.0);
      expect(payslip.deductions.providentFund).toBe(300.0);
      expect(payslip.deductions.incomeTax).toBe(1073.75);

      // Net Salary = Gross - Total Deductions
      expect(payslip.netSalary).toBe(Number((8050.0 - payslip.deductions.total).toFixed(2)));
    });
  });

  describe('4. Payroll Accounting Periods & Immutability', () => {
    it('should create and execute monthly payroll batch run', async () => {
      const period = await PayrollService.createPayrollPeriod(tenantId, {
        name: 'September 2026 Batch',
        companyId: 'company-01',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
      });

      expect(period.id).toBeDefined();
      expect(period.status).toBe('DRAFT');

      const summary = await PayrollService.executePayrollRun(tenantId, period.id);
      expect(summary.processedEmployees).toBeGreaterThan(0);
      expect(summary.totalGrossPay).toBeGreaterThan(0);
      expect(summary.totalNetPayout).toBeGreaterThan(0);
      expect(summary.status).toBe('REVIEW');
    });

    it('should lock payroll period and reject modifications once locked', async () => {
      const locked = await PayrollService.lockPayrollPeriod(tenantId, 'period-test-lock', 'user-admin');
      expect(locked.status).toBe('LOCKED');

      // Attempting to re-run a locked period must throw BadRequestError
      await expect(PayrollService.executePayrollRun(tenantId, 'period-test-lock')).rejects.toThrow(
        'Cannot re-execute a LOCKED payroll period'
      );
    });
  });
});
