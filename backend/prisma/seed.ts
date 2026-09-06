import { PrismaClient, Gender, EmploymentType, EmployeeStatus, AttendanceAction, AttendanceSource, DailyStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed]: Clearing existing demo data...');
  // Delete in safe cascade order
  await prisma.auditLog.deleteMany();
  await prisma.attendanceEvent.deleteMany();
  await prisma.dailyAttendance.deleteMany();
  await prisma.employeeHistory.deleteMany();
  await prisma.taskAssignee.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.camera.deleteMany();
  await prisma.device.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.team.deleteMany();
  await prisma.department.deleteMany();
  await prisma.designation.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.company.deleteMany();
  await prisma.tenant.deleteMany();

  console.log('[Seed]: Creating Tenant & Organization...');
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Enterprise Corp',
      slug: 'demo-corp',
      plan: 'ENTERPRISE',
      maxEmployees: 1000,
    },
  });

  const company = await prisma.company.create({
    data: {
      tenantId: tenant.id,
      name: 'Demo Company Global Ltd',
      registrationNumber: 'REG-987654',
      taxId: 'TAX-PK-456789',
      email: 'info@democompany.com',
      phone: '+92 42 111 222 333',
      address: 'Main Boulevard, Gulberg III, Lahore, Pakistan',
      currency: 'PKR',
      timezone: 'Asia/Karachi',
    },
  });

  // Branches: Lahore (Headquarters) and Islamabad
  const branchLahore = await prisma.branch.create({
    data: {
      tenantId: tenant.id,
      companyId: company.id,
      name: 'Lahore Head Office',
      code: 'LHR-01',
      city: 'Lahore',
      country: 'Pakistan',
      address: 'Plot 45, Commercial Zone, Gulberg III',
      latitude: 31.5204,
      longitude: 74.3587,
      geofenceRadius: 250,
      isHeadquarters: true,
    },
  });

  const branchIslamabad = await prisma.branch.create({
    data: {
      tenantId: tenant.id,
      companyId: company.id,
      name: 'Islamabad Regional Branch',
      code: 'ISB-01',
      city: 'Islamabad',
      country: 'Pakistan',
      address: 'Blue Area, Jinnah Avenue, Islamabad',
      latitude: 33.7142,
      longitude: 73.0691,
      geofenceRadius: 200,
      isHeadquarters: false,
    },
  });

  // Departments: IT, HR, Accounts, Sales
  const deptIT = await prisma.department.create({
    data: { tenantId: tenant.id, companyId: company.id, branchId: branchLahore.id, name: 'Information Technology', code: 'DEP-IT' },
  });
  const deptHR = await prisma.department.create({
    data: { tenantId: tenant.id, companyId: company.id, branchId: branchLahore.id, name: 'Human Resources', code: 'DEP-HR' },
  });
  const deptAccounts = await prisma.department.create({
    data: { tenantId: tenant.id, companyId: company.id, branchId: branchLahore.id, name: 'Accounts & Finance', code: 'DEP-ACC' },
  });
  const deptSales = await prisma.department.create({
    data: { tenantId: tenant.id, companyId: company.id, branchId: branchIslamabad.id, name: 'Sales & Business Development', code: 'DEP-SLS' },
  });

  // Designations
  const desigDev = await prisma.designation.create({
    data: { tenantId: tenant.id, title: 'Senior Software Engineer', code: 'SSE', level: 3 },
  });
  const desigHRM = await prisma.designation.create({
    data: { tenantId: tenant.id, title: 'HR Business Partner', code: 'HRBP', level: 3 },
  });
  const desigAccountant = await prisma.designation.create({
    data: { tenantId: tenant.id, title: 'Senior Financial Analyst', code: 'SFA', level: 2 },
  });
  const desigSalesMgr = await prisma.designation.create({
    data: { tenantId: tenant.id, title: 'Regional Sales Manager', code: 'RSM', level: 4 },
  });

  // Shifts
  const shiftMorning = await prisma.shift.create({
    data: {
      tenantId: tenant.id,
      companyId: company.id,
      name: 'Standard Morning Shift',
      code: 'SHF-MORN',
      startTime: '09:00',
      endTime: '17:00',
      gracePeriodMinutes: 15,
      lateThresholdMinutes: 30,
      earlyExitThresholdMinutes: 15,
      halfDayMinutes: 240,
      fullDayMinutes: 480,
    },
  });

  console.log('[Seed]: Setting up Roles & Permissions...');
  const permissionsList = [
    { action: 'employee.view', resource: 'employee', description: 'View employees' },
    { action: 'employee.create', resource: 'employee', description: 'Create employee' },
    { action: 'employee.edit', resource: 'employee', description: 'Edit employee' },
    { action: 'employee.delete', resource: 'employee', description: 'Delete employee' },
    { action: 'attendance.view', resource: 'attendance', description: 'View attendance' },
    { action: 'attendance.create', resource: 'attendance', description: 'Punch attendance' },
    { action: 'attendance.correct', resource: 'attendance', description: 'Correct attendance' },
    { action: 'attendance.approve', resource: 'attendance', description: 'Approve attendance' },
    { action: 'payroll.view', resource: 'payroll', description: 'View payroll' },
    { action: 'payroll.process', resource: 'payroll', description: 'Process payroll' },
    { action: 'task.view', resource: 'task', description: 'View tasks' },
    { action: 'task.create', resource: 'task', description: 'Create tasks' },
    { action: 'camera.view', resource: 'camera', description: 'View cameras' },
    { action: 'camera.configure', resource: 'camera', description: 'Configure cameras' },
    { action: 'reports.view', resource: 'reports', description: 'View reports' },
    { action: 'audit.view', resource: 'audit', description: 'View audit logs' },
    { action: 'organization.manage', resource: 'organization', description: 'Manage organization' },
  ];

  for (const p of permissionsList) {
    await prisma.permission.upsert({
      where: { action: p.action },
      update: {},
      create: p,
    });
  }

  const allPerms = await prisma.permission.findMany();

  const adminRole = await prisma.role.create({
    data: {
      tenantId: tenant.id,
      name: 'Company Admin',
      description: 'Full administrative access for tenant organization',
      isSystemRole: true,
      permissions: {
        create: allPerms.map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const employeeRole = await prisma.role.create({
    data: {
      tenantId: tenant.id,
      name: 'Employee',
      description: 'Standard employee portal access',
      isSystemRole: true,
      permissions: {
        create: allPerms
          .filter((p) => ['attendance.view', 'attendance.create', 'task.view'].includes(p.action))
          .map((p) => ({ permissionId: p.id })),
      },
    },
  });

  console.log('[Seed]: Creating Admin User...');
  const passwordHash = await bcrypt.hash('Admin@123456', 10);
  const adminUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@democompany.com',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+92 300 1234567',
      isSuperAdmin: true,
      userRoles: {
        create: {
          roleId: adminRole.id,
          tenantId: tenant.id,
          branchId: branchLahore.id,
        },
      },
    },
  });

  console.log('[Seed]: Creating 22 Realistic Employees across Lahore and Islamabad...');
  const employeesData = [
    { code: 'EMP-001', first: 'Muhammad', last: 'Ahmed', email: 'ahmed@democompany.com', phone: '+923001000001', branch: branchLahore, dept: deptIT, desig: desigDev, photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    { code: 'EMP-002', first: 'Bilal', last: 'Hassan', email: 'bilal@democompany.com', phone: '+923001000002', branch: branchLahore, dept: deptIT, desig: desigDev, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { code: 'EMP-003', first: 'Ayesha', last: 'Khan', email: 'ayesha@democompany.com', phone: '+923001000003', branch: branchLahore, dept: deptHR, desig: desigHRM, photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { code: 'EMP-004', first: 'Zainab', last: 'Fatima', email: 'zainab@democompany.com', phone: '+923001000004', branch: branchLahore, dept: deptHR, desig: desigHRM, photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
    { code: 'EMP-005', first: 'Hamza', last: 'Tariq', email: 'hamza@democompany.com', phone: '+923001000005', branch: branchLahore, dept: deptAccounts, desig: desigAccountant, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    { code: 'EMP-006', first: 'Usman', last: 'Ali', email: 'usman@democompany.com', phone: '+923001000006', branch: branchLahore, dept: deptAccounts, desig: desigAccountant, photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
    { code: 'EMP-007', first: 'Sana', last: 'Malik', email: 'sana@democompany.com', phone: '+923001000007', branch: branchIslamabad, dept: deptSales, desig: desigSalesMgr, photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
    { code: 'EMP-008', first: 'Omer', last: 'Farooq', email: 'omer@democompany.com', phone: '+923001000008', branch: branchIslamabad, dept: deptSales, desig: desigSalesMgr, photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' },
    { code: 'EMP-009', first: 'Khadija', last: 'Noor', email: 'khadija@democompany.com', phone: '+923001000009', branch: branchIslamabad, dept: deptSales, desig: desigSalesMgr, photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
    { code: 'EMP-010', first: 'Mustafa', last: 'Raza', email: 'mustafa@democompany.com', phone: '+923001000010', branch: branchLahore, dept: deptIT, desig: desigDev, photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
    { code: 'EMP-011', first: 'Maryam', last: 'Siddiqui', email: 'maryam@democompany.com', phone: '+923001000011', branch: branchLahore, dept: deptIT, desig: desigDev, photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    { code: 'EMP-012', first: 'Haris', last: 'Nawaz', email: 'haris@democompany.com', phone: '+923001000012', branch: branchLahore, dept: deptIT, desig: desigDev, photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150' },
    { code: 'EMP-013', first: 'Rabia', last: 'Bashir', email: 'rabia@democompany.com', phone: '+923001000013', branch: branchIslamabad, dept: deptSales, desig: desigSalesMgr, photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
    { code: 'EMP-014', first: 'Fahad', last: 'Mustafa', email: 'fahad@democompany.com', phone: '+923001000014', branch: branchLahore, dept: deptAccounts, desig: desigAccountant, photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150' },
    { code: 'EMP-015', first: 'Zubair', last: 'Qureshi', email: 'zubair@democompany.com', phone: '+923001000015', branch: branchLahore, dept: deptIT, desig: desigDev, photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' },
    { code: 'EMP-016', first: 'Hina', last: 'Altaf', email: 'hina@democompany.com', phone: '+923001000016', branch: branchLahore, dept: deptHR, desig: desigHRM, photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150' },
    { code: 'EMP-017', first: 'Asad', last: 'Iqbal', email: 'asad@democompany.com', phone: '+923001000017', branch: branchIslamabad, dept: deptSales, desig: desigSalesMgr, photo: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150' },
    { code: 'EMP-018', first: 'Nida', last: 'Yasir', email: 'nida@democompany.com', phone: '+923001000018', branch: branchLahore, dept: deptHR, desig: desigHRM, photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
    { code: 'EMP-019', first: 'Shahid', last: 'Afridi', email: 'shahid@democompany.com', phone: '+923001000019', branch: branchIslamabad, dept: deptSales, desig: desigSalesMgr, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { code: 'EMP-020', first: 'Tariq', last: 'Jamil', email: 'tariq@democompany.com', phone: '+923001000020', branch: branchLahore, dept: deptAccounts, desig: desigAccountant, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    { code: 'EMP-021', first: 'Fatima', last: 'Sana', email: 'fatima@democompany.com', phone: '+923001000021', branch: branchLahore, dept: deptIT, desig: desigDev, photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
    { code: 'EMP-022', first: 'Danish', last: 'Taimoor', email: 'danish@democompany.com', phone: '+923001000022', branch: branchIslamabad, dept: deptSales, desig: desigSalesMgr, photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  ];

  const createdEmployees = [];
  for (const ed of employeesData) {
    const emp = await prisma.employee.create({
      data: {
        tenantId: tenant.id,
        companyId: company.id,
        branchId: ed.branch.id,
        departmentId: ed.dept.id,
        designationId: ed.desig.id,
        employeeCode: ed.code,
        firstName: ed.first,
        lastName: ed.last,
        email: ed.email,
        phone: ed.phone,
        photoUrl: ed.photo,
        gender: Gender.MALE,
        joiningDate: new Date('2024-01-15'),
        employmentType: EmploymentType.FULL_TIME,
        status: EmployeeStatus.ACTIVE,
        shiftId: shiftMorning.id,
        qrToken: `QR_DEMO_${ed.code}_AUTH_TOKEN`,
        barcode: `BC${ed.code.replace(/\D/g, '').padStart(6, '0')}`,
      },
    });
    createdEmployees.push(emp);
  }

  console.log('[Seed]: Simulating today live attendance punches and consolidated daily status...');
  const today = new Date();
  const todayMidnight = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  // Simulate punches with various sources
  const sampleEvents = [
    { emp: createdEmployees[0], source: AttendanceSource.CAMERA, time: '08:58', event: AttendanceAction.CHECK_IN, status: DailyStatus.PRESENT },
    { emp: createdEmployees[1], source: AttendanceSource.QR, time: '09:03', event: AttendanceAction.CHECK_IN, status: DailyStatus.PRESENT },
    { emp: createdEmployees[2], source: AttendanceSource.FACE, time: '09:07', event: AttendanceAction.CHECK_IN, status: DailyStatus.PRESENT },
    { emp: createdEmployees[3], source: AttendanceSource.BARCODE, time: '09:12', event: AttendanceAction.CHECK_IN, status: DailyStatus.PRESENT },
    { emp: createdEmployees[4], source: AttendanceSource.CAMERA, time: '09:22', event: AttendanceAction.CHECK_IN, status: DailyStatus.LATE },
    { emp: createdEmployees[5], source: AttendanceSource.VOICE, time: '09:35', event: AttendanceAction.CHECK_IN, status: DailyStatus.LATE },
    { emp: createdEmployees[6], source: AttendanceSource.MOBILE, time: '08:55', event: AttendanceAction.CHECK_IN, status: DailyStatus.PRESENT },
    { emp: createdEmployees[7], source: AttendanceSource.WEB, time: '09:02', event: AttendanceAction.CHECK_IN, status: DailyStatus.PRESENT },
  ];

  for (const se of sampleEvents) {
    const [h, m] = se.time.split(':').map(Number);
    const punchTime = new Date(today);
    punchTime.setHours(h, m, 0, 0);

    await prisma.attendanceEvent.create({
      data: {
        tenantId: tenant.id,
        employeeId: se.emp.id,
        branchId: se.emp.branchId,
        eventType: se.event,
        source: se.source,
        timestamp: punchTime,
        confidenceScore: se.source === AttendanceSource.FACE ? 0.98 : undefined,
        verificationMethod: se.source === AttendanceSource.FACE ? 'FACE_MODEL_V2' : 'DIRECT_SCAN',
      },
    });

    await prisma.dailyAttendance.create({
      data: {
        tenantId: tenant.id,
        employeeId: se.emp.id,
        branchId: se.emp.branchId,
        shiftId: shiftMorning.id,
        date: todayMidnight,
        firstIn: punchTime,
        lateMinutes: se.status === DailyStatus.LATE ? 22 : 0,
        status: se.status,
      },
    });
  }

  console.log('\n======================================================');
  console.log(' SEED COMPLETE SUCCESS:');
  console.log(' - Tenant: Demo Enterprise Corp (demo-corp)');
  console.log(' - Admin Login: admin@democompany.com');
  console.log(' - Password:    Admin@123456');
  console.log(' - Branches:    Lahore Head Office & Islamabad Branch');
  console.log(' - Employees:   22 pre-populated employees');
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
