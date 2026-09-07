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
  X,
  Send,
  Bot,
  Terminal,
  Printer,
  Lock,
  Bell,
  BarChart3,
  Plus,
  Edit2,
  Trash2,
  Settings,
  Building2,
  RefreshCw,
} from 'lucide-react';
import {
  AddEditEmployeeModal,
  EmployeeModel,
} from './components/AddEditEmployeeModal';
import { EmployeeEnrollmentModal } from './components/EmployeeEnrollmentModal';
import {
  HardwareSettingsModal,
  HardwareDevice,
  INITIAL_HARDWARE_DEVICES,
} from './components/HardwareSettingsModal';
import { AudibleUrduTaskManager } from './components/AudibleUrduTaskManager';
import { ComprehensiveReportsHub } from './components/ComprehensiveReportsHub';
import { PakistaniPayslipModal } from './components/PakistaniPayslipModal';
import { DepartmentsManagerModal } from './components/DepartmentsManagerModal';
import { computePakistaniSalary, formatPKR } from './utils/pakistanTax';

type Employee = EmployeeModel;

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

interface AgentUiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolCalls?: Array<{
    name: string;
    arguments: any;
    result?: any;
    status: 'SUCCESS' | 'ERROR' | 'PERMISSION_DENIED';
    executionTimeMs: number;
  }>;
}

interface PayslipUiRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  branch: string;
  designation: string;
  basicSalary: number;
  houseAllowance: number;
  transportAllowance: number;
  medicalAllowance: number;
  overtimeHours: number;
  overtimePay: number;
  grossSalary: number;
  incomeTax: number;
  providentFund: number;
  attendancePenalty: number;
  totalDeductions: number;
  netSalary: number;
  status: 'DRAFT' | 'APPROVED' | 'PAID';
  bankAccount: string;
}

const INITIAL_PAYSLIPS: PayslipUiRecord[] = [
  {
    id: 'ps-001',
    employeeId: '1',
    employeeName: 'Muhammad Ahmed',
    employeeCode: 'EMP-001',
    department: 'Information Technology',
    branch: 'Lahore Head Office',
    designation: 'Senior Software Engineer',
    basicSalary: 6500,
    houseAllowance: 1300,
    transportAllowance: 400,
    medicalAllowance: 300,
    overtimeHours: 4.5,
    overtimePay: 182.81,
    grossSalary: 8682.81,
    incomeTax: 1216.13,
    providentFund: 325.0,
    attendancePenalty: 0,
    totalDeductions: 1541.13,
    netSalary: 7141.68,
    status: 'APPROVED',
    bankAccount: 'PK36SCBL0000001123456701',
  },
  {
    id: 'ps-002',
    employeeId: '2',
    employeeName: 'Bilal Hassan',
    employeeCode: 'EMP-002',
    department: 'Information Technology',
    branch: 'Lahore Head Office',
    designation: 'Senior Software Engineer',
    basicSalary: 6200,
    houseAllowance: 1240,
    transportAllowance: 400,
    medicalAllowance: 300,
    overtimeHours: 2.0,
    overtimePay: 77.5,
    grossSalary: 8217.5,
    incomeTax: 1111.44,
    providentFund: 310.0,
    attendancePenalty: 103.33,
    totalDeductions: 1524.77,
    netSalary: 6692.73,
    status: 'APPROVED',
    bankAccount: 'PK36HABB0000009988776602',
  },
  {
    id: 'ps-003',
    employeeId: '3',
    employeeName: 'Ayesha Khan',
    employeeCode: 'EMP-003',
    department: 'Human Resources',
    branch: 'Lahore Head Office',
    designation: 'HR Business Partner',
    basicSalary: 5200,
    houseAllowance: 1040,
    transportAllowance: 350,
    medicalAllowance: 250,
    overtimeHours: 0,
    overtimePay: 0,
    grossSalary: 6840.0,
    incomeTax: 801.5,
    providentFund: 260.0,
    attendancePenalty: 0,
    totalDeductions: 1061.5,
    netSalary: 5778.5,
    status: 'APPROVED',
    bankAccount: 'PK36MEZN0000004455667703',
  },
  {
    id: 'ps-007',
    employeeId: '7',
    employeeName: 'Sana Malik',
    employeeCode: 'EMP-007',
    department: 'Sales & BD',
    branch: 'Islamabad Regional Branch',
    designation: 'Regional Sales Manager',
    basicSalary: 7000,
    houseAllowance: 1400,
    transportAllowance: 500,
    medicalAllowance: 350,
    overtimeHours: 6.0,
    overtimePay: 262.5,
    grossSalary: 9512.5,
    incomeTax: 1402.81,
    providentFund: 350.0,
    attendancePenalty: 0,
    totalDeductions: 1752.81,
    netSalary: 7759.69,
    status: 'APPROVED',
    bankAccount: 'PK36UBL00000002233445507',
  },
];

interface KanbanTask {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeName: string;
  assigneePhoto: string;
  estimatedHours: number;
  actualHours: number;
  dueDate: string;
  attendanceVerified: boolean;
}

const INITIAL_TASKS: KanbanTask[] = [
  {
    id: 'tsk-1',
    title: 'Cross-Platform Mobile QR Ingress with Offline SQLite Cache',
    description: 'Build local queuing mechanism for mobile device when WAN disconnects',
    projectId: 'PRJ-MOB',
    projectName: 'Mobile Workforce PWA',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assigneeName: 'Muhammad Ahmed',
    assigneePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    estimatedHours: 16,
    actualHours: 12.5,
    dueDate: 'Sep 12, 2026',
    attendanceVerified: true,
  },
  {
    id: 'tsk-2',
    title: '512-Dim Normalized Facial Embedding Evaluation',
    description: 'Calibrate passive liveness detection and cosine distance threshold',
    projectId: 'PRJ-CCTV',
    projectName: 'AI Edge Computer Vision Gateways',
    status: 'IN_REVIEW',
    priority: 'URGENT',
    assigneeName: 'Bilal Hassan',
    assigneePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    estimatedHours: 12,
    actualHours: 11.0,
    dueDate: 'Sep 10, 2026',
    attendanceVerified: true,
  },
  {
    id: 'tsk-3',
    title: 'Acoustic Voiceprint Spectrogram Visualizer UI',
    description: 'Dynamic canvas waveform reacting to live microphone voice punch',
    projectId: 'PRJ-VOICE',
    projectName: 'Voice AI & Speech Ingress',
    status: 'TODO',
    priority: 'MEDIUM',
    assigneeName: 'Ayesha Khan',
    assigneePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    estimatedHours: 8,
    actualHours: 0,
    dueDate: 'Sep 18, 2026',
    attendanceVerified: false,
  },
  {
    id: 'tsk-4',
    title: 'Progressive Tax Slabs & Provident Fund Audit',
    description: 'Statutory 5-slab progressive rate validation against legal compliance rules',
    projectId: 'PRJ-FIN',
    projectName: 'Enterprise Payroll Engine',
    status: 'DONE',
    priority: 'HIGH',
    assigneeName: 'Hamza Tariq',
    assigneePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    estimatedHours: 10,
    actualHours: 9.5,
    dueDate: 'Sep 06, 2026',
    attendanceVerified: true,
  },
  {
    id: 'tsk-5',
    title: 'Nginx aaPanel WebSocket Proxy & Port 3041 Routing',
    description: 'Reverse proxy upgrade header configuration for real-time live events',
    projectId: 'PRJ-INFRA',
    projectName: 'Infrastructure & Coexistence',
    status: 'DONE',
    priority: 'URGENT',
    assigneeName: 'Muhammad Ahmed',
    assigneePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    estimatedHours: 6,
    actualHours: 5.5,
    dueDate: 'Sep 05, 2026',
    attendanceVerified: true,
  },
  {
    id: 'tsk-6',
    title: 'HMAC Webhook Event Signatures & Retry Dispatcher',
    description: 'SHA256 signature payload computation with delivery logs',
    projectId: 'PRJ-INFRA',
    projectName: 'Infrastructure & Coexistence',
    status: 'TODO',
    priority: 'LOW',
    assigneeName: 'Usman Ali',
    assigneePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    estimatedHours: 8,
    actualHours: 0,
    dueDate: 'Sep 22, 2026',
    attendanceVerified: false,
  },
];

interface UiNotification {
  id: string;
  type: 'ATTENDANCE_BREACH' | 'OVERTIME_THRESHOLD' | 'GATEWAY_OFFLINE' | 'PAYROLL_SEALED' | 'TASK_ASSIGNED';
  title: string;
  message: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  isRead: boolean;
  timeAgo: string;
}

const INITIAL_NOTIFICATIONS: UiNotification[] = [
  {
    id: 'n-1',
    type: 'ATTENDANCE_BREACH',
    title: 'Consecutive Absence Detected',
    message: 'Usman Tariq (EMP-014) has not recorded a punch for 2 consecutive business days in Operations.',
    severity: 'CRITICAL',
    isRead: false,
    timeAgo: '25m ago',
  },
  {
    id: 'n-2',
    type: 'OVERTIME_THRESHOLD',
    title: 'Weekly Overtime Exceeded (11.5h)',
    message: 'Bilal Hassan (EMP-002) logged 11.5 hours of overtime this week. Requires HR review.',
    severity: 'WARNING',
    isRead: false,
    timeAgo: '1h ago',
  },
  {
    id: 'n-3',
    type: 'PAYROLL_SEALED',
    title: 'September 2026 Payroll Period Finalized',
    message: 'Super Admin locked payroll ledger. Total net disbursement of $118,240.50 authorized.',
    severity: 'INFO',
    isRead: true,
    timeAgo: '5h ago',
  },
  {
    id: 'n-4',
    type: 'GATEWAY_OFFLINE',
    title: 'Edge Gateway Telemetry Verified',
    message: 'All 6 CCTV cameras and turnstiles in Lahore & Islamabad are reporting healthy RTSP streams.',
    severity: 'INFO',
    isRead: true,
    timeAgo: '10h ago',
  },
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', code: 'EMP-001', name: 'Muhammad Ahmed', email: 'ahmed@democompany.com', phone: '0300-4521890', cnic: '35201-8932415-1', department: 'Information Technology', branch: 'Lahore Head Office', designation: 'Senior Software Engineer', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', shift: '09:00 - 17:00 (15m grace)', baseSalaryPkr: 185000, overtimeEligible: true, bankIban: 'PK36SCBL0000001123456701', faceEnrolled: true, voiceEnrolled: true },
  { id: '2', code: 'EMP-002', name: 'Bilal Hassan', email: 'bilal@democompany.com', phone: '0321-9874512', cnic: '35202-6541289-3', department: 'Information Technology', branch: 'Lahore Head Office', designation: 'Senior Software Engineer', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', shift: '09:00 - 17:00 (15m grace)', baseSalaryPkr: 175000, overtimeEligible: true, bankIban: 'PK36HABB0000009988776602', faceEnrolled: true, voiceEnrolled: true },
  { id: '3', code: 'EMP-003', name: 'Ayesha Khan', email: 'ayesha@democompany.com', phone: '0333-5612345', cnic: '35201-4478129-2', department: 'Human Resources', branch: 'Lahore Head Office', designation: 'HR Business Partner', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', shift: '09:00 - 17:00 (15m grace)', baseSalaryPkr: 145000, overtimeEligible: false, bankIban: 'PK36MEZN0000004455667703', faceEnrolled: true, voiceEnrolled: true },
  { id: '4', code: 'EMP-004', name: 'Zainab Fatima', email: 'zainab@democompany.com', phone: '0345-8912345', cnic: '35201-1122334-4', department: 'Human Resources', branch: 'Lahore Head Office', designation: 'HR Business Partner', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', shift: '09:00 - 17:00 (15m grace)', baseSalaryPkr: 135000, overtimeEligible: false, bankIban: 'PK36BAHL0000003322114404', faceEnrolled: false, voiceEnrolled: false },
  { id: '5', code: 'EMP-005', name: 'Hamza Tariq', email: 'hamza@democompany.com', phone: '0302-3344556', cnic: '35202-9988776-5', department: 'Accounts & Finance', branch: 'Lahore Head Office', designation: 'Senior Financial Analyst', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', shift: '09:00 - 17:00 (15m grace)', baseSalaryPkr: 155000, overtimeEligible: true, bankIban: 'PK36MCB0000005544332205', faceEnrolled: true, voiceEnrolled: true },
  { id: '6', code: 'EMP-006', name: 'Usman Ali', email: 'usman@democompany.com', phone: '0315-7788990', cnic: '35202-7766554-1', department: 'Accounts & Finance', branch: 'Lahore Head Office', designation: 'Senior Financial Analyst', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', shift: '09:00 - 17:00 (15m grace)', baseSalaryPkr: 140000, overtimeEligible: true, bankIban: 'PK36UBL0000006677889906', faceEnrolled: true, voiceEnrolled: false },
  { id: '7', code: 'EMP-007', name: 'Sana Malik', email: 'sana@democompany.com', phone: '0308-1122445', cnic: '61101-3344556-8', department: 'Sales & BD', branch: 'Islamabad Regional Branch', designation: 'Regional Sales Manager', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', shift: '09:00 - 17:00 (15m grace)', baseSalaryPkr: 195000, overtimeEligible: true, bankIban: 'PK36UBL00000002233445507', faceEnrolled: true, voiceEnrolled: true },
  { id: '8', code: 'EMP-008', name: 'Omer Farooq', email: 'omer@democompany.com', phone: '0334-2233445', cnic: '61101-4455667-9', department: 'Sales & BD', branch: 'Islamabad Regional Branch', designation: 'Regional Sales Manager', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', shift: '09:00 - 17:00 (15m grace)', baseSalaryPkr: 165000, overtimeEligible: true, bankIban: 'PK36HABB0000008877665508', faceEnrolled: false, voiceEnrolled: true },
  { id: '9', code: 'EMP-009', name: 'Khadija Noor', email: 'khadija@democompany.com', phone: '0322-9988112', cnic: '61101-8899112-4', department: 'Sales & BD', branch: 'Islamabad Regional Branch', designation: 'Regional Sales Manager', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', shift: '09:00 - 17:00 (15m grace)', baseSalaryPkr: 150000, overtimeEligible: false, bankIban: 'PK36MEZN0000001199882209', faceEnrolled: true, voiceEnrolled: false },
  { id: '10', code: 'EMP-010', name: 'Mustafa Raza', email: 'mustafa@democompany.com', phone: '0300-8877665', cnic: '35201-5566778-3', department: 'Information Technology', branch: 'Lahore Head Office', designation: 'Senior Software Engineer', status: 'ACTIVE', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', shift: '09:00 - 17:00 (15m grace)', baseSalaryPkr: 160000, overtimeEligible: true, bankIban: 'PK36SCBL0000003344556610', faceEnrolled: true, voiceEnrolled: true },
  { id: '11', code: 'EMP-011', name: 'Maryam Siddiqui', email: 'maryam@democompany.com', phone: '0345-4433221', cnic: '35202-2233445-6', department: 'Information Technology', branch: 'Lahore Head Office', designation: 'Senior Software Engineer', status: 'ON_LEAVE', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', shift: '09:00 - 17:00 (15m grace)', baseSalaryPkr: 155000, overtimeEligible: true, bankIban: 'PK36MEZN0000009988112211', faceEnrolled: false, voiceEnrolled: false },
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'employees' | 'devices' | 'voice' | 'agent' | 'payroll' | 'tasks' | 'reports' | 'audit'>('dashboard');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [events, setEvents] = useState<AttendanceEvent[]>(INITIAL_EVENTS);
  const [employees, setEmployees] = useState<EmployeeModel[]>(INITIAL_EMPLOYEES);

  // Modals & Enhanced Pakistani Features State
  const [isAddEditEmployeeOpen, setIsAddEditEmployeeOpen] = useState<boolean>(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<EmployeeModel | null>(null);
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState<boolean>(false);
  const [selectedEnrollmentEmployee, setSelectedEnrollmentEmployee] = useState<EmployeeModel | null>(null);
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState<boolean>(false);
  const [hardwareDevices, setHardwareDevices] = useState<HardwareDevice[]>(INITIAL_HARDWARE_DEVICES);
  const [isDepartmentsModalOpen, setIsDepartmentsModalOpen] = useState<boolean>(false);
  const [isPakistaniPayslipOpen, setIsPakistaniPayslipOpen] = useState<boolean>(false);
  const [selectedPayslipEmployee, setSelectedPayslipEmployee] = useState<EmployeeModel | null>(null);

  // Departments & Designations Registry
  const [departments, setDepartments] = useState<string[]>([
    'Information Technology',
    'Human Resources',
    'Accounts & Finance',
    'Sales & BD',
    'Operations & Logistics',
    'Production & Quality',
  ]);
  const [designationsByDept, setDesignationsByDept] = useState<Record<string, string[]>>({
    'Information Technology': [
      'Senior Software Engineer',
      'Full Stack Architect',
      'AI/ML Systems Specialist',
      'DevOps & Cloud Lead',
      'QA Automation Engineer',
    ],
    'Human Resources': [
      'HR Business Partner',
      'Talent Acquisition Lead',
      'Payroll & Benefits Specialist',
    ],
    'Accounts & Finance': [
      'Senior Financial Analyst',
      'Chief Accountant',
      'Corporate Tax Consultant (FBR)',
    ],
    'Sales & BD': [
      'Regional Sales Manager',
      'Enterprise Account Executive',
      'Business Development Officer',
    ],
    'Operations & Logistics': [
      'Logistics Operations Manager',
      'Shift Turnstile Supervisor',
      'Fleet & Asset Controller',
    ],
    'Production & Quality': [
      'Production Line Lead',
      'Quality Assurance Inspector',
    ],
  });

  // Handlers for Employees
  const handleSaveEmployee = (empData: EmployeeModel) => {
    setEmployees((prev) => {
      const idx = prev.findIndex((e) => e.id === empData.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = empData;
        return updated;
      }
      return [empData, ...prev];
    });
  };

  const handleDeleteEmployee = (empId: string) => {
    if (confirm('Are you sure you want to deactivate and remove this employee profile?')) {
      setEmployees((prev) => prev.filter((e) => e.id !== empId));
    }
  };

  const handleEnrollmentComplete = (employeeId: string, updates: Partial<EmployeeModel>) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === employeeId ? { ...e, ...updates } : e))
    );
  };

  // Handlers for Departments
  const handleAddDepartment = (deptName: string) => {
    if (!departments.includes(deptName)) {
      setDepartments((prev) => [...prev, deptName]);
      setDesignationsByDept((prev) => ({
        ...prev,
        [deptName]: ['Associate'],
      }));
    }
  };

  const handleAddDesignation = (dept: string, desig: string) => {
    setDesignationsByDept((prev) => {
      const existing = prev[dept] || [];
      if (!existing.includes(desig)) {
        return { ...prev, [dept]: [...existing, desig] };
      }
      return prev;
    });
  };

  const handleDeleteDepartment = (deptName: string) => {
    setDepartments((prev) => prev.filter((d) => d !== deptName));
  };

  const handleDeleteDesignation = (dept: string, desig: string) => {
    setDesignationsByDept((prev) => ({
      ...prev,
      [dept]: (prev[dept] || []).filter((d) => d !== desig),
    }));
  };

  // Handlers for Hardware Devices
  const handleAddHardwareDevice = (dev: HardwareDevice) => {
    setHardwareDevices((prev) => [dev, ...prev]);
  };

  const handleDeleteHardwareDevice = (id: string) => {
    setHardwareDevices((prev) => prev.filter((d) => d.id !== id));
  };

  const handlePingHardwareDevice = (id: string) => {
    setHardwareDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, pingMs: Math.floor(8 + Math.random() * 15), lastHeartbeat: 'Just now' } : d))
    );
  };

  // Handlers for Audible Urdu Tasks
  const handleVoiceAddTask = (title: string, description: string = 'Created via Voice') => {
    const newTask: KanbanTask = {
      id: `tsk-${Date.now()}`,
      title,
      description,
      projectId: 'PRJ-MOB',
      projectName: 'Workforce Operations',
      status: 'TODO',
      priority: 'MEDIUM',
      assigneeName: employees[0]?.name || 'Muhammad Ahmed',
      assigneePhoto: employees[0]?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      estimatedHours: 8,
      actualHours: 0,
      dueDate: 'Sep 25, 2026',
      attendanceVerified: true,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleVoiceRecordPunch = (action: 'CHECK_IN' | 'CHECK_OUT') => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newEvent: AttendanceEvent = {
      id: `ev-${Date.now()}`,
      employeeName: employees[0]?.name || 'Muhammad Ahmed',
      employeeCode: employees[0]?.code || 'EMP-001',
      eventType: action,
      source: 'VOICE',
      time: timeStr,
      branch: employees[0]?.branch || 'Lahore Head Office',
      photo: employees[0]?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      confidence: 0.98,
    };
    setEvents((prev) => [newEvent, ...prev]);
  };
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

  // Voice Command & Audio Assistant State (Phase 5)
  const [voiceEmployeeId, setVoiceEmployeeId] = useState<string>('1');
  const [voiceRecording, setVoiceRecording] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [voiceResponse, setVoiceResponse] = useState<string | null>(null);
  const [voiceConfidence, setVoiceConfidence] = useState<number | null>(null);
  const [voiceIntent, setVoiceIntent] = useState<string | null>(null);
  const [isVoiceCalibrating, setIsVoiceCalibrating] = useState<boolean>(false);

  // AI Assistant & Copilot State (Phase 6)
  const [chatMessages, setChatMessages] = useState<AgentUiMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        '👋 Hello! I am your **AttendanceAI Assistant**. I have live access to your multi-tenant database, turnstiles, CCTV gateways, and calculation engines.\n\nAsk me about absent personnel, check timesheet hours, verify hardware health, or generate reports!',
      timestamp: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isAgentThinking, setIsAgentThinking] = useState<boolean>(false);

  // Payroll Management State (Phase 7)
  const [, setPayslips] = useState<PayslipUiRecord[]>(INITIAL_PAYSLIPS);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipUiRecord | null>(null);
  const [payrollPeriodStatus, setPayrollPeriodStatus] = useState<'DRAFT' | 'REVIEW' | 'LOCKED'>('REVIEW');
  const [isPayrollRunning, setIsPayrollRunning] = useState<boolean>(false);
  const [payrollNotification, setPayrollNotification] = useState<string | null>(null);

  // Tasks & Kanban State (Phase 8)
  const [tasks, setTasks] = useState<KanbanTask[]>(INITIAL_TASKS);
  const [selectedTaskProject, setSelectedTaskProject] = useState<string>('ALL');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDesc, setNewTaskDesc] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] = useState<KanbanTask['priority']>('MEDIUM');
  const [newTaskHours, setNewTaskHours] = useState<number>(8);
  const [newTaskProject, setNewTaskProject] = useState<string>('PRJ-MOB');
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>('Muhammad Ahmed');

  // Notifications State (Phase 10)
  const [notifications, setNotifications] = useState<UiNotification[]>(INITIAL_NOTIFICATIONS);
  const [isNotifTrayOpen, setIsNotifTrayOpen] = useState<boolean>(false);

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

  // AI Assistant & Autonomous Tool Dispatcher (Phase 6)
  const handleSendAgentMessage = (textToSend?: string) => {
    const msg = (textToSend || chatInput).trim();
    if (!msg) return;

    const userMsg: AgentUiMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsAgentThinking(true);

    setTimeout(() => {
      const lower = msg.toLowerCase();
      let toolName = 'get_attendance_summary';
      let toolResult: any = { scheduled: 22, present: 19, late: 2, onBreak: 3, absent: 2, onLeave: 1, attendanceRate: '86.4%' };
      let assistantText = '### 📊 Real-Time Attendance Overview\n\n- **Scheduled Staff**: 22\n- **Currently Present**: 19 (86.4% Attendance Rate)\n- **Late Arrivals**: 2\n- **Active Breaks**: 3\n- **Approved Leaves**: 1\n- **Absent**: 2\n\nAll turnstile readers and CCTV edge gateways are logging normal interval ingress.';

      if (lower.includes('absent') || lower.includes('late')) {
        toolName = 'get_absent_employees';
        toolResult = {
          count: 2,
          branch: lower.includes('lahore') ? 'Lahore Head Office' : 'All Branches',
          absentEmployees: [
            { code: 'EMP-014', name: 'Usman Tariq', department: 'Operations', branch: 'Lahore Head Office', shift: '09:00 - 18:00' },
            { code: 'EMP-019', name: 'Fatima Noor', department: 'Finance', branch: 'Islamabad Tech Hub', shift: '09:00 - 18:00' },
          ],
        };
        assistantText = `### 🚨 Absent & Unlogged Employees (2 Found)\n\nScheduled staff members who have not registered a check-in punch today:\n- **Usman Tariq** (\`EMP-014\`) — *Operations* [Lahore Head Office] | Shift: 09:00 - 18:00\n- **Fatima Noor** (\`EMP-019\`) — *Finance* [Islamabad Tech Hub] | Shift: 09:00 - 18:00\n\n> 💡 *Automated SMS and manager alerts have been queued for both employees.*`;
      } else if (lower.includes('hours') || lower.includes('timesheet')) {
        toolName = 'get_employee_timesheet';
        toolResult = {
          employee: 'Alex Morgan (EMP-001)',
          shift: 'Morning Shift (09:00 - 18:00)',
          checkIn: '08:58 AM',
          totalWorkedHours: 6.03,
          scheduledHours: 8.0,
          totalBreakMinutes: 45,
          complianceScore: '100%',
        };
        assistantText = `### ⏱️ Timesheet Calculation: Alex Morgan (EMP-001)\n\n- **Shift**: Morning Shift (09:00 - 18:00)\n- **First Ingress**: **08:58 AM**\n- **Total Worked**: **6.03 hours** (Scheduled: 8.0 hrs)\n- **Break Duration**: 45 mins\n- **Shift Compliance**: **100% (On-Time)**\n\n*Multi-interval calculation engine active: \\sum (OUT_i - IN_i)*`;
      } else if (lower.includes('device') || lower.includes('camera') || lower.includes('turnstile') || lower.includes('gateway')) {
        toolName = 'get_device_telemetry';
        toolResult = {
          totalDevices: 6,
          onlineCount: 6,
          offlineCount: 0,
          gateways: ['Lahore Gateway (ONLINE)', 'Islamabad Gateway (ONLINE)'],
          cameras: ['Turnstile A Face Cam (ONLINE, 28.5 FPS)', 'Turnstile B Face Cam (ONLINE, 29.1 FPS)'],
        };
        assistantText = `### 🛡️ Edge Gateway & CCTV Device Health\n\nAll **6 registered hardware devices** are operating normally with **0 offline devices**:\n- **Gateways**: Lahore Gateway (\`192.168.1.50\`), Islamabad Gateway (\`192.168.2.50\`)\n- **Biometric Cameras**: Turnstile Ingress Cam (28.5 FPS), Egress Cam (29.1 FPS)\n\nNetwork ping latency is under 15ms with full WebSocket heartbeat synchronization.`;
      } else if (lower.includes('report') || lower.includes('compliance')) {
        toolName = 'generate_attendance_report';
        toolResult = { period: 'this_week', punctualityScore: '94.5%', completedShifts: 104, totalScheduledShifts: 110 };
        assistantText = `### 📈 Executive Attendance & Compliance Report\n\n- **Reporting Period**: This Week (Global Multi-Branch)\n- **Punctuality Score**: **94.5%**\n- **Completed Shifts**: 104 / 110\n- **Average Daily Worked Hours**: 8.12 hrs\n- **Total Overtime Accumulated**: 14.5 hrs\n\n📥 [Download RFC 4180 Audit CSV Export](/api/v1/reports/export-csv)`;
      } else if (lower.includes('find') || lower.includes('search') || lower.includes('employee') || lower.includes('sara') || lower.includes('who is')) {
        toolName = 'search_employees';
        toolResult = [
          { name: 'Sara Khan', code: 'EMP-002', designation: 'Senior Product Manager', department: 'Product', branch: 'Islamabad Tech Hub' },
        ];
        assistantText = `### 👥 Employee Search Results\n\n- **Sara Khan** (\`EMP-002\`) — Senior Product Manager | *Product* [Islamabad Tech Hub]\n  - Status: ACTIVE\n  - Shift: 09:00 - 18:00\n  - Email: sara.khan@democompany.com`;
      }

      const assistantMsg: AgentUiMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: assistantText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCalls: [
          {
            name: toolName,
            arguments: { query: msg },
            result: toolResult,
            status: 'SUCCESS',
            executionTimeMs: 42,
          },
        ],
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
      setIsAgentThinking(false);
    }, 600);
  };

  // Payroll Action Handlers (Phase 7)
  const handleTriggerPayrollRun = () => {
    if (payrollPeriodStatus === 'LOCKED') {
      setPayrollNotification('Cannot re-calculate a LOCKED payroll period. Locked records are legally finalized.');
      setTimeout(() => setPayrollNotification(null), 5000);
      return;
    }

    setIsPayrollRunning(true);
    setPayrollNotification('Calculating multi-tenant attendance timesheets, overtime multipliers, and progressive tax slabs...');

    setTimeout(() => {
      setIsPayrollRunning(false);
      setPayslips([...INITIAL_PAYSLIPS]);
      setPayrollPeriodStatus('REVIEW');
      setPayrollNotification('Monthly Payroll Batch Executed: 22 employees processed across 3 branches. Total Net: $118,240.50.');
      setTimeout(() => setPayrollNotification(null), 6000);
    }, 1200);
  };

  const handleLockPayrollPeriod = () => {
    setPayrollPeriodStatus('LOCKED');
    setPayrollNotification('Payroll Period LOCKED & Finalized. Immutable ledger timestamped by Super Admin. Modifying past biometric punches will no longer affect these locked payslips.');
    setTimeout(() => setPayrollNotification(null), 6000);
  };

  // Task & Kanban Handlers (Phase 8)
  const handleAdvanceTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextStatus: Record<KanbanTask['status'], KanbanTask['status']> = {
          TODO: 'IN_PROGRESS',
          IN_PROGRESS: 'IN_REVIEW',
          IN_REVIEW: 'DONE',
          DONE: 'DONE',
        };
        return { ...t, status: nextStatus[t.status] };
      })
    );
  };

  const handleCreateNewTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: KanbanTask = {
      id: `tsk-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || 'Core milestone item',
      projectId: newTaskProject,
      projectName:
        newTaskProject === 'PRJ-MOB'
          ? 'Mobile Workforce PWA'
          : newTaskProject === 'PRJ-CCTV'
          ? 'AI Edge Computer Vision Gateways'
          : newTaskProject === 'PRJ-VOICE'
          ? 'Voice AI & Speech Ingress'
          : 'Enterprise Payroll Engine',
      status: 'TODO',
      priority: newTaskPriority,
      assigneeName: newTaskAssignee,
      assigneePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      estimatedHours: Number(newTaskHours) || 8,
      actualHours: 0,
      dueDate: 'Sep 25, 2026',
      attendanceVerified: true,
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setIsNewTaskModalOpen(false);
  };

  // Notification Handlers (Phase 10)
  const handleMarkNotifRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
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
            <span>Attendance & Timesheets</span>
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
            onClick={() => setActiveTab('agent')}
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
              background: activeTab === 'agent' ? 'rgba(168, 85, 247, 0.18)' : 'transparent',
              color: activeTab === 'agent' ? '#c084fc' : 'var(--text-secondary)',
              textAlign: 'left',
            }}
          >
            <Sparkles style={{ width: '18px', height: '18px', color: '#c084fc' }} />
            <span>AI Assistant & Agent</span>
          </button>

          <button
            onClick={() => setActiveTab('payroll')}
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
              background: activeTab === 'payroll' ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
              color: activeTab === 'payroll' ? '#34d399' : 'var(--text-secondary)',
              textAlign: 'left',
            }}
          >
            <DollarSign style={{ width: '18px', height: '18px', color: '#34d399' }} />
            <span>Payroll Management</span>
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

          <button
            onClick={() => setActiveTab('tasks')}
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
              background: activeTab === 'tasks' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: activeTab === 'tasks' ? '#38bdf8' : 'var(--text-secondary)',
              textAlign: 'left',
            }}
          >
            <CheckSquare style={{ width: '18px', height: '18px', color: '#38bdf8' }} />
            <span>Tasks & Projects (Kanban)</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
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
              background: activeTab === 'reports' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: activeTab === 'reports' ? '#fbbf24' : 'var(--text-secondary)',
              textAlign: 'left',
            }}
          >
            <BarChart3 style={{ width: '18px', height: '18px', color: '#fbbf24' }} />
            <span>Reports & Analytics</span>
          </button>
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

          {/* Notifications & User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
            {/* Notification Bell Button */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsNotifTrayOpen(!isNotifTrayOpen)}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: isNotifTrayOpen ? '#fff' : 'var(--text-secondary)',
                  position: 'relative',
                }}
              >
                <Bell style={{ width: '18px', height: '18px' }} />
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid var(--bg-secondary)',
                    }}
                  >
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                )}
              </button>

              {/* Notification Tray Dropdown */}
              {isNotifTrayOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50px',
                    right: 0,
                    width: '380px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                    zIndex: 1000,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255, 255, 255, 0.02)',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bell style={{ width: '16px', height: '16px', color: '#818cf8' }} />
                      <span>Security & System Alerts</span>
                    </div>
                    <button
                      onClick={handleMarkAllNotifsRead}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#818cf8',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Mark all read
                    </button>
                  </div>

                  <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkNotifRead(notif.id)}
                        style={{
                          padding: '12px 18px',
                          borderBottom: '1px solid var(--border-subtle)',
                          background: notif.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.06)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background:
                                notif.severity === 'CRITICAL'
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : notif.severity === 'WARNING'
                                  ? 'rgba(245, 158, 11, 0.15)'
                                  : 'rgba(56, 189, 248, 0.15)',
                              color:
                                notif.severity === 'CRITICAL'
                                  ? '#f87171'
                                  : notif.severity === 'WARNING'
                                  ? '#fbbf24'
                                  : '#38bdf8',
                            }}
                          >
                            {notif.severity}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{notif.timeAgo}</span>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff', marginTop: '2px' }}>
                          {notif.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {notif.message}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '10px', textAlign: 'center', background: 'rgba(0, 0, 0, 0.2)', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HMAC Webhook Gateway: Active</span>
                  </div>
                </div>
              )}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>Organization Staff Directory</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Complete employee lifecycle, Pakistani CNIC records, biometric face/voice enrollment, and department management.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {/* Search input */}
                <div style={{ position: 'relative', width: '260px' }}>
                  <Search style={{ position: 'absolute', left: '12px', top: '10px', width: '16px', height: '16px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search by name, code or CNIC..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '8px 12px 8px 36px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsDepartmentsModalOpen(true)}
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
                  <Building2 style={{ width: '15px', height: '15px', color: '#818cf8' }} />
                  <span>Departments & Titles</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmployeeToEdit(null);
                    setIsAddEditEmployeeOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  <span>+ Register New Employee</span>
                </button>
              </div>
            </div>

            {/* Employee Table */}
            <div className="glass-panel" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '14px 18px' }}>Staff Profile</th>
                    <th style={{ padding: '14px 18px' }}>Pakistani CNIC</th>
                    <th style={{ padding: '14px 18px' }}>Department & Designation</th>
                    <th style={{ padding: '14px 18px' }}>Branch & Shift</th>
                    <th style={{ padding: '14px 18px' }}>Monthly Base (PKR)</th>
                    <th style={{ padding: '14px 18px' }}>Biometrics</th>
                    <th style={{ padding: '14px 18px' }}>Status</th>
                    <th style={{ padding: '14px 18px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={emp.photo}
                            alt={emp.name}
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(99, 102, 241, 0.4)' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: '#fff' }}>{emp.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {emp.code} • {emp.phone || '0300-1234567'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {emp.cnic || '35201-1234567-1'}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ color: '#fff', fontWeight: 500 }}>{emp.department}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{emp.designation}</div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ color: 'var(--text-secondary)' }}>{emp.branch}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{emp.shift}</div>
                      </td>

                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#10b981' }}>
                        {formatPKR(emp.baseSalaryPkr || 120000)}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <span
                            className={emp.faceEnrolled ? 'badge badge-present' : 'badge badge-leave'}
                            style={{ fontSize: '0.68rem', padding: '2px 6px' }}
                            title={emp.faceEnrolled ? '512-dim Face Vector Enrolled' : 'Not Enrolled'}
                          >
                            Face {emp.faceEnrolled ? '✓' : '✗'}
                          </span>
                          <span
                            className={emp.voiceEnrolled ? 'badge badge-present' : 'badge badge-leave'}
                            style={{ fontSize: '0.68rem', padding: '2px 6px' }}
                            title={emp.voiceEnrolled ? '128-dim Acoustic Voiceprint Active' : 'Not Enrolled'}
                          >
                            Voice {emp.voiceEnrolled ? '✓' : '✗'}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span className={emp.status === 'ACTIVE' ? 'badge badge-present' : 'badge badge-leave'}>
                          {emp.status}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEnrollmentEmployee(emp);
                              setIsEnrollmentOpen(true);
                            }}
                            title="Enroll Webcam, RTSP IP Cam, Voiceprint, or QR Badge"
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
                              background: 'rgba(16, 185, 129, 0.1)',
                              color: '#34d399',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Camera style={{ width: '13px', height: '13px' }} />
                            <span>Enroll</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPayslipEmployee(emp);
                              setIsPakistaniPayslipOpen(true);
                            }}
                            title="View Pakistani FBR Salary Slip"
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid rgba(56, 189, 248, 0.4)',
                              background: 'rgba(56, 189, 248, 0.1)',
                              color: '#38bdf8',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <DollarSign style={{ width: '13px', height: '13px' }} />
                            <span>Payslip</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEmployeeToEdit(emp);
                              setIsAddEditEmployeeOpen(true);
                            }}
                            title="Edit Employee Profile"
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-subtle)',
                              background: 'var(--bg-elevated)',
                              color: '#fff',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                            }}
                          >
                            <Edit2 style={{ width: '13px', height: '13px' }} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteEmployee(emp.id)}
                            title="Deactivate Profile"
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: 'none',
                              background: 'rgba(239, 68, 68, 0.12)',
                              color: '#f87171',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 style={{ width: '13px', height: '13px' }} />
                          </button>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>Biometrics, IP Cameras & Edge Surveillance Hub</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Secure on-premise edge gateways ingest RTSP video on local LAN, extracting 512-dimensional face vectors and streaming verified punches without cloud video upload.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsHardwareModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(56, 189, 248, 0.35)',
                }}
              >
                <Settings style={{ width: '16px', height: '16px' }} />
                <span>Hardware Settings ({hardwareDevices.length} Devices)</span>
              </button>
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

        {/* AI ASSISTANT & AGENT COPILOT TAB (PHASE 6) */}
        {activeTab === 'agent' && (
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', background: 'rgba(168, 85, 247, 0.15)', borderRadius: '10px', color: '#c084fc' }}>
                    <Sparkles style={{ width: '24px', height: '24px' }} />
                  </div>
                  <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>Enterprise AI Assistant & Autonomous Copilot</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
                      Conversational multi-turn reasoning with autonomous tool calling across databases, timesheet engines, and edge hardware.
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles style={{ width: '13px', height: '13px' }} />
                  <span>Tool Dispatcher: Active</span>
                </span>
                <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck style={{ width: '13px', height: '13px' }} />
                  <span>RBAC Guardrails: Enforced</span>
                </span>
                <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Terminal style={{ width: '13px', height: '13px' }} />
                  <span>7 Business Tools Registered</span>
                </span>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                Suggested Business Prompts (Click to Execute)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  'Who is absent today in Lahore Head Office?',
                  'What is our overall attendance rate today?',
                  'Show timesheet calculation for Alex Morgan',
                  'Are all turnstiles and CCTV cameras online?',
                  'Generate attendance compliance report',
                  'Find employee Sara Khan in Product',
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendAgentMessage(prompt)}
                    disabled={isAgentThinking}
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      color: '#e2e8f0',
                      fontSize: '0.82rem',
                      cursor: isAgentThinking ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#c084fc')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                  >
                    <Sparkles style={{ width: '13px', height: '13px', color: '#c084fc' }} />
                    <span>"{prompt}"</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Interactive Chat & Tools Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '24px', alignItems: 'start' }}>
              {/* Chat Column */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '620px', overflow: 'hidden' }}>
                {/* Chat Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>Active Conversational Session</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tenant Isolated</span>
                  </div>
                  <button
                    onClick={() =>
                      setChatMessages([
                        {
                          id: 'welcome-reset',
                          role: 'assistant',
                          content:
                            'Conversation reset. How can I help you manage attendance, query timesheets, or inspect devices today?',
                          timestamp: 'Just now',
                        },
                      ])
                    }
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: 'var(--text-secondary)',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    Reset Chat
                  </button>
                </div>

                {/* Message Stream */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {msg.role === 'assistant' && (
                          <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                            <Bot style={{ width: '14px', height: '14px' }} />
                          </div>
                        )}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {msg.role === 'user' ? 'You (Super Admin)' : 'AttendanceAI Copilot'} • {msg.timestamp}
                        </span>
                      </div>

                      <div
                        style={{
                          maxWidth: '85%',
                          padding: '14px 18px',
                          borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                          background:
                            msg.role === 'user'
                              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3))'
                              : 'var(--bg-elevated)',
                          border: msg.role === 'user' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-subtle)',
                          color: '#fff',
                          fontSize: '0.9rem',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {msg.content}
                      </div>

                      {/* Tool Execution Trace Card */}
                      {msg.toolCalls && msg.toolCalls.length > 0 && (
                        <div
                          style={{
                            maxWidth: '85%',
                            marginTop: '4px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(168, 85, 247, 0.25)',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            fontSize: '0.78rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Terminal style={{ width: '14px', height: '14px', color: '#c084fc' }} />
                              <span style={{ fontWeight: 600, color: '#e2e8f0' }}>Tool Invocations ({msg.toolCalls.length})</span>
                            </div>
                            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                              ⚡ {msg.toolCalls[0].executionTimeMs}ms
                            </span>
                          </div>

                          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {msg.toolCalls.map((tool, tIdx) => (
                              <div
                                key={tIdx}
                                style={{
                                  background: 'rgba(255, 255, 255, 0.03)',
                                  borderRadius: '6px',
                                  padding: '8px 10px',
                                  border: '1px solid var(--border-subtle)',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontFamily: 'monospace', color: '#818cf8', fontWeight: 600 }}>
                                    {tool.name}()
                                  </span>
                                  <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                                    STATUS: {tool.status}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'monospace' }}>
                                  Payload: {JSON.stringify(tool.result, null, 1)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Thinking Indicator */}
                  {isAgentThinking && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#c084fc', fontSize: '0.85rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bot style={{ width: '14px', height: '14px' }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Analyzing intent & executing tools...</span>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c084fc', animation: 'pulse 1s infinite' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input Bar */}
                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendAgentMessage();
                    }}
                    placeholder="Ask anything about employees, attendance rate, timesheets, hardware health..."
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => handleSendAgentMessage()}
                    disabled={isAgentThinking || !chatInput.trim()}
                    style={{
                      background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0 20px',
                      cursor: isAgentThinking || !chatInput.trim() ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      opacity: isAgentThinking || !chatInput.trim() ? 0.6 : 1,
                      boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)',
                    }}
                  >
                    <Send style={{ width: '16px', height: '16px' }} />
                    <span>Send</span>
                  </button>
                </div>
              </div>

              {/* Right Telemetry & Tools Manifest */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Registered Business Tools Manifest */}
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Terminal style={{ width: '18px', height: '18px', color: '#c084fc' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>Tool Registry Manifest</h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { name: 'search_employees', desc: 'Directory search across branches & departments', access: 'All Roles' },
                      { name: 'get_attendance_summary', desc: 'Real-time KPIs: present, late, absent, breaks', access: 'All Roles' },
                      { name: 'get_employee_timesheet', desc: 'Calculates multi-interval worked hours & overtime', access: 'All Roles' },
                      { name: 'get_absent_employees', desc: 'Identifies scheduled personnel not yet logged', access: 'All Roles' },
                      { name: 'correct_attendance_record', desc: 'Supervisor manual punch override with audit reason', access: 'Supervisors & Admins' },
                      { name: 'get_device_telemetry', desc: 'Ingress liveness of turnstiles, cameras & gateways', access: 'All Roles' },
                      { name: 'generate_attendance_report', desc: 'Full compliance CSV analytics report dispatching', access: 'Admins Only' },
                    ].map((t, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-elevated)',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#c084fc', fontSize: '0.82rem' }}>
                            {t.name}()
                          </span>
                          <span style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                            {t.access}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {t.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Session Security Context */}
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <ShieldCheck style={{ width: '18px', height: '18px', color: '#10b981' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>Security & Audit Guardrails</h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                      <span>Active Tenant Scope</span>
                      <span style={{ color: '#fff', fontWeight: 500 }}>Demo Corporation (HQ)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                      <span>Authenticated Role</span>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>SUPER_ADMIN</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                      <span>Multi-Turn Memory</span>
                      <span style={{ color: '#fff', fontWeight: 500 }}>Stateful Session Map</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Audit Trail Sync</span>
                      <span style={{ color: '#818cf8', fontWeight: 500 }}>100% Ingress Captured</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAYROLL MANAGEMENT TAB (PHASE 7) */}
        {activeTab === 'payroll' && (
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '10px', color: '#34d399' }}>
                    <DollarSign style={{ width: '24px', height: '24px' }} />
                  </div>
                  <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>Automated Enterprise Payroll & Salary Engine</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
                      Attendance-reconciled compensation engine. Multi-interval worked hours, approved overtime (1.5x), progressive tax, and payslips.
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar style={{ width: '13px', height: '13px' }} />
                  <span>Period: September 2026</span>
                </span>
                <span className={`badge ${payrollPeriodStatus === 'LOCKED' ? 'badge-success' : 'badge-warning'}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {payrollPeriodStatus === 'LOCKED' ? <Lock style={{ width: '13px', height: '13px' }} /> : <Clock style={{ width: '13px', height: '13px' }} />}
                  <span>Status: {payrollPeriodStatus}</span>
                </span>
              </div>
            </div>

            {/* Notification Banner */}
            {payrollNotification && (
              <div
                style={{
                  background: payrollPeriodStatus === 'LOCKED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                  border: payrollPeriodStatus === 'LOCKED' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)',
                  color: payrollPeriodStatus === 'LOCKED' ? '#6ee7b7' : '#a5b4fc',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <CheckCircle2 style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                <span>{payrollNotification}</span>
              </div>
            )}

            {/* Top Metric Cards (PKR) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="glass-panel" style={{ padding: '18px' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  Total Gross Payroll (PKR)
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff', marginTop: '6px' }}>
                  Rs. 2,645,000
                </div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
                  Basic (60%) + House (25%) + Med (15%) + OT
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '18px' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  Net Take-Home Disbursed
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981', marginTop: '6px' }}>
                  Rs. 2,318,400
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Direct 1Link Pakistani Bank Wire
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '18px' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  FBR Withholding Tax (Sec 149)
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f87171', marginTop: '6px' }}>
                  Rs. 184,200
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Salaried Slabs 2024-2025
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '18px' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  Statutory EOBI & PF
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fbbf24', marginTop: '6px' }}>
                  Rs. 142,400
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  EOBI Rs. 370 + 5% Provident Fund
                </div>
              </div>
            </div>

            {/* Payroll Batch Controls Card */}
            <div
              className="glass-panel"
              style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                borderLeft: '4px solid #10b981',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>September 2026 Monthly Payroll Cycle</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Calculates all 22 employees with Pakistani FBR salary slabs, overtime multipliers, and automated deductions.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={handleTriggerPayrollRun}
                  disabled={isPayrollRunning || payrollPeriodStatus === 'LOCKED'}
                  style={{
                    background: payrollPeriodStatus === 'LOCKED' ? 'rgba(255, 255, 255, 0.05)' : 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: isPayrollRunning || payrollPeriodStatus === 'LOCKED' ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: payrollPeriodStatus === 'LOCKED' ? 0.5 : 1,
                    boxShadow: payrollPeriodStatus === 'LOCKED' ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.35)',
                  }}
                >
                  <RefreshCw style={{ width: '16px', height: '16px', animation: isPayrollRunning ? 'spin 1s linear infinite' : 'none' }} />
                  <span>{isPayrollRunning ? 'Calculating Batch...' : 'Recalculate Batch Run'}</span>
                </button>

                <button
                  onClick={handleLockPayrollPeriod}
                  disabled={payrollPeriodStatus === 'LOCKED'}
                  style={{
                    background: payrollPeriodStatus === 'LOCKED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    border: payrollPeriodStatus === 'LOCKED' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                    color: payrollPeriodStatus === 'LOCKED' ? '#6ee7b7' : '#fca5a5',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: payrollPeriodStatus === 'LOCKED' ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Lock style={{ width: '16px', height: '16px' }} />
                  <span>{payrollPeriodStatus === 'LOCKED' ? 'Period Finalized (LOCKED)' : 'Lock & Finalize Period'}</span>
                </button>
              </div>
            </div>

            {/* Payslips Table */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Pakistani FBR Salaried Payslips ({filteredEmployees.length})</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Statutory Deductions (EOBI, PF, Withholding Tax) in PKR
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '12px 14px' }}>Employee</th>
                      <th style={{ padding: '12px 14px' }}>Pakistani CNIC</th>
                      <th style={{ padding: '12px 14px' }}>Base Package</th>
                      <th style={{ padding: '12px 14px' }}>Basic (60%)</th>
                      <th style={{ padding: '12px 14px' }}>Allowances (40%)</th>
                      <th style={{ padding: '12px 14px' }}>FBR Tax (Mo.)</th>
                      <th style={{ padding: '12px 14px' }}>EOBI & PF</th>
                      <th style={{ padding: '12px 14px' }}>Net Salary</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp) => {
                      const breakdown = computePakistaniSalary(emp.baseSalaryPkr || 120000, 4.0, 0, 0);
                      return (
                        <tr
                          key={emp.id}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <td style={{ padding: '14px' }}>
                            <div style={{ fontWeight: 600, color: '#fff' }}>{emp.name}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{emp.code} • {emp.designation}</div>
                          </td>
                          <td style={{ padding: '14px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {emp.cnic || '35201-1234567-1'}
                          </td>
                          <td style={{ padding: '14px', color: '#fff', fontWeight: 600 }}>{formatPKR(emp.baseSalaryPkr || 120000)}</td>
                          <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>{formatPKR(breakdown.basicSalary)}</td>
                          <td style={{ padding: '14px', color: '#a5b4fc' }}>+{formatPKR(breakdown.houseRentAllowance + breakdown.medicalUtilityAllowance)}</td>
                          <td style={{ padding: '14px', color: '#f87171', fontWeight: 600 }}>
                            -{formatPKR(breakdown.monthlyFbrTax)}
                          </td>
                          <td style={{ padding: '14px', color: '#fbbf24' }}>
                            -Rs. {breakdown.eobiEmployeeShare + breakdown.providentFund}
                          </td>
                          <td style={{ padding: '14px', fontWeight: 800, color: '#10b981', fontSize: '0.95rem' }}>
                            {formatPKR(breakdown.netSalary)}
                          </td>
                          <td style={{ padding: '14px', textAlign: 'right' }}>
                            <button
                              onClick={() => {
                                setSelectedPayslipEmployee(emp);
                                setIsPakistaniPayslipOpen(true);
                              }}
                              style={{
                                background: 'rgba(16, 185, 129, 0.15)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                color: '#34d399',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              FBR Payslip
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DIGITAL PAYSLIP MODAL */}
        {selectedPayslip && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(5px)',
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
                maxWidth: '680px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DollarSign style={{ width: '22px', height: '22px', color: '#10b981' }} />
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>Official Salary Voucher & Payslip</h2>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
                    Demo Enterprise Corporation • Tax NTN: 9988210-4 • Pay Cycle: September 2026
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPayslip(null)}
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

              {/* Employee Information Card */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Employee Name:</span>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{selectedPayslip.employeeName}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Employee Code:</span>
                  <div style={{ fontWeight: 600, color: '#a5b4fc' }}>{selectedPayslip.employeeCode}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Designation:</span>
                  <div style={{ color: '#fff' }}>{selectedPayslip.designation}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Department & Branch:</span>
                  <div style={{ color: '#fff' }}>{selectedPayslip.department} [{selectedPayslip.branch}]</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Bank IBAN:</span>
                  <div style={{ color: '#fff', fontFamily: 'monospace' }}>{selectedPayslip.bankAccount}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Mode:</span>
                  <div style={{ color: '#10b981', fontWeight: 600 }}>Automated Direct Deposit</div>
                </div>
              </div>

              {/* Earnings vs Deductions Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Earnings Column */}
                <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600, color: '#10b981', marginBottom: '10px', fontSize: '0.88rem' }}>
                    Earnings & Additions
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Basic Salary</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>${selectedPayslip.basicSalary.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>House Rent (HRA)</span>
                      <span style={{ color: '#fff' }}>${selectedPayslip.houseAllowance.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Transport Allowance</span>
                      <span style={{ color: '#fff' }}>${selectedPayslip.transportAllowance.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Medical Allowance</span>
                      <span style={{ color: '#fff' }}>${selectedPayslip.medicalAllowance.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Overtime Pay ({selectedPayslip.overtimeHours}h @ 1.5x)</span>
                      <span style={{ color: '#38bdf8' }}>+${selectedPayslip.overtimePay.toFixed(2)}</span>
                    </div>
                    <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#fff' }}>
                      <span>Gross Salary</span>
                      <span>${selectedPayslip.grossSalary.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions Column */}
                <div style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600, color: '#f87171', marginBottom: '10px', fontSize: '0.88rem' }}>
                    Statutory Deductions
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Income Tax (Slab)</span>
                      <span style={{ color: '#f87171' }}>-${selectedPayslip.incomeTax.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Provident Fund (5%)</span>
                      <span style={{ color: '#f87171' }}>-${selectedPayslip.providentFund.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Lateness / Unpaid Penalty</span>
                      <span style={{ color: selectedPayslip.attendancePenalty > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
                        -${selectedPayslip.attendancePenalty.toFixed(2)}
                      </span>
                    </div>
                    <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#f87171' }}>
                      <span>Total Deductions</span>
                      <span>-${selectedPayslip.totalDeductions.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Payout Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.25))',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '12px',
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Net Take-Home Pay (Direct Wire)
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                    ${selectedPayslip.netSalary.toFixed(2)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-success">DISBURSEMENT AUTHORIZED</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Verified via Central Attendance Engine
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Printer style={{ width: '16px', height: '16px' }} />
                  <span>Print Payslip</span>
                </button>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  style={{
                    background: 'var(--accent-gradient)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TASK & PROJECT MANAGEMENT (PHASE 8 KANBAN)
            =================================================================== */}
        {activeTab === 'tasks' && (
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header & Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', background: 'rgba(56, 189, 248, 0.15)', borderRadius: '10px', color: '#38bdf8' }}>
                    <CheckSquare style={{ width: '24px', height: '24px' }} />
                  </div>
                  <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>Task & Project Management (Kanban)</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
                      Multi-tenant project sprints, task allocation, and biometric attendance-to-task time tracking verification.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={selectedTaskProject}
                  onChange={(e) => setSelectedTaskProject(e.target.value)}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="ALL">All Active Projects</option>
                  <option value="PRJ-MOB">Mobile Workforce PWA</option>
                  <option value="PRJ-CCTV">AI Edge Computer Vision Gateways</option>
                  <option value="PRJ-VOICE">Voice AI & Speech Ingress</option>
                  <option value="PRJ-FIN">Enterprise Payroll Engine</option>
                  <option value="PRJ-INFRA">Infrastructure & Coexistence</option>
                </select>

                <button
                  onClick={() => setIsNewTaskModalOpen(true)}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  <span>New Sprint Task</span>
                </button>
              </div>
            </div>

            {/* Audible Voice Task Manager (Urdu & English) */}
            <AudibleUrduTaskManager
              onAddTask={handleVoiceAddTask}
              onRecordPunch={handleVoiceRecordPunch}
              tasksCount={tasks.length}
              presentCount={presentCount}
              lateCount={lateCount}
            />

            {/* Attendance-to-Task Reconciliation Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(14, 165, 233, 0.15))',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 style={{ width: '22px', height: '22px', color: '#38bdf8' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>
                    Attendance Engine Cross-Verification Active
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Task logged hours automatically reconcile against physical biometric turnstile and camera check-in intervals.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="badge badge-success">Audit Synced</span>
                <span className="badge badge-info">Zero Phantom Hours</span>
              </div>
            </div>

            {/* Kanban Columns (4 Columns) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {(
                [
                  { key: 'TODO', title: 'To Do / Backlog', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' },
                  { key: 'IN_PROGRESS', title: 'In Progress', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)' },
                  { key: 'IN_REVIEW', title: 'In Review', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.1)' },
                  { key: 'DONE', title: 'Done / Verified', color: '#34d399', bg: 'rgba(16, 185, 129, 0.1)' },
                ] as const
              ).map((column) => {
                const columnTasks = tasks.filter(
                  (t) =>
                    t.status === column.key &&
                    (selectedTaskProject === 'ALL' || t.projectId === selectedTaskProject)
                );

                return (
                  <div
                    key={column.key}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      minHeight: '480px',
                    }}
                  >
                    {/* Column Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: column.color }} />
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{column.title}</span>
                      </div>
                      <span
                        style={{
                          background: column.bg,
                          color: column.color,
                          borderRadius: '12px',
                          padding: '2px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        {columnTasks.length}
                      </span>
                    </div>

                    {/* Task Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                      {columnTasks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          No tasks in this lane
                        </div>
                      ) : (
                        columnTasks.map((task) => (
                          <div
                            key={task.id}
                            style={{
                              background: 'var(--bg-elevated)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: '10px',
                              padding: '14px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background:
                                    task.priority === 'URGENT'
                                      ? 'rgba(239, 68, 68, 0.2)'
                                      : task.priority === 'HIGH'
                                      ? 'rgba(245, 158, 11, 0.2)'
                                      : 'rgba(56, 189, 248, 0.2)',
                                  color:
                                    task.priority === 'URGENT'
                                      ? '#f87171'
                                      : task.priority === 'HIGH'
                                      ? '#fbbf24'
                                      : '#38bdf8',
                                }}
                              >
                                {task.priority}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{task.projectName}</span>
                            </div>

                            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem', lineHeight: 1.4 }}>
                              {task.title}
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.4 }}>
                              {task.description}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img
                                  src={task.assigneePhoto}
                                  alt={task.assigneeName}
                                  style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  {task.assigneeName.split(' ')[0]}
                                </span>
                              </div>

                              <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
                                {task.actualHours} / {task.estimatedHours}h
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  color: task.attendanceVerified ? '#34d399' : '#fbbf24',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <CheckCircle2 style={{ width: '12px', height: '12px' }} />
                                {task.attendanceVerified ? 'Verified' : 'Unverified'}
                              </span>

                              {column.key !== 'DONE' && (
                                <button
                                  onClick={() => handleAdvanceTaskStatus(task.id)}
                                  style={{
                                    background: 'rgba(56, 189, 248, 0.15)',
                                    border: '1px solid rgba(56, 189, 248, 0.3)',
                                    color: '#38bdf8',
                                    borderRadius: '6px',
                                    padding: '4px 10px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  {column.key === 'IN_REVIEW' ? 'Approve & Done ✓' : 'Advance →'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================================================
            EXECUTIVE REPORTS & ANALYTICS HUB (PHASE 9 - MULTI-MODULE)
            =================================================================== */}
        {activeTab === 'reports' && (
          <div style={{ padding: '32px' }}>
            <ComprehensiveReportsHub
              employees={employees}
              hardwareDevices={hardwareDevices}
              selectedBranch={selectedBranch}
            />
          </div>
        )}

        {/* CREATE TASK MODAL */}
        {isNewTaskModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(5px)',
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
                maxWidth: '520px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Create New Project Sprint Task</h3>
                <button
                  onClick={() => setIsNewTaskModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Calibrate RTSP facial embedding threshold"
                    style={{
                      width: '100%',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Description
                  </label>
                  <textarea
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    placeholder="Provide acceptance criteria..."
                    rows={3}
                    style={{
                      width: '100%',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Project
                    </label>
                    <select
                      value={newTaskProject}
                      onChange={(e) => setNewTaskProject(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '10px',
                        color: '#fff',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    >
                      <option value="PRJ-MOB">Mobile Workforce PWA</option>
                      <option value="PRJ-CCTV">AI Edge CV Gateways</option>
                      <option value="PRJ-VOICE">Voice AI & Speech Ingress</option>
                      <option value="PRJ-FIN">Enterprise Payroll Engine</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Priority
                    </label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as any)}
                      style={{
                        width: '100%',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '10px',
                        color: '#fff',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      value={newTaskHours}
                      onChange={(e) => setNewTaskHours(Number(e.target.value))}
                      style={{
                        width: '100%',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '10px',
                        color: '#fff',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Assignee
                    </label>
                    <select
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '10px',
                        color: '#fff',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    >
                      <option value="Muhammad Ahmed">Muhammad Ahmed (IT)</option>
                      <option value="Bilal Hassan">Bilal Hassan (IT)</option>
                      <option value="Ayesha Khan">Ayesha Khan (HR)</option>
                      <option value="Hamza Tariq">Hamza Tariq (Finance)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  onClick={() => setIsNewTaskModalOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-secondary)',
                    padding: '10px 18px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNewTask}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    padding: '10px 20px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Create Task
                </button>
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

      {/* Enhanced Modals */}
      <AddEditEmployeeModal
        isOpen={isAddEditEmployeeOpen}
        onClose={() => {
          setIsAddEditEmployeeOpen(false);
          setEmployeeToEdit(null);
        }}
        onSave={handleSaveEmployee}
        employeeToEdit={employeeToEdit}
        departments={departments}
        designationsByDept={designationsByDept}
        branches={['Lahore Head Office', 'Islamabad Regional Branch', 'Karachi Hub']}
        shifts={['09:00 - 17:00 (15m grace)', '08:00 - 16:00 (Standard)', '14:00 - 22:00 (Evening)']}
      />

      <EmployeeEnrollmentModal
        isOpen={isEnrollmentOpen}
        onClose={() => {
          setIsEnrollmentOpen(false);
          setSelectedEnrollmentEmployee(null);
        }}
        employee={selectedEnrollmentEmployee}
        onEnrollmentComplete={handleEnrollmentComplete}
      />

      <HardwareSettingsModal
        isOpen={isHardwareModalOpen}
        onClose={() => setIsHardwareModalOpen(false)}
        devices={hardwareDevices}
        onAddDevice={handleAddHardwareDevice}
        onDeleteDevice={handleDeleteHardwareDevice}
        onPingDevice={handlePingHardwareDevice}
      />

      <DepartmentsManagerModal
        isOpen={isDepartmentsModalOpen}
        onClose={() => setIsDepartmentsModalOpen(false)}
        departments={departments}
        designationsByDept={designationsByDept}
        onAddDepartment={handleAddDepartment}
        onAddDesignation={handleAddDesignation}
        onDeleteDepartment={handleDeleteDepartment}
        onDeleteDesignation={handleDeleteDesignation}
      />

      <PakistaniPayslipModal
        isOpen={isPakistaniPayslipOpen}
        onClose={() => {
          setIsPakistaniPayslipOpen(false);
          setSelectedPayslipEmployee(null);
        }}
        employee={selectedPayslipEmployee}
        periodName="September 2026"
      />
    </div>
  );
}

