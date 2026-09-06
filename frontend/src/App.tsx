import { useState } from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  Camera,
  QrCode,
  Mic,
  ShieldCheck,
  Search,
  Sparkles,
  DollarSign,
  CheckSquare,
  Activity,
  Layers,
  MapPin,
  ScanLine,
  Download,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  X
} from 'lucide-react';

interface Employee {
  id: string;
  code: string;
  name: string;
  email: string;
  department: string;
  branch: string;
  designation: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED';
  photo: string;
  shift: string;
}

interface AttendanceEvent {
  id: string;
  employeeName: string;
  employeeCode: string;
  eventType: 'CHECK_IN' | 'CHECK_OUT';
  source: 'CAMERA' | 'FACE' | 'QR' | 'BARCODE' | 'VOICE' | 'MANUAL';
  time: string;
  branch: string;
  photo: string;
  confidence?: number;
}

interface TimesheetRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  branch: string;
  shift: string;
  firstIn: string;
  lastOut: string;
  workedHours: string;
  breakMinutes: number;
  lateMinutes: number;
  earlyExitMinutes: number;
  overtimeMinutes: number;
  status: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE' | 'ABSENT';
  intervals: Array<{ start: string; end: string; duration: string; source: string }>;
  breaks: Array<{ start: string; end: string; duration: string }>;
}

const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', code: 'EMP-001', name: 'Muhammad Ahmed', email: 'ahmed@democompany.com', department: 'Information Technology', branch: 'Lahore Head Office', designation: 'Senior Software Engineer', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', shift: '09:00 - 17:00' },
  { id: '2', code: 'EMP-002', name: 'Bilal Hassan', email: 'bilal@democompany.com', department: 'Information Technology', branch: 'Lahore Head Office', designation: 'Senior Software Engineer', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', shift: '09:00 - 17:00' },
  { id: '3', code: 'EMP-003', name: 'Ayesha Khan', email: 'ayesha@democompany.com', department: 'Human Resources', branch: 'Lahore Head Office', designation: 'HR Business Partner', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', shift: '09:00 - 17:00' },
  { id: '4', code: 'EMP-004', name: 'Zainab Fatima', email: 'zainab@democompany.com', department: 'Human Resources', branch: 'Lahore Head Office', designation: 'HR Business Partner', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', shift: '09:00 - 17:00' },
  { id: '5', code: 'EMP-005', name: 'Hamza Tariq', email: 'hamza@democompany.com', department: 'Accounts & Finance', branch: 'Lahore Head Office', designation: 'Senior Financial Analyst', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', shift: '09:00 - 17:00' },
  { id: '6', code: 'EMP-006', name: 'Usman Ali', email: 'usman@democompany.com', department: 'Accounts & Finance', branch: 'Lahore Head Office', designation: 'Senior Financial Analyst', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', shift: '09:00 - 17:00' },
  { id: '7', code: 'EMP-007', name: 'Sana Malik', email: 'sana@democompany.com', department: 'Sales & BD', branch: 'Islamabad Regional Branch', designation: 'Regional Sales Manager', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', shift: '09:00 - 17:00' },
  { id: '8', code: 'EMP-008', name: 'Omer Farooq', email: 'omer@democompany.com', department: 'Sales & BD', branch: 'Islamabad Regional Branch', designation: 'Regional Sales Manager', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', shift: '09:00 - 17:00' },
  { id: '9', code: 'EMP-009', name: 'Khadija Noor', email: 'khadija@democompany.com', department: 'Sales & BD', branch: 'Islamabad Regional Branch', designation: 'Regional Sales Manager', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', shift: '09:00 - 17:00' },
  { id: '10', code: 'EMP-010', name: 'Mustafa Raza', email: 'mustafa@democompany.com', department: 'Information Technology', branch: 'Lahore Head Office', designation: 'Senior Software Engineer', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', shift: '09:00 - 17:00' },
  { id: '11', code: 'EMP-011', name: 'Maryam Siddiqui', email: 'maryam@democompany.com', department: 'Information Technology', branch: 'Lahore Head Office', designation: 'Senior Software Engineer', status: 'ON_LEAVE', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', shift: '09:00 - 17:00' },
];

const INITIAL_EVENTS: AttendanceEvent[] = [
  { id: 'ev-1', employeeName: 'Muhammad Ahmed', employeeCode: 'EMP-001', eventType: 'CHECK_IN', source: 'CAMERA', time: '08:58 AM', branch: 'Lahore Head Office', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', confidence: 0.98 },
  { id: 'ev-2', employeeName: 'Bilal Hassan', employeeCode: 'EMP-002', eventType: 'CHECK_IN', source: 'QR', time: '09:03 AM', branch: 'Lahore Head Office', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: 'ev-3', employeeName: 'Ayesha Khan', employeeCode: 'EMP-003', eventType: 'CHECK_IN', source: 'FACE', time: '09:07 AM', branch: 'Lahore Head Office', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', confidence: 0.99 },
  { id: 'ev-4', employeeName: 'Hamza Tariq', employeeCode: 'EMP-005', eventType: 'CHECK_IN', source: 'BARCODE', time: '09:12 AM', branch: 'Lahore Head Office', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { id: 'ev-5', employeeName: 'Sana Malik', employeeCode: 'EMP-007', eventType: 'CHECK_IN', source: 'VOICE', time: '09:18 AM', branch: 'Islamabad Regional Branch', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
];

const INITIAL_TIMESHEETS: TimesheetRecord[] = [
  {
    id: 'ts-1',
    employeeId: '1',
    employeeCode: 'EMP-001',
    employeeName: 'Muhammad Ahmed',
    department: 'Information Technology',
    branch: 'Lahore Head Office',
    shift: '09:00 - 17:00 (15m grace)',
    firstIn: '08:58 AM',
    lastOut: '05:30 PM',
    workedHours: '7.5 hrs',
    breakMinutes: 60,
    lateMinutes: 0,
    earlyExitMinutes: 0,
    overtimeMinutes: 30,
    status: 'PRESENT',
    intervals: [
      { start: '08:58 AM', end: '01:00 PM', duration: '4.0 hrs', source: 'CCTV Gate 1' },
      { start: '02:00 PM', end: '05:30 PM', duration: '3.5 hrs', source: 'Face Terminal' },
    ],
    breaks: [{ start: '01:00 PM', end: '02:00 PM', duration: '1.0 hr (Lunch Break)' }],
  },
  {
    id: 'ts-2',
    employeeId: '2',
    employeeCode: 'EMP-002',
    employeeName: 'Bilal Hassan',
    department: 'Information Technology',
    branch: 'Lahore Head Office',
    shift: '09:00 - 17:00 (15m grace)',
    firstIn: '09:03 AM',
    lastOut: '05:05 PM',
    workedHours: '7.0 hrs',
    breakMinutes: 60,
    lateMinutes: 0,
    earlyExitMinutes: 0,
    overtimeMinutes: 0,
    status: 'PRESENT',
    intervals: [
      { start: '09:03 AM', end: '01:00 PM', duration: '3.9 hrs', source: 'Signed QR Kiosk' },
      { start: '02:00 PM', end: '05:05 PM', duration: '3.1 hrs', source: 'Signed QR Kiosk' },
    ],
    breaks: [{ start: '01:00 PM', end: '02:00 PM', duration: '1.0 hr' }],
  },
  {
    id: 'ts-3',
    employeeId: '5',
    employeeCode: 'EMP-005',
    employeeName: 'Hamza Tariq',
    department: 'Accounts & Finance',
    branch: 'Lahore Head Office',
    shift: '09:00 - 17:00 (15m grace)',
    firstIn: '09:22 AM',
    lastOut: '05:00 PM',
    workedHours: '6.6 hrs',
    breakMinutes: 60,
    lateMinutes: 22,
    earlyExitMinutes: 0,
    overtimeMinutes: 0,
    status: 'LATE',
    intervals: [
      { start: '09:22 AM', end: '01:00 PM', duration: '3.6 hrs', source: 'Barcode Reader' },
      { start: '02:00 PM', end: '05:00 PM', duration: '3.0 hrs', source: 'Barcode Reader' },
    ],
    breaks: [{ start: '01:00 PM', end: '02:00 PM', duration: '1.0 hr' }],
  },
  {
    id: 'ts-4',
    employeeId: '11',
    employeeCode: 'EMP-011',
    employeeName: 'Maryam Siddiqui',
    department: 'Information Technology',
    branch: 'Lahore Head Office',
    shift: '09:00 - 17:00 (15m grace)',
    firstIn: '--',
    lastOut: '--',
    workedHours: '0.0 hrs',
    breakMinutes: 0,
    lateMinutes: 0,
    earlyExitMinutes: 0,
    overtimeMinutes: 0,
    status: 'ON_LEAVE',
    intervals: [],
    breaks: [],
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'employees' | 'devices' | 'audit'>('dashboard');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [events, setEvents] = useState<AttendanceEvent[]>(INITIAL_EVENTS);
  const [employees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [timesheets] = useState<TimesheetRecord[]>(INITIAL_TIMESHEETS);
  const [expandedId, setExpandedId] = useState<string | null>('ts-1');

  // Punch Simulator State
  const [simEmployeeId, setSimEmployeeId] = useState<string>('1');
  const [simSource, setSimSource] = useState<AttendanceEvent['source']>('CAMERA');
  const [simAction, setSimAction] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN');
  const [punchFeedback, setPunchFeedback] = useState<string | null>(null);

  // Manual Correction Modal State
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [corrEmployeeId, setCorrEmployeeId] = useState<string>('1');
  const [corrAction, setCorrAction] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN');
  const [corrTime, setCorrTime] = useState<string>('09:00');
  const [corrReason, setCorrReason] = useState<string>('Biometric terminal offline in morning');

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesBranch = selectedBranch === 'ALL' || emp.branch.toLowerCase().includes(selectedBranch.toLowerCase());
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBranch && matchesSearch;
  });

  // Calculate live statistics
  const totalEmployees = selectedBranch === 'ALL' ? 22 : selectedBranch === 'LAHORE' ? 14 : 8;
  const presentCount = selectedBranch === 'ALL' ? 14 : selectedBranch === 'LAHORE' ? 9 : 5;
  const lateCount = selectedBranch === 'ALL' ? 3 : selectedBranch === 'LAHORE' ? 2 : 1;
  const leaveCount = selectedBranch === 'ALL' ? 1 : selectedBranch === 'LAHORE' ? 1 : 0;
  const absentCount = totalEmployees - (presentCount + leaveCount);

  // Trigger Punch through simulator
  const handleSimulatePunch = () => {
    const emp = employees.find((e) => e.id === simEmployeeId) || employees[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newEvent: AttendanceEvent = {
      id: `ev-${Date.now()}`,
      employeeName: emp.name,
      employeeCode: emp.code,
      eventType: simAction,
      source: simSource,
      time: timeStr,
      branch: emp.branch,
      photo: emp.photo,
      confidence: simSource === 'FACE' ? 0.98 : undefined,
    };

    setEvents([newEvent, ...events]);
    setPunchFeedback(`Success! ${emp.name} recorded ${simAction} via ${simSource} at ${timeStr}`);
    setTimeout(() => setPunchFeedback(null), 4000);
  };

  // Submit Supervisor Manual Correction
  const handleApplyCorrection = () => {
    const emp = employees.find((e) => e.id === corrEmployeeId) || employees[0];
    const correctedEvent: AttendanceEvent = {
      id: `corr-${Date.now()}`,
      employeeName: emp.name,
      employeeCode: emp.code,
      eventType: corrAction,
      source: 'MANUAL',
      time: `${corrTime} (Corrected)`,
      branch: emp.branch,
      photo: emp.photo,
    };

    setEvents([correctedEvent, ...events]);
    setIsCorrectionModalOpen(false);
    setPunchFeedback(`Correction Logged: ${emp.name} ${corrAction} adjusted to ${corrTime} with supervisor audit trail.`);
    setTimeout(() => setPunchFeedback(null), 5000);
  };

  // Download RFC 4180 CSV
  const handleExportCsv = () => {
    const headers = [
      'Date',
      'Employee Code',
      'Employee Name',
      'Department',
      'Branch',
      'Shift',
      'First IN',
      'Last OUT',
      'Worked Hours',
      'Break Minutes',
      'Late Minutes',
      'Overtime Minutes',
      'Status',
    ];

    const todayStr = new Date().toISOString().split('T')[0];
    const rows = timesheets.map((ts) => [
      todayStr,
      `"${ts.employeeCode}"`,
      `"${ts.employeeName}"`,
      `"${ts.department}"`,
      `"${ts.branch}"`,
      `"${ts.shift}"`,
      ts.firstIn,
      ts.lastOut,
      ts.workedHours,
      ts.breakMinutes,
      ts.lateMinutes,
      ts.overtimeMinutes,
      ts.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSourceIcon = (source: AttendanceEvent['source']) => {
    switch (source) {
      case 'CAMERA':
        return <Camera className="w-4 h-4 text-sky-400" />;
      case 'FACE':
        return <ScanLine className="w-4 h-4 text-emerald-400" />;
      case 'QR':
        return <QrCode className="w-4 h-4 text-indigo-400" />;
      case 'BARCODE':
        return <Layers className="w-4 h-4 text-amber-400" />;
      case 'VOICE':
        return <Mic className="w-4 h-4 text-rose-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* SIDEBAR NAVIGATION */}
      <aside
        style={{
          width: '260px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
        }}
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingLeft: '8px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--glow-accent)',
            }}
          >
            <Activity style={{ width: '22px', height: '22px', color: '#fff' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>AttendanceAI</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enterprise SaaS Platform</p>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: activeTab === 'dashboard' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'dashboard' ? '#818cf8' : 'var(--text-secondary)',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
          >
            <Activity style={{ width: '18px', height: '18px' }} />
            <span>Dashboard & Live Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: activeTab === 'attendance' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'attendance' ? '#818cf8' : 'var(--text-secondary)',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
          >
            <Clock style={{ width: '18px', height: '18px' }} />
            <span>Attendance Hub (Phase 2)</span>
          </button>

          <button
            onClick={() => setActiveTab('employees')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: activeTab === 'employees' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'employees' ? '#818cf8' : 'var(--text-secondary)',
              textAlign: 'left',
            }}
          >
            <Users style={{ width: '18px', height: '18px' }} />
            <span>Organization & Staff</span>
          </button>

          <button
            onClick={() => setActiveTab('devices')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: activeTab === 'devices' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'devices' ? '#818cf8' : 'var(--text-secondary)',
              textAlign: 'left',
            }}
          >
            <Camera style={{ width: '18px', height: '18px' }} />
            <span>CCTV & Edge Gateways</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: activeTab === 'audit' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'audit' ? '#818cf8' : 'var(--text-secondary)',
              textAlign: 'left',
            }}
          >
            <ShieldCheck style={{ width: '18px', height: '18px' }} />
            <span>Compliance & Audit Logs</span>
          </button>

          <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '16px 0' }} />

          {/* Feature highlights for subsequent phases */}
          <div style={{ padding: '0 8px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Modules Roadmap
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <DollarSign style={{ width: '16px', height: '16px' }} />
            <span>Payroll Engine (Phase 5)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <CheckSquare style={{ width: '16px', height: '16px' }} />
            <span>Task Management (Phase 6)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Sparkles style={{ width: '16px', height: '16px', color: '#a855f7' }} />
            <span style={{ color: '#c084fc' }}>Voice AI Assistant (Phase 7)</span>
          </div>
        </nav>

        {/* Tenant Profile Footer */}
        <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Demo Enterprise Corp</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tenant: demo-corp</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
            <span className="live-pulse" />
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 500 }}>Engine Online (Port 3041)</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* TOP APP HEADER */}
        <header
          style={{
            height: '70px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
          }}
        >
          {/* Branch Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <MapPin style={{ width: '18px', height: '18px', color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Operating Branch:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              style={{
                background: 'var(--bg-elevated)',
                color: '#fff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="ALL">All Branches (Global)</option>
              <option value="LAHORE">Lahore Head Office (LHR-01)</option>
              <option value="ISLAMABAD">Islamabad Regional Branch (ISB-01)</option>
            </select>
          </div>

          {/* User Account Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Super Admin</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>admin@democompany.com</div>
            </div>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              SA
            </div>
          </div>
        </header>

        {/* ===================================================================
            ATTENDANCE HUB TAB (PHASE 2)
            =================================================================== */}
        {activeTab === 'attendance' && (
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header & Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>Attendance Timesheet & Shift Engine</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Multi-interval punch calculation (Sum of OUT - IN intervals), break tracking, shift grace resolution, and supervisor corrections.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setIsCorrectionModalOpen(true)}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <PlusCircle className="w-4 h-4 text-indigo-400" />
                  <span>Manual Correction</span>
                </button>

                <button
                  onClick={handleExportCsv}
                  style={{
                    background: 'var(--accent-gradient)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Shift Rules Reference Card */}
            <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock className="w-5 h-5 text-indigo-400" />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>Standard Morning Shift Rules Active</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Shift Hours: 09:00 - 17:00 | Grace: 15 min | Late Threshold: 30 min | Early Exit Threshold: 15 min | Full Day: 8.0 hrs
                  </div>
                </div>
              </div>
              <span className="badge badge-present">Shift Engine Active</span>
            </div>

            {/* Daily Timesheet Table with Expandable Punch Timeline */}
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '14px 20px', width: '40px' }}></th>
                    <th style={{ padding: '14px 20px' }}>Employee</th>
                    <th style={{ padding: '14px 20px' }}>First IN</th>
                    <th style={{ padding: '14px 20px' }}>Last OUT</th>
                    <th style={{ padding: '14px 20px' }}>Total Worked</th>
                    <th style={{ padding: '14px 20px' }}>Break Time</th>
                    <th style={{ padding: '14px 20px' }}>Exceptions</th>
                    <th style={{ padding: '14px 20px' }}>Day Status</th>
                  </tr>
                </thead>
                <tbody>
                  {timesheets.map((ts) => {
                    const isExpanded = expandedId === ts.id;
                    return (
                      <tbody key={ts.id}>
                        <tr
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            background: isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                            cursor: 'pointer',
                          }}
                          onClick={() => setExpandedId(isExpanded ? null : ts.id)}
                        >
                          <td style={{ padding: '14px 10px 14px 20px' }}>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ fontWeight: 600, color: '#fff' }}>{ts.employeeName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ts.employeeCode} • {ts.department}</div>
                          </td>
                          <td style={{ padding: '14px 20px', color: '#fff', fontWeight: 500 }}>{ts.firstIn}</td>
                          <td style={{ padding: '14px 20px', color: '#fff', fontWeight: 500 }}>{ts.lastOut}</td>
                          <td style={{ padding: '14px 20px', color: '#34d399', fontWeight: 700 }}>{ts.workedHours}</td>
                          <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{ts.breakMinutes} min</td>
                          <td style={{ padding: '14px 20px' }}>
                            {ts.lateMinutes > 0 ? (
                              <span style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 600 }}>+{ts.lateMinutes}m Late</span>
                            ) : ts.overtimeMinutes > 0 ? (
                              <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 600 }}>+{ts.overtimeMinutes}m OT</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None</span>
                            )}
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <span
                              className={
                                ts.status === 'PRESENT'
                                  ? 'badge badge-present'
                                  : ts.status === 'LATE'
                                  ? 'badge badge-late'
                                  : ts.status === 'ON_LEAVE'
                                  ? 'badge badge-leave'
                                  : 'badge badge-absent'
                              }
                            >
                              {ts.status}
                            </span>
                          </td>
                        </tr>

                        {/* Expandable Multi-Interval Timeline */}
                        {isExpanded && (
                          <tr style={{ background: 'rgba(0, 0, 0, 0.25)', borderBottom: '1px solid var(--border-subtle)' }}>
                            <td colSpan={8} style={{ padding: '16px 24px 20px 54px' }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                                Punch Intervals & Break Log for {ts.employeeName}
                              </div>

                              {ts.intervals.length === 0 ? (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No punches recorded (Approved Leave / Absent).</div>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {ts.intervals.map((intv, idx) => (
                                    <div
                                      key={idx}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        background: 'var(--bg-elevated)',
                                        padding: '10px 14px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-subtle)',
                                        fontSize: '0.8rem',
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ padding: '2px 8px', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: '4px', fontWeight: 600 }}>
                                          Working Session {idx + 1}
                                        </span>
                                        <span style={{ color: '#fff', fontWeight: 500 }}>{intv.start} — {intv.end}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>({intv.duration})</span>
                                      </div>
                                      <span style={{ color: 'var(--text-secondary)' }}>Source: {intv.source}</span>
                                    </div>
                                  ))}

                                  {ts.breaks.map((brk, bIdx) => (
                                    <div
                                      key={bIdx}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        background: 'rgba(245, 158, 11, 0.05)',
                                        border: '1px dashed rgba(245, 158, 11, 0.2)',
                                        padding: '8px 14px',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        color: '#fbbf24',
                                      }}
                                    >
                                      <div>Break Time: {brk.start} — {brk.end}</div>
                                      <div>{brk.duration}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Title & Description */}
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>Workforce Real-Time Command Center</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                Single centralized Attendance Engine aggregating CCTV IP cameras, webcams, face recognition, QR, and barcode scanners.
              </p>
            </div>

            {/* METRICS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Employees</span>
                  <Users style={{ width: '20px', height: '20px', color: '#818cf8' }} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginTop: '8px' }}>{totalEmployees}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {selectedBranch === 'ALL' ? 'Across Lahore & Islamabad' : selectedBranch}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Present Today</span>
                  <CheckCircle2 style={{ width: '20px', height: '20px', color: '#34d399' }} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', marginTop: '8px' }}>{presentCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {Math.round((presentCount / totalEmployees) * 100)}% attendance rate
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Late Arrivals</span>
                  <AlertTriangle style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24', marginTop: '8px' }}>{lateCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Exceeded 15 min grace</div>
              </div>

              <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Absent</span>
                  <XCircle style={{ width: '20px', height: '20px', color: '#f87171' }} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f87171', marginTop: '8px' }}>{absentCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Unaccounted staff</div>
              </div>

              <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>On Leave</span>
                  <Calendar style={{ width: '20px', height: '20px', color: '#a78bfa' }} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a78bfa', marginTop: '8px' }}>{leaveCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Approved annual/sick</div>
              </div>
            </div>

            {/* INTERACTIVE PUNCH SIMULATOR & LIVE STREAM */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
              {/* Central Attendance Punch Simulator */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles style={{ width: '20px', height: '20px', color: 'var(--accent-primary)' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Unified Attendance Engine Tester</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Simulate live punches entering the unified engine from any registered hardware or client.
                </p>

                {punchFeedback && (
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#34d399',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                    }}
                  >
                    {punchFeedback}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Select Employee</label>
                    <select
                      value={simEmployeeId}
                      onChange={(e) => setSimEmployeeId(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'var(--bg-elevated)',
                        color: '#fff',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '0.85rem',
                      }}
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.code}) - {emp.department}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Source / Ingress</label>
                      <select
                        value={simSource}
                        onChange={(e) => setSimSource(e.target.value as any)}
                        style={{
                          width: '100%',
                          background: 'var(--bg-elevated)',
                          color: '#fff',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '0.85rem',
                        }}
                      >
                        <option value="CAMERA">IP CCTV Camera (RTSP)</option>
                        <option value="FACE">Face Recognition Vector</option>
                        <option value="QR">Signed QR Code</option>
                        <option value="BARCODE">Barcode Reader</option>
                        <option value="VOICE">Voice Command (STT)</option>
                        <option value="MANUAL">Manual Admin Punch</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Event Action</label>
                      <select
                        value={simAction}
                        onChange={(e) => setSimAction(e.target.value as any)}
                        style={{
                          width: '100%',
                          background: 'var(--bg-elevated)',
                          color: '#fff',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '0.85rem',
                        }}
                      >
                        <option value="CHECK_IN">CHECK IN (Entrance)</option>
                        <option value="CHECK_OUT">CHECK OUT (Exit)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleSimulatePunch}
                    style={{
                      marginTop: '8px',
                      background: 'var(--accent-gradient)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  >
                    <Activity className="w-4 h-4" />
                    <span>Submit Punch to Central Engine</span>
                  </button>
                </div>
              </div>

              {/* LIVE ATTENDANCE STREAM */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="live-pulse" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Live Attendance Stream</h3>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>WebSocket Real-time Feed</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto' }}>
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        background: 'var(--bg-elevated)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={ev.photo}
                          alt={ev.employeeName}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{ev.employeeName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {ev.employeeCode} • {ev.branch}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {getSourceIcon(ev.source)}
                          <span>{ev.source}</span>
                        </div>

                        <span className={ev.eventType === 'CHECK_IN' ? 'badge badge-present' : 'badge badge-late'}>
                          {ev.eventType}
                        </span>

                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: '70px', textAlign: 'right' }}>
                          {ev.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EMPLOYEES DIRECTORY TAB */}
        {activeTab === 'employees' && (
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>Organization Staff Directory</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Manage multi-branch workforce profiles, assigned shifts, biometric credentials, and security tokens.
                </p>
              </div>

              {/* Search input */}
              <div style={{ position: 'relative', width: '320px' }}>
                <Search style={{ position: 'absolute', left: '12px', top: '10px', width: '18px', height: '18px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by name, code or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '8px 12px 8px 38px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Employee Table */}
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '14px 20px' }}>Employee</th>
                    <th style={{ padding: '14px 20px' }}>Department</th>
                    <th style={{ padding: '14px 20px' }}>Branch</th>
                    <th style={{ padding: '14px 20px' }}>Shift Hours</th>
                    <th style={{ padding: '14px 20px' }}>Status</th>
                    <th style={{ padding: '14px 20px' }}>Credentials</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={emp.photo}
                            alt={emp.name}
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: '#fff' }}>{emp.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.code} • {emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{emp.department}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{emp.branch}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{emp.shift}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className={emp.status === 'ACTIVE' ? 'badge badge-present' : 'badge badge-leave'}>
                          {emp.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span title="Signed QR Token Available" style={{ padding: '4px 6px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '4px', color: '#818cf8', fontSize: '0.7rem' }}>
                            QR
                          </span>
                          <span title="Barcode Enrolled" style={{ padding: '4px 6px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '4px', color: '#fbbf24', fontSize: '0.7rem' }}>
                            BAR
                          </span>
                          <span title="Biometric Vector Ready" style={{ padding: '4px 6px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px', color: '#34d399', fontSize: '0.7rem' }}>
                            FACE
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DEVICES & CCTV TAB */}
        {activeTab === 'devices' && (
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>CCTV IP Cameras & Attendance Edge Gateways</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                Secure on-premise gateways connect to RTSP streams over LAN and stream verified attendance punches without raw video cloud streaming.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Camera style={{ width: '20px', height: '20px', color: '#38bdf8' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Gate 1 Entry Camera (LHR)</h3>
                  </div>
                  <span className="badge badge-present">ONLINE</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div><strong>Branch:</strong> Lahore Head Office</div>
                  <div><strong>Protocol:</strong> RTSP (Encrypted in Gateway)</div>
                  <div><strong>Gateway:</strong> Raspberry Pi 5 Gateway (LHR-GW-01)</div>
                  <div><strong>Offline Buffer:</strong> 0 queued punches</div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Camera style={{ width: '20px', height: '20px', color: '#38bdf8' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Lobby Turnstile Camera (ISB)</h3>
                  </div>
                  <span className="badge badge-present">ONLINE</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div><strong>Branch:</strong> Islamabad Regional Branch</div>
                  <div><strong>Protocol:</strong> RTSP (Encrypted in Gateway)</div>
                  <div><strong>Gateway:</strong> Intel NUC Edge Agent (ISB-GW-01)</div>
                  <div><strong>Offline Buffer:</strong> 0 queued punches</div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <QrCode style={{ width: '20px', height: '20px', color: '#818cf8' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Main Turnstile QR Kiosk</h3>
                  </div>
                  <span className="badge badge-present">ONLINE</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div><strong>Branch:</strong> Lahore Head Office</div>
                  <div><strong>Verification:</strong> Cryptographic signed rotating tokens</div>
                  <div><strong>Anti-Replay:</strong> Enabled (30s window)</div>
                  <div><strong>Heartbeat:</strong> 12s ago</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AUDIT LOGS TAB */}
        {activeTab === 'audit' && (
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>Immutable Compliance Audit Logs</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                Every administrative modification, attendance punch, and credential access is captured with sensitive data redacted.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { action: 'ATTENDANCE_CORRECTION', entity: 'AttendanceEvent (corr-89)', actor: 'Super Admin', time: '5 minutes ago', ip: '192.168.1.45' },
                  { action: 'EMPLOYEE_CREATE', entity: 'Employee (EMP-022)', actor: 'Super Admin', time: '10 minutes ago', ip: '192.168.1.45' },
                  { action: 'ATTENDANCE_PUNCH', entity: 'AttendanceEvent (ev-1)', actor: 'Gateway LHR-GW-01', time: '48 minutes ago', ip: '10.0.0.12' },
                  { action: 'BRANCH_CREATE', entity: 'Branch (ISB-01)', actor: 'Super Admin', time: '2 hours ago', ip: '192.168.1.45' },
                  { action: 'USER_LOGIN', entity: 'User (admin@democompany.com)', actor: 'Super Admin', time: '3 hours ago', ip: '192.168.1.45' },
                ].map((log, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'var(--bg-elevated)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{log.action}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{log.entity}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--text-secondary)' }}>by {log.actor} ({log.ip})</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{log.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* SUPERVISOR MANUAL CORRECTION MODAL */}
      {isCorrectionModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Manual Attendance Correction</h3>
              </div>
              <button
                onClick={() => setIsCorrectionModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Supervisor corrections are logged to the immutable compliance audit trail with your reason attached.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Employee</label>
                <select
                  value={corrEmployeeId}
                  onChange={(e) => setCorrEmployeeId(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-elevated)',
                    color: '#fff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                  }}
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.code})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Punch Action</label>
                  <select
                    value={corrAction}
                    onChange={(e) => setCorrAction(e.target.value as any)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-elevated)',
                      color: '#fff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value="CHECK_IN">CHECK IN</option>
                    <option value="CHECK_OUT">CHECK OUT</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Time</label>
                  <input
                    type="time"
                    value={corrTime}
                    onChange={(e) => setCorrTime(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-elevated)',
                      color: '#fff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '7px 12px',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Supervisor Reason (Mandatory)</label>
                <textarea
                  rows={3}
                  value={corrReason}
                  onChange={(e) => setCorrReason(e.target.value)}
                  placeholder="e.g. Turnstile gate power outage, manual punch verified by security"
                  style={{
                    width: '100%',
                    background: 'var(--bg-elevated)',
                    color: '#fff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => setIsCorrectionModalOpen(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyCorrection}
                  style={{
                    background: 'var(--accent-gradient)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '6px',
                    padding: '8px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Apply & Recalculate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
