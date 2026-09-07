import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save } from 'lucide-react';

export interface EmployeeModel {
  id: string;
  code: string;
  name: string;
  email: string;
  phone?: string;
  cnic?: string;
  department: string;
  branch: string;
  designation: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED';
  photo: string;
  shift: string;
  baseSalaryPkr: number;
  overtimeEligible: boolean;
  bankIban: string;
  faceEnrolled?: boolean;
  voiceEnrolled?: boolean;
}

interface AddEditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: EmployeeModel) => void;
  employeeToEdit?: EmployeeModel | null;
  departments: string[];
  designationsByDept: Record<string, string[]>;
  branches: string[];
  shifts: string[];
}

export const AddEditEmployeeModal: React.FC<AddEditEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employeeToEdit,
  departments,
  designationsByDept,
  branches,
  shifts,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('0300-');
  const [cnic, setCnic] = useState('');
  const [department, setDepartment] = useState(departments[0] || 'Information Technology');
  const [designation, setDesignation] = useState('');
  const [branch, setBranch] = useState(branches[0] || 'Lahore Head Office');
  const [shift, setShift] = useState(shifts[0] || '09:00 - 17:00 (15m grace)');
  const [status, setStatus] = useState<'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED'>('ACTIVE');
  const [baseSalaryPkr, setBaseSalaryPkr] = useState<number>(120000);
  const [overtimeEligible, setOvertimeEligible] = useState<boolean>(true);
  const [bankIban, setBankIban] = useState('PK36HABB0000001234567801');
  const [photo, setPhoto] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');

  useEffect(() => {
    if (employeeToEdit) {
      setName(employeeToEdit.name);
      setCode(employeeToEdit.code);
      setEmail(employeeToEdit.email);
      setPhone(employeeToEdit.phone || '0300-1234567');
      setCnic(employeeToEdit.cnic || '35201-1234567-1');
      setDepartment(employeeToEdit.department);
      setDesignation(employeeToEdit.designation);
      setBranch(employeeToEdit.branch);
      setShift(employeeToEdit.shift);
      setStatus(employeeToEdit.status);
      setBaseSalaryPkr(employeeToEdit.baseSalaryPkr || 120000);
      setOvertimeEligible(employeeToEdit.overtimeEligible ?? true);
      setBankIban(employeeToEdit.bankIban || 'PK36HABB0000001234567801');
      setPhoto(employeeToEdit.photo);
    } else {
      // Auto-generate fresh EMP code
      const randNum = Math.floor(100 + Math.random() * 900);
      setName('');
      setCode(`EMP-${randNum}`);
      setEmail('');
      setPhone('0300-');
      setCnic('35201-');
      setDepartment(departments[0] || 'Information Technology');
      const desigs = designationsByDept[departments[0]] || ['Software Engineer'];
      setDesignation(desigs[0]);
      setBranch(branches[0] || 'Lahore Head Office');
      setShift(shifts[0] || '09:00 - 17:00 (15m grace)');
      setStatus('ACTIVE');
      setBaseSalaryPkr(125000);
      setOvertimeEligible(true);
      setBankIban(`PK36MEZN000000${randNum}4567`);
      setPhoto('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');
    }
  }, [employeeToEdit, isOpen, departments, designationsByDept, branches, shifts]);

  // Update designations when department changes
  useEffect(() => {
    const desigs = designationsByDept[department] || [];
    if (desigs.length > 0 && !desigs.includes(designation)) {
      setDesignation(desigs[0]);
    }
  }, [department, designationsByDept]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Please enter employee name.');

    onSave({
      id: employeeToEdit ? employeeToEdit.id : `emp-${Date.now()}`,
      code: code || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
      phone,
      cnic,
      department,
      branch,
      designation: designation || 'Staff Associate',
      status,
      photo,
      shift,
      baseSalaryPkr: Number(baseSalaryPkr) || 100000,
      overtimeEligible,
      bankIban,
      faceEnrolled: employeeToEdit?.faceEnrolled ?? false,
      voiceEnrolled: employeeToEdit?.voiceEnrolled ?? false,
    });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.75)',
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
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '16px',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          background: 'linear-gradient(145deg, #111827 0%, #0d1117 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          padding: '28px',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus style={{ width: '22px', height: '22px', color: '#818cf8' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                {employeeToEdit ? 'Edit Employee Profile' : 'Add New Employee (Pakistan Operations)'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Configure CNIC, department, shift, Pakistani salary structure, and biometric credentials.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section 1: Basic Information */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              1. Personal & Contact Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Kashif"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Employee Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Pakistani CNIC (National ID)</label>
                <input
                  type="text"
                  placeholder="35201-1234567-1"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Corporate Email</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Mobile Phone</label>
                <input
                  type="text"
                  placeholder="0300-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Photo Avatar URL</label>
                <input
                  type="text"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Department & Designation */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              2. Organization, Branch & Shift
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Designation</label>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                >
                  {(designationsByDept[department] || ['Staff Associate']).map((des) => (
                    <option key={des} value={des}>{des}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Branch Office</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                >
                  {branches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Assigned Shift</label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                >
                  {shifts.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Employment Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ON_LEAVE">ON LEAVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Pakistani Salary & Financial Setup */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              3. Pakistani Salary Structure & Banking (PKR)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Monthly Base Package (PKR)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '10px', top: '9px', fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>Rs.</span>
                  <input
                    type="number"
                    min="25000"
                    step="1000"
                    value={baseSalaryPkr}
                    onChange={(e) => setBaseSalaryPkr(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px 12px 9px 38px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}
                  />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  Basic: Rs. {Math.round(baseSalaryPkr * 0.6).toLocaleString()} • House: Rs. {Math.round(baseSalaryPkr * 0.25).toLocaleString()} • Med: Rs. {Math.round(baseSalaryPkr * 0.15).toLocaleString()}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Pakistani Bank IBAN</label>
                <input
                  type="text"
                  placeholder="PK36MEZN0000001234567801"
                  value={bankIban}
                  onChange={(e) => setBankIban(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#fff' }}>
                  <input
                    type="checkbox"
                    checked={overtimeEligible}
                    onChange={(e) => setOvertimeEligible(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
                  />
                  <span>Eligible for 1.5x Overtime Pay</span>
                </label>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '24px' }}>Subject to biometric shift tracking</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              <Save style={{ width: '16px', height: '16px' }} />
              <span>{employeeToEdit ? 'Save Changes' : 'Register Employee'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
