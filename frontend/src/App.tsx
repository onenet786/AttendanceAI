import { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'employees' | 'devices' | 'voice' | 'audit'>('dashboard');
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

  // Digital ID Badge Modal State (Phase 3)
  const [badgeEmployee, setBadgeEmployee] = useState<Employee | null>(null);
  const [badgeMode, setBadgeMode] = useState<'ROTATING' | 'PERMANENT' | 'BARCODE'>('ROTATING');
  const [rotatingTimer, setRotatingTimer] = useState<number>(42); // Countdown seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingTimer((prev) => (prev <= 1 ? 45 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Terminal Hardware Simulator State (Phase 3)
  const [selectedTerminal, setSelectedTerminal] = useState<string>('TERM-LHR-01');
  const [scanType, setScanType] = useState<'ROTATING_QR' | 'PERM_QR' | 'BARCODE'>('ROTATING_QR');
  const [terminalScanFeedback, setTerminalScanFeedback] = useState<string | null>(null);

  // Biometrics & Face Recognition State (Phase 4)
  const [faceEmployeeId, setFaceEmployeeId] = useState<string>('1');
  const [isSpoofSimulated, setIsSpoofSimulated] = useState<boolean>(false);
  const [faceScanStatus, setFaceScanStatus] = useState<'IDLE' | 'SCANNING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [faceFeedback, setFaceFeedback] = useState<string | null>(null);
  const [enrollingEmployee, setEnrollingEmployee] = useState<Employee | null>(null);
  const [enrollmentAngle, setEnrollmentAngle] = useState<'FRONT' | 'LEFT' | 'RIGHT'>('FRONT');
  const [enrollmentProgress, setEnrollmentProgress] = useState<number>(0);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);

  // Voice Command & Audio Assistant State (Phase 5)
  const [voiceEmployeeId, setVoiceEmployeeId] = useState<string>('1');
  const [voiceRecording, setVoiceRecording] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [voiceResponse, setVoiceResponse] = useState<string | null>(null);
  const [voiceConfidence, setVoiceConfidence] = useState<number | null>(null);
  const [voiceIntent, setVoiceIntent] = useState<string | null>(null);
  const [isVoiceCalibrating, setIsVoiceCalibrating] = useState<boolean>(false);

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

  // Hardware Terminal Scanner Execution (Phase 3)
  const handleTerminalScan = () => {
    const emp = employees.find((e) => e.id === simEmployeeId) || employees[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const source = scanType === 'BARCODE' ? 'BARCODE' : 'QR';
    const scanLabel =
      scanType === 'ROTATING_QR'
        ? 'Dynamic Rotating QR (HMAC Verified)'
        : scanType === 'PERM_QR'
        ? 'Permanent Badge QR'
        : 'Code128 Barcode';

    const newEvent: AttendanceEvent = {
      id: `term-scan-${Date.now()}`,
      employeeName: emp.name,
      employeeCode: emp.code,
      eventType: 'CHECK_IN',
      source,
      time: `${timeStr} [${selectedTerminal}]`,
      branch: emp.branch,
      photo: emp.photo,
      confidence: 1.0,
    };

    setEvents([newEvent, ...events]);
    setTerminalScanFeedback(`Hardware Scan Success: ${emp.name} punched IN via ${scanLabel} on terminal ${selectedTerminal}.`);
    setTimeout(() => setTerminalScanFeedback(null), 5000);
  };

  // Live Biometric Face Punch (Phase 4)
  const handleFaceScanPunch = () => {
    setFaceScanStatus('SCANNING');
    setFaceFeedback('Analyzing facial landmarks, calculating 512-dim embedding & verifying liveness...');

    setTimeout(() => {
      if (isSpoofSimulated) {
        setFaceScanStatus('ERROR');
        setFaceFeedback('SPOOF DETECTED: Presentation attack rejected (Liveness 42.1% < 85.0%). Screen replay or 2D photo intercepted.');
        setTimeout(() => setFaceScanStatus('IDLE'), 4500);
        return;
      }

      const emp = employees.find((e) => e.id === faceEmployeeId) || employees[0];
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const newEvent: AttendanceEvent = {
        id: `face-${Date.now()}`,
        employeeName: emp.name,
        employeeCode: emp.code,
        eventType: 'CHECK_IN',
        source: 'FACE',
        time: `${timeStr} [Webcam Kiosk]`,
        branch: emp.branch,
        photo: emp.photo,
        confidence: 0.984,
      };

      setEvents([newEvent, ...events]);
      setFaceScanStatus('SUCCESS');
      setFaceFeedback(`VERIFIED: ${emp.name} (${emp.code}) identified with 98.4% confidence (Liveness 97.8% Live Human). CHECK_IN recorded.`);
      setTimeout(() => setFaceScanStatus('IDLE'), 4500);
    }, 1200);
  };

  const handleStartEnrollment = (emp: Employee) => {
    setEnrollingEmployee(emp);
    setEnrollmentProgress(25);
    setEnrollmentAngle('FRONT');
  };

  const handleCaptureAngle = () => {
    if (enrollmentAngle === 'FRONT') {
      setEnrollmentProgress(60);
      setEnrollmentAngle('LEFT');
    } else if (enrollmentAngle === 'LEFT') {
      setEnrollmentProgress(90);
      setEnrollmentAngle('RIGHT');
    } else {
      setEnrollmentProgress(100);
      setIsEnrolling(true);
      setTimeout(() => {
        setIsEnrolling(false);
        const name = enrollingEmployee?.name;
        setEnrollingEmployee(null);
        setFaceFeedback(`Enrollment Complete: 512-dim normalized vector saved for ${name} (96.8% quality score). Synced to local edge gateways.`);
        setTimeout(() => setFaceFeedback(null), 5000);
      }, 900);
    }
  };

  // Live Voice Command & Speech Attendance (Phase 5)
  const handleTriggerVoiceCommand = (presetPhrase?: string) => {
    const phrase = presetPhrase || 'Clock me in for today';
    setVoiceRecording(true);
    setVoiceTranscript('Listening & streaming acoustic audio to Whisper STT...');
    setVoiceResponse(null);

    setTimeout(() => {
      setVoiceRecording(false);
      setVoiceTranscript(phrase);

      const emp = employees.find((e) => e.id === voiceEmployeeId) || employees[0];
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const lower = phrase.toLowerCase();
      let intent = 'CHECK_IN';
      let spoken = `Hello ${emp.name}, I have verified your acoustic voiceprint (96.4% confidence) and checked you in at ${timeStr}. Have a great workday!`;

      if (lower.includes('out') || lower.includes('leave') || lower.includes('wrap')) {
        intent = 'CHECK_OUT';
        spoken = `Goodbye ${emp.name}, I have clocked you out at ${timeStr}. Your worked hours have been updated in your timesheet.`;
      } else if (lower.includes('lunch') || lower.includes('break')) {
        if (lower.includes('back') || lower.includes('end')) {
          intent = 'BREAK_END';
          spoken = `Welcome back ${emp.name}, your break period has been concluded at ${timeStr}.`;
        } else {
          intent = 'BREAK_START';
          spoken = `Enjoy your break ${emp.name}, break start time logged at ${timeStr}.`;
        }
      } else if (lower.includes('hours')) {
        intent = 'HOURS_QUERY';
        spoken = `Hello ${emp.name}, you have completed 37.5 working hours this week with 1.5 hours of approved overtime.`;
      } else if (lower.includes('status')) {
        intent = 'STATUS_QUERY';
        spoken = `Hello ${emp.name}, you are currently registered as PRESENT since 09:00 AM. Shift compliance is 100%.`;
      } else if (lower.includes('absent')) {
        intent = 'TEAM_QUERY';
        spoken = `Today in the Lahore Head Office branch, 14 staff members are scheduled: 13 are present, 2 are late, and 1 is on approved leave.`;
      }

      setVoiceIntent(intent);
      setVoiceConfidence(0.964);
      setVoiceResponse(spoken);

      if (intent === 'CHECK_IN' || intent === 'CHECK_OUT') {
        const newEvent: AttendanceEvent = {
          id: `voice-${Date.now()}`,
          employeeName: emp.name,
          employeeCode: emp.code,
          eventType: intent as any,
          source: 'VOICE',
          time: `${timeStr} [Voice AI Command]`,
          branch: emp.branch,
          photo: emp.photo,
          confidence: 0.964,
        };
        setEvents([newEvent, ...events]);
      }
    }, 1200);
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
            onClick={() => setActiveTab('voice')}
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
              background: activeTab === 'voice' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'voice' ? '#818cf8' : 'var(--text-secondary)',
              textAlign: 'left',
            }}
          >
            <Mic style={{ width: '18px', height: '18px' }} />
            <span>Voice Attendance & AI</span>
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
                        <div
                          style={{ display: 'flex', gap: '6px', cursor: 'pointer' }}
                          onClick={() => setBadgeEmployee(emp)}
                          title="Click to view Digital ID Card & Rotating QR"
                        >
                          <span style={{ padding: '4px 8px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '4px', color: '#818cf8', fontSize: '0.75rem', fontWeight: 600 }}>
                            QR Card
                          </span>
                          <span style={{ padding: '4px 8px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '4px', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 600 }}>
                            Barcode
                          </span>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEnrollment(emp);
                            }}
                            style={{ padding: '4px 8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '4px', color: '#34d399', fontSize: '0.75rem', fontWeight: 600 }}
                            title="Enroll or Update 512-dim Biometric Face Vector"
                          >
                            Face Enroll
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
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>Biometrics, IP Cameras & Edge Surveillance Hub</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                Secure on-premise edge gateways ingest RTSP video on local LAN, extracting 512-dimensional face vectors and streaming verified punches without cloud video upload.
              </p>
            </div>

            {/* Live Biometric Webcam Kiosk (Phase 4) */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ScanLine style={{ width: '24px', height: '24px', color: '#10b981' }} />
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                      Live Biometric Facial Recognition Terminal
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Simulates front-desk biometric kiosk or LAN camera stream with 512-dim cosine similarity vector matching and active anti-spoofing liveness guard.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-present" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                    LIVENESS ENGINE ACTIVE
                  </span>
                </div>
              </div>

              {faceFeedback && (
                <div
                  style={{
                    background: faceScanStatus === 'ERROR' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    border: `1px solid ${faceScanStatus === 'ERROR' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                    color: faceScanStatus === 'ERROR' ? '#fca5a5' : '#6ee7b7',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                  }}
                >
                  {faceFeedback}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'center' }}>
                {/* Simulated Camera Viewport with HUD Overlay */}
                <div
                  style={{
                    position: 'relative',
                    background: 'radial-gradient(circle at center, #111827 0%, #030712 100%)',
                    borderRadius: '14px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    height: '240px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  {/* Target Brackets */}
                  <div style={{ position: 'absolute', inset: '24px', border: '1px dashed rgba(52, 211, 153, 0.25)', borderRadius: '10px', pointerEvents: 'none' }} />

                  {/* Corner Reticles */}
                  <div style={{ position: 'absolute', top: '20px', left: '20px', width: '16px', height: '16px', borderTop: '3px solid #34d399', borderLeft: '3px solid #34d399' }} />
                  <div style={{ position: 'absolute', top: '20px', right: '20px', width: '16px', height: '16px', borderTop: '3px solid #34d399', borderRight: '3px solid #34d399' }} />
                  <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '16px', height: '16px', borderBottom: '3px solid #34d399', borderLeft: '3px solid #34d399' }} />
                  <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '16px', height: '16px', borderBottom: '3px solid #34d399', borderRight: '3px solid #34d399' }} />

                  {/* Simulated Face In Center */}
                  {(() => {
                    const activeEmp = employees.find((e) => e.id === faceEmployeeId) || employees[0];
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1 }}>
                        <div style={{ position: 'relative' }}>
                          <img
                            src={activeEmp.photo}
                            alt={activeEmp.name}
                            style={{
                              width: '90px',
                              height: '90px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: faceScanStatus === 'ERROR' ? '3px solid #ef4444' : '3px solid #10b981',
                              boxShadow: faceScanStatus === 'ERROR' ? '0 0 20px rgba(239, 68, 68, 0.6)' : '0 0 20px rgba(16, 185, 129, 0.5)',
                            }}
                          />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{activeEmp.name}</div>
                          <div style={{ fontSize: '0.7rem', color: '#34d399' }}>512-dim Normalized Vector Ready</div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Telemetry Badges */}
                  <div style={{ position: 'absolute', top: '10px', left: '12px', fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.6)', display: 'flex', gap: '10px' }}>
                    <span>FPS: 30</span>
                    <span>RES: 1080p</span>
                    <span>LATENCY: 14ms</span>
                  </div>

                  <div style={{ position: 'absolute', bottom: '10px', right: '12px', fontSize: '0.68rem', color: isSpoofSimulated ? '#ef4444' : '#34d399', fontWeight: 600 }}>
                    {isSpoofSimulated ? '⚠️ REPLAY ATTACK SIMULATED' : '✓ LIVE HUMAN (98.2%)'}
                  </div>
                </div>

                {/* Biometric Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Presented Employee Candidate
                    </label>
                    <select
                      value={faceEmployeeId}
                      onChange={(e) => setFaceEmployeeId(e.target.value)}
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
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>{e.name} ({e.code}) — {e.department}</option>
                      ))}
                    </select>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                    }}
                  >
                    <input
                      type="checkbox"
                      id="spoofCheckbox"
                      checked={isSpoofSimulated}
                      onChange={(e) => setIsSpoofSimulated(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#ef4444', cursor: 'pointer' }}
                    />
                    <label htmlFor="spoofCheckbox" style={{ fontSize: '0.8rem', color: '#f87171', cursor: 'pointer' }}>
                      Simulate 2D Screen Replay Attack (Test Anti-Spoofing Rejection)
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button
                      onClick={handleFaceScanPunch}
                      disabled={faceScanStatus === 'SCANNING'}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '11px 20px',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        cursor: faceScanStatus === 'SCANNING' ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                      }}
                    >
                      <ScanLine className="w-4 h-4" />
                      <span>{faceScanStatus === 'SCANNING' ? 'Analyzing Face...' : 'Trigger Live Biometric Punch'}</span>
                    </button>
                  </div>
                </div>
              </div>
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

              <div className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Warehouse USB Barcode Wedge</h3>
                  </div>
                  <span className="badge badge-present">ONLINE</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div><strong>Branch:</strong> Lahore Head Office</div>
                  <div><strong>Device Type:</strong> USB HID POS Barcode Scanner</div>
                  <div><strong>Token Auth:</strong> Verified via X-Device-Token</div>
                  <div><strong>Heartbeat:</strong> 8s ago</div>
                </div>
              </div>
            </div>

            {/* Hardware Scanner Ingress Simulator */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ScanLine style={{ width: '22px', height: '22px', color: 'var(--accent-primary)' }} />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Hardware Terminal Ingress Simulator</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Simulate a live physical scanner (Turnstile Kiosk or Barcode Reader) sending a punch event with device token authentication.
                    </p>
                  </div>
                </div>
              </div>

              {terminalScanFeedback && (
                <div style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500 }}>
                  {terminalScanFeedback}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Active Terminal</label>
                  <select
                    value={selectedTerminal}
                    onChange={(e) => setSelectedTerminal(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-elevated)', color: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '8px 12px', fontSize: '0.85rem' }}
                  >
                    <option value="TERM-LHR-01">Turnstile QR Kiosk 1 (LHR-01)</option>
                    <option value="TERM-ISB-01">Lobby Entry Terminal (ISB-01)</option>
                    <option value="BAR-WH-02">Warehouse Barcode Scanner</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Hardware Scan Mode</label>
                  <select
                    value={scanType}
                    onChange={(e) => setScanType(e.target.value as any)}
                    style={{ width: '100%', background: 'var(--bg-elevated)', color: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '8px 12px', fontSize: '0.85rem' }}
                  >
                    <option value="ROTATING_QR">Dynamic Rotating QR (Anti-Replay Enabled)</option>
                    <option value="PERM_QR">Permanent Employee Badge QR</option>
                    <option value="BARCODE">Code128 Barcode Scanner</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Simulated Employee Badge</label>
                  <select
                    value={simEmployeeId}
                    onChange={(e) => setSimEmployeeId(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-elevated)', color: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '8px 12px', fontSize: '0.85rem' }}
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleTerminalScan}
                style={{
                  alignSelf: 'flex-start',
                  background: 'var(--accent-gradient)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-md)',
                  marginTop: '4px',
                }}
              >
                <ScanLine className="w-4 h-4" />
                <span>Simulate Terminal Scan Punch</span>
              </button>
            </div>
          </div>
        )}

        {/* VOICE-BASED ATTENDANCE & AUDIO ASSISTANT TAB (PHASE 5) */}
        {activeTab === 'voice' && (
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', background: 'rgba(244, 63, 94, 0.15)', borderRadius: '10px', color: '#fb7185' }}>
                    <Mic style={{ width: '24px', height: '24px' }} />
                  </div>
                  <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>Voice Attendance & Speech AI Engine</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
                      Hands-free acoustic MFCC biometric verification with zero-latency Whisper STT and Natural Language Understanding (NLU).
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity style={{ width: '13px', height: '13px' }} />
                  <span>MFCC-128 Matcher: Active</span>
                </span>
                <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles style={{ width: '13px', height: '13px' }} />
                  <span>Whisper STT: Streaming</span>
                </span>
              </div>
            </div>

            {/* Main Interactive Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              {/* Left Column: Interactive Terminal & Mic Visualizer */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Interactive Voice Terminal</h3>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', padding: '4px 8px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                    Sample Rate: 16kHz Mono
                  </span>
                </div>

                {/* Candidate Employee Selector */}
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Active Speaking Personnel
                  </label>
                  <select
                    value={voiceEmployeeId}
                    onChange={(e) => setVoiceEmployeeId(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-elevated)',
                      color: '#fff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '0.9rem',
                    }}
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.code}) — {emp.designation} [{emp.branch}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pulsing Mic Visualizer */}
                <div
                  style={{
                    background: 'var(--bg-elevated)',
                    borderRadius: '16px',
                    padding: '32px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    border: voiceRecording ? '1px solid #f43f5e' : '1px solid var(--border-subtle)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Glowing pulsing microphone button */}
                  <button
                    onClick={() => handleTriggerVoiceCommand()}
                    disabled={voiceRecording}
                    style={{
                      width: '88px',
                      height: '88px',
                      borderRadius: '50%',
                      border: 'none',
                      cursor: voiceRecording ? 'default' : 'pointer',
                      background: voiceRecording
                        ? 'linear-gradient(135deg, #f43f5e, #e11d48)'
                        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      boxShadow: voiceRecording
                        ? '0 0 35px rgba(244, 63, 94, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.4)'
                        : '0 0 25px rgba(99, 102, 241, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      transition: 'all 0.3s ease',
                      transform: voiceRecording ? 'scale(1.08)' : 'scale(1)',
                    }}
                  >
                    <Mic style={{ width: '36px', height: '36px' }} />
                  </button>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: voiceRecording ? '#fb7185' : '#fff' }}>
                      {voiceRecording ? 'Listening & Extracting Acoustic Features...' : 'Click to Speak or Choose Command Below'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {voiceRecording ? 'Extracting 128-dim MFCC audio coefficients' : 'Auto-detects intent, checks in/out & queries status'}
                    </div>
                  </div>

                  {/* Equalizer Audio Frequency Spectrum Bars */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '36px', marginTop: '6px' }}>
                    {[16, 28, 12, 32, 24, 38, 20, 30, 36, 22, 34, 18, 26, 14].map((h, i) => (
                      <div
                        key={i}
                        style={{
                          width: '4px',
                          height: voiceRecording ? `${Math.max(8, (h * (i % 2 === 0 ? 1.2 : 0.8)))}px` : '6px',
                          background: voiceRecording ? '#fb7185' : 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '2px',
                          transition: 'height 0.2s ease',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Preset Voice Utterance Triggers */}
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                    Quick Simulated Voice Utterances (Click to Dispatch)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
                      { label: 'Clock me in for today', intent: 'CHECK_IN', color: '#10b981' },
                      { label: 'Clock me out, wrapping up shift', intent: 'CHECK_OUT', color: '#f59e0b' },
                      { label: 'Going on 30-min lunch break', intent: 'BREAK_START', color: '#38bdf8' },
                      { label: 'Back from lunch break', intent: 'BREAK_END', color: '#818cf8' },
                      { label: 'How many hours did I work this week?', intent: 'HOURS_QUERY', color: '#a855f7' },
                      { label: 'What is my attendance status today?', intent: 'STATUS_QUERY', color: '#ec4899' },
                      { label: 'Who is absent in the office right now?', intent: 'TEAM_QUERY', color: '#f43f5e' },
                    ].map((cmd, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTriggerVoiceCommand(cmd.label)}
                        disabled={voiceRecording}
                        style={{
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                          padding: '7px 12px',
                          color: 'var(--text-primary)',
                          fontSize: '0.78rem',
                          cursor: voiceRecording ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = cmd.color)}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cmd.color }} />
                        <span>"{cmd.label}"</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voiceprint Calibration Card */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Biometric Voiceprint Enrollment</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Calibrate 128-dim spectral MFCC template for speaker authentication.
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsVoiceCalibrating(true);
                        setTimeout(() => {
                          setIsVoiceCalibrating(false);
                          setVoiceResponse('Voiceprint successfully calibrated! 128-dim MFCC acoustic vector registered with 98.6% quality score.');
                        }, 1200);
                      }}
                      disabled={isVoiceCalibrating}
                      style={{
                        background: 'rgba(99, 102, 241, 0.2)',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                        color: '#a5b4fc',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: isVoiceCalibrating ? 'default' : 'pointer',
                      }}
                    >
                      {isVoiceCalibrating ? 'Calibrating...' : 'Enroll Voiceprint'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Real-Time Acoustic & NLU Stream */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Acoustic & NLP Analysis Card */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Acoustic & Intent Parsing Stream</h3>
                    <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                      Latency: ~42ms
                    </span>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                      Speech Transcript (Whisper STT Output)
                    </label>
                    <div
                      style={{
                        marginTop: '6px',
                        background: 'var(--bg-elevated)',
                        borderRadius: '8px',
                        padding: '14px',
                        fontSize: '0.9rem',
                        color: voiceTranscript ? '#fff' : 'var(--text-muted)',
                        fontStyle: voiceTranscript ? 'normal' : 'italic',
                        border: '1px solid var(--border-subtle)',
                        minHeight: '52px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {voiceTranscript || 'Waiting for spoken audio input or preset trigger...'}
                    </div>
                  </div>

                  {/* Telemetry Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Acoustic Similarity</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: voiceConfidence ? '#10b981' : 'var(--text-secondary)', marginTop: '4px' }}>
                        {voiceConfidence ? `${(voiceConfidence * 100).toFixed(1)}%` : '—'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Threshold: ≥ 80.0%</div>
                    </div>

                    <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Classified Intent</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#818cf8', marginTop: '6px' }}>
                        {voiceIntent || 'IDLE'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Zero-Latency NLP</div>
                    </div>

                    <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ingress Source</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fb7185', marginTop: '6px' }}>
                        VOICE_MIC
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Central Engine</div>
                    </div>
                  </div>

                  {/* Spoken AI Assistant Response */}
                  <div>
                    <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                      AI Spoken Response (TTS Synthesis)
                    </label>
                    <div
                      style={{
                        marginTop: '6px',
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '10px',
                        padding: '16px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{ padding: '6px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '8px', color: '#a5b4fc', flexShrink: 0 }}>
                        <Sparkles style={{ width: '18px', height: '18px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', color: '#e0e7ff', lineHeight: 1.5 }}>
                          {voiceResponse ||
                            'Awaiting voice input. The AI Voice Assistant will formulate a personalized natural spoken response and trigger the attendance timesheet engine automatically.'}
                        </div>
                        {voiceResponse && (
                          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#10b981' }}>
                            <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                            <span>Executed in Timesheet Calculation Engine</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Voice Architecture Specifications Card */}
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginBottom: '10px' }}>
                    Phase 5 Voice Engine Architecture
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                      <span>Acoustic Feature Extraction</span>
                      <span style={{ color: '#fff', fontWeight: 500 }}>128-dimensional MFCC vectors</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                      <span>Biometric Comparison Metric</span>
                      <span style={{ color: '#fff', fontWeight: 500 }}>Normalized Cosine Similarity (Threshold 0.80)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                      <span>Natural Language Grammar</span>
                      <span style={{ color: '#fff', fontWeight: 500 }}>Regex + Slot Filling (EN / UR)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Central Engine Integration</span>
                      <span style={{ color: '#10b981', fontWeight: 500 }}>AttendanceService.recordPunch(source='VOICE')</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Voice Events Stream */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Recent Voice-Initiated Attendance Punches</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Live Ingress Stream</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {events
                  .filter((e) => e.source === 'VOICE')
                  .slice(0, 5)
                  .map((ev) => (
                    <div
                      key={ev.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: 'var(--bg-elevated)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '6px', background: 'rgba(244, 63, 94, 0.15)', borderRadius: '8px', color: '#fb7185' }}>
                          <Mic style={{ width: '16px', height: '16px' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>{ev.employeeName} ({ev.employeeCode})</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{ev.branch} • {ev.time}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className={`badge ${ev.eventType === 'CHECK_IN' ? 'badge-success' : 'badge-warning'}`}>
                          {ev.eventType}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                          {(ev.confidence ? ev.confidence * 100 : 96.4).toFixed(1)}% Voice Match
                        </span>
                      </div>
                    </div>
                  ))}
                {events.filter((e) => e.source === 'VOICE').length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No voice attendance punches logged yet in this session. Click the microphone or choose a preset above to log one!
                  </div>
                )}
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

      {/* DIGITAL ID CARD & ROTATING QR BADGE MODAL (Phase 3) */}
      {badgeEmployee && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 7, 15, 0.82)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setBadgeEmployee(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(145deg, #16192b 0%, #0d0f1d 100%)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '460px',
              padding: '28px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(99, 102, 241, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              position: 'relative',
            }}
          >
            {/* Header / Security Chip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck style={{ width: '22px', height: '22px', color: 'var(--accent-primary)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: 'var(--accent-primary)', fontWeight: 700 }}>
                    ENTERPRISE PASS
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                    Digital Identity & Credential
                  </div>
                </div>
              </div>
              <button
                onClick={() => setBadgeEmployee(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Employee Profile Preview */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '14px',
              }}
            >
              <img
                src={badgeEmployee.photo}
                alt={badgeEmployee.name}
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--accent-primary)',
                  boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{badgeEmployee.name}</h4>
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderRadius: '4px', fontWeight: 600 }}>
                    {badgeEmployee.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {badgeEmployee.designation} • {badgeEmployee.department}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Code: <strong style={{ color: '#fff' }}>{badgeEmployee.code}</strong> | {badgeEmployee.branch}
                </div>
              </div>
            </div>

            {/* Credential Mode Selector */}
            <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: '10px', padding: '4px', gap: '4px' }}>
              {(['ROTATING', 'PERMANENT', 'BARCODE'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setBadgeMode(mode)}
                  style={{
                    flex: 1,
                    padding: '8px 6px',
                    borderRadius: '7px',
                    border: 'none',
                    background: badgeMode === mode ? 'var(--accent-gradient)' : 'transparent',
                    color: badgeMode === mode ? '#fff' : 'var(--text-secondary)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {mode === 'ROTATING' ? 'Rotating QR' : mode === 'PERMANENT' ? 'Static Badge' : 'Barcode 128'}
                </button>
              ))}
            </div>

            {/* Credential Visual Display Area */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              }}
            >
              {badgeMode === 'ROTATING' && (
                <>
                  <div
                    style={{
                      width: '180px',
                      height: '180px',
                      background: '#0f172a',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    <svg width="150" height="150" viewBox="0 0 100 100" fill="none">
                      <rect x="5" y="5" width="26" height="26" rx="4" fill="#6366f1" />
                      <rect x="9" y="9" width="18" height="18" rx="2" fill="#0f172a" />
                      <rect x="13" y="13" width="10" height="10" rx="1" fill="#818cf8" />

                      <rect x="69" y="5" width="26" height="26" rx="4" fill="#6366f1" />
                      <rect x="73" y="9" width="18" height="18" rx="2" fill="#0f172a" />
                      <rect x="77" y="13" width="10" height="10" rx="1" fill="#818cf8" />

                      <rect x="5" y="69" width="26" height="26" rx="4" fill="#6366f1" />
                      <rect x="9" y="73" width="18" height="18" rx="2" fill="#0f172a" />
                      <rect x="13" y="77" width="10" height="10" rx="1" fill="#818cf8" />

                      <rect x="37" y="8" width="6" height="6" fill="#c7d2fe" />
                      <rect x="47" y="8" width="6" height="6" fill="#c7d2fe" />
                      <rect x="57" y="8" width="6" height="6" fill="#c7d2fe" />
                      <rect x="37" y="18" width="6" height="6" fill="#c7d2fe" />
                      <rect x="57" y="18" width="6" height="6" fill="#c7d2fe" />
                      <rect x="37" y="28" width="6" height="6" fill="#c7d2fe" />
                      <rect x="47" y="28" width="6" height="6" fill="#c7d2fe" />

                      <rect x="8" y="37" width="6" height="6" fill="#c7d2fe" />
                      <rect x="18" y="37" width="6" height="6" fill="#c7d2fe" />
                      <rect x="28" y="37" width="6" height="6" fill="#c7d2fe" />
                      <rect x="8" y="47" width="6" height="6" fill="#c7d2fe" />
                      <rect x="18" y="57" width="6" height="6" fill="#c7d2fe" />

                      <rect x="42" y="42" width="16" height="16" rx="3" fill="#a855f7" />
                      <rect x="46" y="46" width="8" height="8" rx="1" fill="#ffffff" />

                      <rect x="68" y="37" width="6" height="6" fill="#c7d2fe" />
                      <rect x="78" y="37" width="6" height="6" fill="#c7d2fe" />
                      <rect x="88" y="37" width="6" height="6" fill="#c7d2fe" />
                      <rect x="68" y="47" width="6" height="6" fill="#c7d2fe" />
                      <rect x="88" y="57" width="6" height="6" fill="#c7d2fe" />

                      <rect x="37" y="68" width="6" height="6" fill="#c7d2fe" />
                      <rect x="47" y="68" width="6" height="6" fill="#c7d2fe" />
                      <rect x="57" y="68" width="6" height="6" fill="#c7d2fe" />
                      <rect x="37" y="78" width="6" height="6" fill="#c7d2fe" />
                      <rect x="57" y="88" width="6" height="6" fill="#c7d2fe" />
                      <rect x="68" y="78" width="6" height="6" fill="#c7d2fe" />
                      <rect x="78" y="88" width="6" height="6" fill="#c7d2fe" />
                    </svg>

                    <div
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        background: 'rgba(99, 102, 241, 0.9)',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        letterSpacing: '0.05em',
                      }}
                    >
                      HMAC-SHA256
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontSize: '0.85rem' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: '#10b981',
                        boxShadow: '0 0 8px #10b981',
                      }}
                    />
                    <span>
                      Token refreshes in <strong style={{ color: '#4f46e5' }}>{rotatingTimer}s</strong>
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center' }}>
                    Anti-Replay Nonce active. Screenshots expire automatically.
                  </div>
                </>
              )}

              {badgeMode === 'PERMANENT' && (
                <>
                  <div
                    style={{
                      width: '180px',
                      height: '180px',
                      background: '#0f172a',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="150" height="150" viewBox="0 0 100 100" fill="none">
                      <rect x="5" y="5" width="26" height="26" rx="4" fill="#0284c7" />
                      <rect x="9" y="9" width="18" height="18" rx="2" fill="#0f172a" />
                      <rect x="13" y="13" width="10" height="10" rx="1" fill="#38bdf8" />
                      <rect x="69" y="5" width="26" height="26" rx="4" fill="#0284c7" />
                      <rect x="73" y="9" width="18" height="18" rx="2" fill="#0f172a" />
                      <rect x="77" y="13" width="10" height="10" rx="1" fill="#38bdf8" />
                      <rect x="5" y="69" width="26" height="26" rx="4" fill="#0284c7" />
                      <rect x="9" y="73" width="18" height="18" rx="2" fill="#0f172a" />
                      <rect x="13" y="77" width="10" height="10" rx="1" fill="#38bdf8" />
                      <rect x="42" y="42" width="16" height="16" rx="2" fill="#38bdf8" />
                      <rect x="37" y="10" width="6" height="6" fill="#93c5fd" />
                      <rect x="57" y="10" width="6" height="6" fill="#93c5fd" />
                      <rect x="10" y="37" width="6" height="6" fill="#93c5fd" />
                      <rect x="10" y="57" width="6" height="6" fill="#93c5fd" />
                      <rect x="84" y="37" width="6" height="6" fill="#93c5fd" />
                      <rect x="84" y="57" width="6" height="6" fill="#93c5fd" />
                      <rect x="37" y="84" width="6" height="6" fill="#93c5fd" />
                      <rect x="57" y="84" width="6" height="6" fill="#93c5fd" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 600 }}>
                    Badge Token: <code style={{ color: '#0284c7' }}>qr_badge_{badgeEmployee.code.toLowerCase()}_092f</code>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center' }}>
                    Permanent static identifier for physical PVC badges & lanyards.
                  </div>
                </>
              )}

              {badgeMode === 'BARCODE' && (
                <>
                  <div
                    style={{
                      width: '260px',
                      padding: '16px 12px',
                      background: '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', height: '60px', alignItems: 'stretch', width: '100%', gap: '2px' }}>
                      {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2].map((w, idx) => (
                        <div
                          key={idx}
                          style={{
                            flex: w,
                            background: idx % 2 === 0 ? '#000000' : 'transparent',
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ fontSize: '0.9rem', letterSpacing: '0.3em', fontWeight: 700, color: '#000' }}>
                      *{badgeEmployee.code}*
                    </div>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center' }}>
                    Code 128 standard. Scannable with standard 1D laser & CCD handheld wedges.
                  </div>
                </>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setSimEmployeeId(badgeEmployee.id);
                  setScanType(badgeMode === 'ROTATING' ? 'ROTATING_QR' : badgeMode === 'PERMANENT' ? 'PERM_QR' : 'BARCODE');
                  setActiveTab('devices');
                  setBadgeEmployee(null);
                }}
                style={{
                  flex: 1,
                  background: 'var(--accent-gradient)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <ScanLine className="w-4 h-4" />
                <span>Test in Terminal Simulator</span>
              </button>
              <button
                onClick={() => setBadgeEmployee(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '12px 18px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FACE BIOMETRIC ENROLLMENT MODAL (Phase 4) */}
      {enrollingEmployee && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 7, 15, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setEnrollingEmployee(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(145deg, #131d27 0%, #0a0f18 100%)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '480px',
              padding: '28px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(16, 185, 129, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ScanLine style={{ width: '22px', height: '22px', color: '#10b981' }} />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                    Biometric Face Enrollment
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Captures multi-angle facial landmarks and compiles normalized 512-dim mathematical template.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEnrollingEmployee(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Employee Preview */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '12px 16px',
              }}
            >
              <img
                src={enrollingEmployee.photo}
                alt={enrollingEmployee.name}
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #10b981' }}
              />
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{enrollingEmployee.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {enrollingEmployee.code} • {enrollingEmployee.department} ({enrollingEmployee.branch})
                </div>
              </div>
            </div>

            {/* Multi-Angle Enrollment Stage */}
            <div
              style={{
                background: '#040711',
                borderRadius: '14px',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={enrollingEmployee.photo}
                  alt="Capture Target"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    filter: enrollmentAngle === 'LEFT' ? 'brightness(0.9) contrast(1.1)' : enrollmentAngle === 'RIGHT' ? 'brightness(1.1)' : 'none',
                    transform: enrollmentAngle === 'LEFT' ? 'rotate(-6deg)' : enrollmentAngle === 'RIGHT' ? 'rotate(6deg)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: '3px dashed #10b981',
                    animation: isEnrolling ? 'spin 1s linear infinite' : 'none',
                  }}
                />
              </div>

              {/* Progress & Quality */}
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Current Stage: <strong style={{ color: '#fff' }}>{enrollmentAngle === 'FRONT' ? '1/3 Frontal Face' : enrollmentAngle === 'LEFT' ? '2/3 Left 15° Angle' : '3/3 Right 15° Angle'}</strong>
                  </span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>{enrollmentProgress}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${enrollmentProgress}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #10b981, #34d399)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
                {enrollmentAngle === 'FRONT' && 'Look straight into the lens. Ensure even lighting.'}
                {enrollmentAngle === 'LEFT' && 'Turn your head slightly to the left (15 degrees).'}
                {enrollmentAngle === 'RIGHT' && 'Turn your head slightly to the right (15 degrees).'}
              </div>
            </div>

            {/* Quality Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Dimensions</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>512 Floats</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>L2 Norm</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>1.0000 Unit</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Template Quality</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>96.8% (High)</div>
              </div>
            </div>

            {/* Capture Button */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleCaptureAngle}
                disabled={isEnrolling}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: isEnrolling ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                }}
              >
                <ScanLine className="w-4 h-4" />
                <span>
                  {isEnrolling
                    ? 'Saving & Syncing to Edge Gateways...'
                    : enrollmentAngle === 'RIGHT'
                    ? 'Finalize & Compile Face Vector'
                    : `Capture ${enrollmentAngle === 'FRONT' ? 'Frontal Angle' : 'Left Angle'}`}
                </span>
              </button>
              <button
                onClick={() => setEnrollingEmployee(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '12px 18px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
