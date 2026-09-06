import { describe, it, expect } from 'vitest';
import { TasksService } from '../modules/tasks/tasks.service.js';

describe('Phase 8: Task & Project Management Subsystem', () => {
  const tenantId = 'test-tenant-task';
  const companyId = 'test-company-task';

  it('1. Projects Management > should list and create projects', async () => {
    const initialProjects = await TasksService.listProjects(tenantId);
    expect(initialProjects).toBeDefined();
    expect(initialProjects.length).toBeGreaterThan(0);

    const newProject = await TasksService.createProject(tenantId, companyId, {
      name: 'Automated Micro-Services Refactor',
      code: 'PRJ-REF',
      description: 'Break monolithic workers into independent event consumers',
    });

    expect(newProject.id).toBeDefined();
    expect(newProject.code).toBe('PRJ-REF');
  });

  it('2. Kanban Task Flow > should create tasks and transition status through Kanban columns', async () => {
    const task = await TasksService.createTask(tenantId, 'user-admin', {
      title: 'Implement Webhook HMAC signature verification',
      priority: 'HIGH',
      status: 'TODO',
      estimatedHours: 6,
    });

    expect(task.status).toBe('TODO');

    // Move to IN_PROGRESS
    const inProgress = await TasksService.updateTaskStatus(tenantId, task.id, 'IN_PROGRESS');
    expect(inProgress.status).toBe('IN_PROGRESS');

    // Move to IN_REVIEW
    const inReview = await TasksService.updateTaskStatus(tenantId, task.id, 'IN_REVIEW');
    expect(inReview.status).toBe('IN_REVIEW');

    // Move to DONE
    const done = await TasksService.updateTaskStatus(tenantId, task.id, 'DONE');
    expect(done.status).toBe('DONE');
  });

  it('3. Attendance-to-Task Linkage > should log task time and reconcile with clocked attendance', async () => {
    const task = await TasksService.createTask(tenantId, 'user-admin', {
      title: 'Biometric Face Liveness Calibration',
      status: 'IN_PROGRESS',
    });

    // Log 4 hours on 2026-09-07
    await TasksService.logTaskTime(tenantId, {
      taskId: task.id,
      employeeId: 'emp-001',
      date: '2026-09-07',
      hours: 4.0,
      notes: 'Calibrated passive anti-spoofing depth map',
    });

    // Case A: Employee clocked 4.0 hours (MATCHED)
    const matchReconciliation = await TasksService.reconcileAttendanceWithTasks(
      tenantId,
      'emp-001',
      '2026-09-07',
      4.0
    );
    expect(matchReconciliation.complianceStatus).toBe('MATCHED');
    expect(matchReconciliation.taskLoggedHours).toBe(4.0);
    expect(matchReconciliation.attendanceClockedHours).toBe(4.0);

    // Case B: Employee was absent (clocked 0 hours) but logged task hours (ABSENT_BUT_LOGGED)
    const absentReconciliation = await TasksService.reconcileAttendanceWithTasks(
      tenantId,
      'emp-001',
      '2026-09-07',
      0
    );
    expect(absentReconciliation.complianceStatus).toBe('ABSENT_BUT_LOGGED');

    // Case C: Employee clocked 8.0 hours but only logged 4.0 hours (UNDER_LOGGED)
    const underLoggedReconciliation = await TasksService.reconcileAttendanceWithTasks(
      tenantId,
      'emp-001',
      '2026-09-07',
      8.0
    );
    expect(underLoggedReconciliation.complianceStatus).toBe('UNDER_LOGGED');
  });
});
