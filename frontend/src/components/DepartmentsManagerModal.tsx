import React, { useState } from 'react';
import { X, Building2, Trash2, Tag } from 'lucide-react';


interface DepartmentsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: string[];
  designationsByDept: Record<string, string[]>;
  onAddDepartment: (deptName: string) => void;
  onAddDesignation: (deptName: string, designation: string) => void;
  onDeleteDepartment: (deptName: string) => void;
  onDeleteDesignation: (deptName: string, designation: string) => void;
}

export const DepartmentsManagerModal: React.FC<DepartmentsManagerModalProps> = ({
  isOpen,
  onClose,
  departments,
  designationsByDept,
  onAddDepartment,
  onAddDesignation,
  onDeleteDepartment,
  onDeleteDesignation,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>(departments[0] || 'Information Technology');
  const [newDeptName, setNewDeptName] = useState('');
  const [newDesigName, setNewDesigName] = useState('');

  if (!isOpen) return null;

  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    onAddDepartment(newDeptName.trim());
    setSelectedDept(newDeptName.trim());
    setNewDeptName('');
  };

  const handleCreateDesig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesigName.trim()) return;
    onAddDesignation(selectedDept, newDesigName.trim());
    setNewDesigName('');
  };

  const currentDesigs = designationsByDept[selectedDept] || [];

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
          maxWidth: '800px',
          maxHeight: '88vh',
          overflowY: 'auto',
          borderRadius: '16px',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          background: 'linear-gradient(145deg, #0d1117 0%, #161b22 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
          padding: '28px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 style={{ width: '22px', height: '22px', color: '#818cf8' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                Departments & Designations Management
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Configure corporate organizational units, reporting lines, and job titles across Pakistan branches.
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}>
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* 2-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px' }}>
          {/* Left: Department List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Departments ({departments.length})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {departments.map((dept) => (
                <div
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    background: selectedDept === dept ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-elevated)',
                    border: selectedDept === dept ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-subtle)',
                    color: selectedDept === dept ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>{dept}</span>
                  {departments.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDepartment(dept);
                        if (selectedDept === dept) {
                          setSelectedDept(departments.find((d) => d !== dept) || '');
                        }
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px 4px' }}
                    >
                      <Trash2 style={{ width: '13px', height: '13px' }} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Department Form */}
            <form onSubmit={handleCreateDept} style={{ marginTop: '10px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                + Add New Department
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="e.g. Procurement"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  style={{ flex: 1, padding: '7px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }}
                />
                <button
                  type="submit"
                  style={{ padding: '7px 12px', borderRadius: '6px', border: 'none', background: '#6366f1', color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Add
                </button>
              </div>
            </form>
          </div>

          {/* Right: Designations for Selected Department */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(0, 0, 0, 0.2)', padding: '18px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>
                Designations for "{selectedDept}"
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {currentDesigs.length} Active Titles
              </span>
            </div>

            {/* Designations Grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '120px', alignContent: 'flex-start' }}>
              {currentDesigs.map((desig) => (
                <div
                  key={desig}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.82rem',
                    color: '#fff',
                  }}
                >
                  <Tag style={{ width: '13px', height: '13px', color: '#38bdf8' }} />
                  <span>{desig}</span>
                  {currentDesigs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeleteDesignation(selectedDept, desig)}
                      style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px' }}
                    >
                      <X style={{ width: '13px', height: '13px' }} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Designation Form */}
            <form onSubmit={handleCreateDesig} style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                + Add Designation to {selectedDept}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="e.g. Lead Technical Architect"
                  value={newDesigName}
                  onChange={(e) => setNewDesigName(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                />
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #38bdf8, #0284c7)', color: '#fff', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Add Title
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '9px 22px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
