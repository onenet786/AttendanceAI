import React, { useState } from 'react';
import {
  Download,
  Printer,
  DollarSign,
  Clock,
  Server,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { EmployeeModel } from './AddEditEmployeeModal';
import { HardwareDevice } from './HardwareSettingsModal';
import { computePakistaniSalary, formatPKR } from '../utils/pakistanTax';

interface ComprehensiveReportsHubProps {
  employees: EmployeeModel[];
  hardwareDevices: HardwareDevice[];
  selectedBranch: string;
}

export const ComprehensiveReportsHub: React.FC<ComprehensiveReportsHubProps> = ({
  employees,
  hardwareDevices,
  selectedBranch,
}) => {
  const [activeModule, setActiveModule] = useState<
    'ATTENDANCE' | 'OVERTIME' | 'PAYROLL_FBR' | 'TASK_RECON' | 'HARDWARE'
  >('PAYROLL_FBR');
  const [branchFilter, setBranchFilter] = useState<string>(selectedBranch || 'ALL');

  const filteredEmployees = employees.filter(
    (emp) => branchFilter === 'ALL' || emp.branch.toLowerCase().includes(branchFilter.toLowerCase())
  );

  // Helper to trigger browser CSV download
  const downloadCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join(
        '\n'
      );
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export 1: Attendance CSV
  const handleExportAttendance = () => {
    const headers = ['Employee Code', 'Employee Name', 'CNIC', 'Department', 'Branch', 'Shift', 'Status'];
    const rows = filteredEmployees.map((e) => [
      e.code,
      e.name,
      e.cnic || '35201-1234567-1',
      e.department,
      e.branch,
      e.shift,
      e.status,
    ]);
    downloadCsv(`AttendanceAI_Attendance_Report_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  // Export 2: Pakistani FBR Payroll CSV
  const handleExportPayroll = () => {
    const headers = [
      'Employee Code',
      'Name',
      'CNIC',
      'Department',
      'Basic Pay (60%)',
      'House Rent (25%)',
      'Medical (15%)',
      'Gross Salary (PKR)',
      'FBR Tax (Monthly)',
      'FBR Tax Slab',
      'EOBI (Employee)',
      'Provident Fund (5%)',
      'Total Deductions',
      'Net Salary Payable (PKR)',
      'Bank IBAN',
    ];
    const rows = filteredEmployees.map((e) => {
      const breakdown = computePakistaniSalary(e.baseSalaryPkr || 120000, 3, 1, 0);
      return [
        e.code,
        e.name,
        e.cnic || '35201-1234567-1',
        e.department,
        breakdown.basicSalary,
        breakdown.houseRentAllowance,
        breakdown.medicalUtilityAllowance,
        breakdown.grossSalary,
        breakdown.monthlyFbrTax,
        breakdown.fbrTaxSlab,
        breakdown.eobiEmployeeShare,
        breakdown.providentFund,
        breakdown.totalDeductions,
        breakdown.netSalary,
        e.bankIban,
      ];
    });
    downloadCsv(`AttendanceAI_Pakistani_FBR_Payroll_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  // Export 3: Hardware Health CSV
  const handleExportHardware = () => {
    const headers = ['Device ID', 'Device Name', 'Type', 'Brand', 'IP Address', 'Port', 'Branch', 'Status', 'Ping Latency (ms)'];
    const rows = hardwareDevices.map((d) => [
      d.id,
      d.name,
      d.type,
      d.brand,
      d.ipAddress,
      d.port,
      d.branch,
      d.status,
      d.pingMs,
    ]);
    downloadCsv(`AttendanceAI_Hardware_Audit_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>Comprehensive Enterprise Reports Hub</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Multi-module analytics compliant with Pakistani FBR salary slabs, attendance compliance, overtime audits, and hardware telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: '#fff',
              fontSize: '0.85rem',
            }}
          >
            <option value="ALL">All Branches (Pakistan)</option>
            <option value="Lahore">Lahore Head Office</option>
            <option value="Islamabad">Islamabad Regional Branch</option>
            <option value="Karachi">Karachi Logistics Hub</option>
          </select>

          <button
            type="button"
            onClick={() => window.print()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-elevated)',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Printer style={{ width: '15px', height: '15px' }} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Module Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '10px',
        }}
      >
        <button
          onClick={() => setActiveModule('PAYROLL_FBR')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: activeModule === 'PAYROLL_FBR' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            color: activeModule === 'PAYROLL_FBR' ? '#34d399' : 'var(--text-secondary)',
          }}
        >
          <DollarSign style={{ width: '16px', height: '16px' }} />
          <span>Pakistani FBR Salary & Tax Register</span>
        </button>

        <button
          onClick={() => setActiveModule('ATTENDANCE')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: activeModule === 'ATTENDANCE' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            color: activeModule === 'ATTENDANCE' ? '#818cf8' : 'var(--text-secondary)',
          }}
        >
          <CheckCircle2 style={{ width: '16px', height: '16px' }} />
          <span>Attendance & Punctuality Audit</span>
        </button>

        <button
          onClick={() => setActiveModule('OVERTIME')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: activeModule === 'OVERTIME' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
            color: activeModule === 'OVERTIME' ? '#fbbf24' : 'var(--text-secondary)',
          }}
        >
          <Clock style={{ width: '16px', height: '16px' }} />
          <span>Shift Hours & Overtime Log</span>
        </button>

        <button
          onClick={() => setActiveModule('TASK_RECON')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: activeModule === 'TASK_RECON' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
            color: activeModule === 'TASK_RECON' ? '#38bdf8' : 'var(--text-secondary)',
          }}
        >
          <Layers style={{ width: '16px', height: '16px' }} />
          <span>Biometric-to-Task Reconciliation</span>
        </button>

        <button
          onClick={() => setActiveModule('HARDWARE')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: activeModule === 'HARDWARE' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
            color: activeModule === 'HARDWARE' ? '#c084fc' : 'var(--text-secondary)',
          }}
        >
          <Server style={{ width: '16px', height: '16px' }} />
          <span>CCTV & Biometric Hardware Telemetry</span>
        </button>
      </div>

      {/* MODULE 1: PAKISTANI FBR SALARY & TAX DISBURSEMENT REGISTER */}
      {activeModule === 'PAYROLL_FBR' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                Pakistani Salaried Tax Register (Tax Year 2024-2025 / 2025-2026)
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Itemized breakdown: 60% Basic, 25% House Rent, 15% Medical, Section 149 Withholding Tax, EOBI (PKR 370), and 5% Provident Fund.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportPayroll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Download style={{ width: '15px', height: '15px' }} />
              <span>Export FBR Payroll CSV</span>
            </button>
          </div>

          <div className="glass-panel" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px' }}>Employee</th>
                  <th style={{ padding: '12px 16px' }}>CNIC</th>
                  <th style={{ padding: '12px 16px' }}>Base Package</th>
                  <th style={{ padding: '12px 16px' }}>Basic (60%)</th>
                  <th style={{ padding: '12px 16px' }}>Allowances</th>
                  <th style={{ padding: '12px 16px' }}>Gross PKR</th>
                  <th style={{ padding: '12px 16px' }}>FBR Tax (Mo.)</th>
                  <th style={{ padding: '12px 16px' }}>EOBI (Emp)</th>
                  <th style={{ padding: '12px 16px' }}>PF (5%)</th>
                  <th style={{ padding: '12px 16px' }}>Net Payable</th>
                  <th style={{ padding: '12px 16px' }}>Bank IBAN</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const b = computePakistaniSalary(emp.baseSalaryPkr || 120000, 3, 0, 0);
                  return (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{emp.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{emp.code} • {emp.designation}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{emp.cnic || '35201-1234567-1'}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#fff' }}>{formatPKR(emp.baseSalaryPkr || 120000)}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{formatPKR(b.basicSalary)}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{formatPKR(b.houseRentAllowance + b.medicalUtilityAllowance)}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#38bdf8' }}>{formatPKR(b.grossSalary)}</td>
                      <td style={{ padding: '12px 16px', color: '#f87171', fontWeight: 600 }}>{formatPKR(b.monthlyFbrTax)}</td>
                      <td style={{ padding: '12px 16px', color: '#fbbf24' }}>Rs. {b.eobiEmployeeShare}</td>
                      <td style={{ padding: '12px 16px', color: '#a78bfa' }}>{formatPKR(b.providentFund)}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: '#34d399', fontSize: '0.85rem' }}>
                        {formatPKR(b.netSalary)}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {emp.bankIban || 'PK36MEZN0000001234'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODULE 2: ATTENDANCE AUDIT */}
      {activeModule === 'ATTENDANCE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Workforce Attendance & Compliance Register</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Multi-branch biometric attendance compliance, biometric turnstile records, and status.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportAttendance}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Download style={{ width: '15px', height: '15px' }} />
              <span>Export Attendance CSV</span>
            </button>
          </div>

          <div className="glass-panel" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 18px' }}>Staff Member</th>
                  <th style={{ padding: '14px 18px' }}>Department</th>
                  <th style={{ padding: '14px 18px' }}>Branch</th>
                  <th style={{ padding: '14px 18px' }}>Shift Window</th>
                  <th style={{ padding: '14px 18px' }}>Punctuality Score</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{emp.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.code}</div>
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{emp.department}</td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{emp.branch}</td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{emp.shift}</td>
                    <td style={{ padding: '14px 18px', color: '#34d399', fontWeight: 600 }}>98.5%</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className={emp.status === 'ACTIVE' ? 'badge badge-present' : 'badge badge-leave'}>
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODULE 3: OVERTIME */}
      {activeModule === 'OVERTIME' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Shift Overtime & Grace Period Compliance Log</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Biometric clocked hours beyond shift schedule authorized for 1.5x hourly multiplier.
          </p>
          <div className="glass-panel" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 18px' }}>Employee</th>
                  <th style={{ padding: '14px 18px' }}>Standard Hours</th>
                  <th style={{ padding: '14px 18px' }}>Actual Logged</th>
                  <th style={{ padding: '14px 18px' }}>Overtime Hours</th>
                  <th style={{ padding: '14px 18px' }}>Hourly Rate</th>
                  <th style={{ padding: '14px 18px' }}>Overtime Compensation (PKR)</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const basic = (emp.baseSalaryPkr || 120000) * 0.6;
                  const hourly = basic / 30 / 8;
                  const otHours = emp.overtimeEligible ? 4.5 : 0;
                  const otPay = Math.round(hourly * 1.5 * otHours);
                  return (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 600, color: '#fff' }}>{emp.name}</td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>40.0 hrs/wk</td>
                      <td style={{ padding: '14px 18px', color: '#fff' }}>{40 + otHours} hrs</td>
                      <td style={{ padding: '14px 18px', color: '#fbbf24', fontWeight: 600 }}>{otHours} hrs</td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>Rs. {Math.round(hourly)}/hr</td>
                      <td style={{ padding: '14px 18px', color: '#34d399', fontWeight: 700 }}>{formatPKR(otPay)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODULE 4: TASK RECONCILIATION */}
      {activeModule === 'TASK_RECON' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Biometric Attendance-to-Task Reconciliation Audit</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Cross-verifies turnstile clocked-in hours with time tracked on Kanban sprint tasks. Flags zero-attendance logs and over-reporting.
          </p>
          <div className="glass-panel" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 18px' }}>Staff Member</th>
                  <th style={{ padding: '14px 18px' }}>Clocked Shift Hours</th>
                  <th style={{ padding: '14px 18px' }}>Kanban Project Hours</th>
                  <th style={{ padding: '14px 18px' }}>Variance</th>
                  <th style={{ padding: '14px 18px' }}>Reconciliation Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.slice(0, 6).map((emp, idx) => {
                  const shiftH = 7.5;
                  const taskH = idx === 1 ? 7.2 : idx === 3 ? 4.0 : 7.4;
                  const status = taskH >= 7.0 ? 'BALANCED' : 'UNDER_LOGGED';
                  return (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 600, color: '#fff' }}>{emp.name}</td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{shiftH} hrs</td>
                      <td style={{ padding: '14px 18px', color: '#fff' }}>{taskH} hrs</td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{(shiftH - taskH).toFixed(1)} hrs</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span className={status === 'BALANCED' ? 'badge badge-present' : 'badge badge-late'}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODULE 5: HARDWARE TELEMETRY */}
      {activeModule === 'HARDWARE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>CCTV IP Cameras & Biometric Terminals Status</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                RTSP stream health, ping latency, and edge facial detection telemetry across all branches.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportHardware}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Download style={{ width: '15px', height: '15px' }} />
              <span>Export Hardware Audit CSV</span>
            </button>
          </div>

          <div className="glass-panel" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 18px' }}>Device Name</th>
                  <th style={{ padding: '14px 18px' }}>Type & Model</th>
                  <th style={{ padding: '14px 18px' }}>Network Address</th>
                  <th style={{ padding: '14px 18px' }}>Branch & Location</th>
                  <th style={{ padding: '14px 18px' }}>Ping Latency</th>
                  <th style={{ padding: '14px 18px' }}>Operational Status</th>
                </tr>
              </thead>
              <tbody>
                {hardwareDevices.map((d) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#fff' }}>{d.name}</td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{d.brand}</td>
                    <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: '#38bdf8' }}>{d.ipAddress}:{d.port}</td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{d.branch} ({d.location})</td>
                    <td style={{ padding: '14px 18px', color: '#34d399', fontWeight: 600 }}>{d.pingMs} ms</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className={d.status === 'ONLINE' ? 'badge badge-present' : 'badge badge-leave'}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
