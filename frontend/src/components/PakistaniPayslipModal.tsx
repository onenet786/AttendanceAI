import React from 'react';
import { X, Printer } from 'lucide-react';

import { EmployeeModel } from './AddEditEmployeeModal';
import { computePakistaniSalary, formatPKR } from '../utils/pakistanTax';

interface PakistaniPayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeModel | null;
  periodName?: string;
}

export const PakistaniPayslipModal: React.FC<PakistaniPayslipModalProps> = ({
  isOpen,
  onClose,
  employee,
  periodName = 'September 2026',
}) => {
  if (!isOpen || !employee) return null;

  const breakdown = computePakistaniSalary(employee.baseSalaryPkr || 120000, 4.0, 0, 0);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '750px',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '16px',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          background: 'linear-gradient(145deg, #0d1117 0%, #161b22 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
          padding: '32px',
        }}
      >
        {/* Top Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-present" style={{ fontSize: '0.75rem' }}>
              FBR SALARIED COMPLIANT
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Tax Year 2024-2025 / 2025-2026
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-elevated)',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Printer style={{ width: '14px', height: '14px' }} />
              <span>Print Slip</span>
            </button>

            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>

        {/* Printable Payslip Card */}
        <div
          id="printable-payslip"
          style={{
            background: 'var(--bg-elevated)',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '0.02em' }}>
                AttendanceAI (Pvt) Ltd
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                FBR NTN: 8492019-3 • STRN: 3277876123456 • Corporate Tax Unit Lahore
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Head Office: 42-B Tech Park, Gulberg III, Lahore, Pakistan
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10b981' }}>MONTHLY SALARY SLIP</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginTop: '2px' }}>{periodName}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Currency: Pakistani Rupee (PKR)</div>
            </div>
          </div>

          {/* Employee Info Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '14px 18px',
              borderRadius: '8px',
              fontSize: '0.8rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Employee Name:</span>
              <div style={{ fontWeight: 700, color: '#fff' }}>{employee.name}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Employee Code:</span>
              <div style={{ fontWeight: 600, color: '#818cf8' }}>{employee.code}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Pakistani CNIC:</span>
              <div style={{ fontWeight: 600, color: '#fff' }}>{employee.cnic || '35201-1234567-1'}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Department:</span>
              <div style={{ fontWeight: 600, color: '#fff' }}>{employee.department}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Designation:</span>
              <div style={{ fontWeight: 600, color: '#fff' }}>{employee.designation}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Branch Location:</span>
              <div style={{ fontWeight: 600, color: '#fff' }}>{employee.branch}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Bank IBAN:</span>
              <div style={{ fontWeight: 600, color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {employee.bankIban || 'PK36MEZN0000001234'}
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Payment Mode:</span>
              <div style={{ fontWeight: 600, color: '#34d399' }}>Direct 1Link Transfer</div>
            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Earnings Table */}
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '10px 14px', fontWeight: 700, color: '#34d399', fontSize: '0.82rem' }}>
                EARNINGS & ALLOWANCES (PKR)
              </div>
              <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 14px', color: 'var(--text-secondary)' }}>Basic Salary (60%)</td>
                    <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 600, color: '#fff' }}>{formatPKR(breakdown.basicSalary)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 14px', color: 'var(--text-secondary)' }}>House Rent Allowance (25%)</td>
                    <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 600, color: '#fff' }}>{formatPKR(breakdown.houseRentAllowance)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 14px', color: 'var(--text-secondary)' }}>Medical & Utility Allowance (15%)</td>
                    <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 600, color: '#fff' }}>{formatPKR(breakdown.medicalUtilityAllowance)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 14px', color: 'var(--text-secondary)' }}>Overtime Pay (4.0 hrs @ 1.5x)</td>
                    <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 600, color: '#34d399' }}>{formatPKR(breakdown.overtimePay)}</td>
                  </tr>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.03)', fontWeight: 700 }}>
                    <td style={{ padding: '10px 14px', color: '#fff' }}>Total Gross Earnings</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#38bdf8' }}>{formatPKR(breakdown.grossSalary)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Deductions Table */}
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.12)', padding: '10px 14px', fontWeight: 700, color: '#f87171', fontSize: '0.82rem' }}>
                STATUTORY DEDUCTIONS (PKR)
              </div>
              <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 14px', color: 'var(--text-secondary)' }}>
                      <div>FBR Income Tax (Sec 149)</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{breakdown.fbrTaxSlab}</div>
                    </td>
                    <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 600, color: '#f87171' }}>{formatPKR(breakdown.monthlyFbrTax)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 14px', color: 'var(--text-secondary)' }}>
                      <div>EOBI Contribution</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Employer pays Rs. 1,850</div>
                    </td>
                    <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 600, color: '#fbbf24' }}>Rs. {breakdown.eobiEmployeeShare}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 14px', color: 'var(--text-secondary)' }}>Provident Fund (5% Basic)</td>
                    <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 600, color: '#a78bfa' }}>{formatPKR(breakdown.providentFund)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 14px', color: 'var(--text-secondary)' }}>Attendance Deductions</td>
                    <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 600, color: '#fff' }}>Rs. 0</td>
                  </tr>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.03)', fontWeight: 700 }}>
                    <td style={{ padding: '10px 14px', color: '#fff' }}>Total Deductions</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#f87171' }}>{formatPKR(breakdown.totalDeductions)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Net Pay Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.3))',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '10px',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: '#a7f3d0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                NET SALARY PAYABLE (PKR)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: '2px' }}>
                Disbursed to IBAN ending in {employee.bankIban ? employee.bankIban.slice(-4) : '7801'}
              </div>
            </div>

            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>
              {formatPKR(breakdown.netSalary)}
            </div>
          </div>

          {/* Signatures Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '24px', borderTop: '1px dashed var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <div>
              <div style={{ height: '30px' }} />
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '4px', width: '160px', textAlign: 'center' }}>
                Authorized HR Signatory
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '30px' }} />
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '4px', width: '160px', textAlign: 'center' }}>
                Finance & Payroll Audit
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ height: '30px' }} />
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '4px', width: '160px', textAlign: 'center' }}>
                Employee Acknowledgement
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
