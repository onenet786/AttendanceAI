import { describe, it, expect } from 'vitest';
import { AgentService } from '../modules/agent/agent.service.js';
import { AgentContext } from '../modules/agent/agent.types.js';

describe('Phase 6: AI Assistant / Agent Subsystem', () => {
  const adminContext: AgentContext = {
    tenantId: 'tenant-demo-uuid-001',
    userId: 'user-admin-uuid',
    userRole: 'SUPER_ADMIN',
    ipAddress: '127.0.0.1',
  };

  const employeeContext: AgentContext = {
    tenantId: 'tenant-demo-uuid-001',
    userId: 'user-emp-uuid',
    userRole: 'EMPLOYEE',
    employeeId: 'emp-1',
    ipAddress: '127.0.0.1',
  };

  describe('1. Tool Registry & RBAC Introspection', () => {
    it('should expose all 7 business tools for SUPER_ADMIN role', () => {
      const tools = AgentService.getAvailableTools('SUPER_ADMIN');
      expect(tools.length).toBe(7);
      const names = tools.map((t) => t.name);
      expect(names).toContain('search_employees');
      expect(names).toContain('get_attendance_summary');
      expect(names).toContain('get_employee_timesheet');
      expect(names).toContain('get_absent_employees');
      expect(names).toContain('correct_attendance_record');
      expect(names).toContain('get_device_telemetry');
      expect(names).toContain('generate_attendance_report');
    });

    it('should restrict privileged tools (attendance correction, executive reports) from standard EMPLOYEE role', () => {
      const tools = AgentService.getAvailableTools('EMPLOYEE');
      const names = tools.map((t) => t.name);
      expect(names).not.toContain('correct_attendance_record');
      expect(names).not.toContain('generate_attendance_report');
      expect(names).toContain('get_employee_timesheet');
      expect(names).toContain('get_attendance_summary');
    });
  });

  describe('2. Conversational Intent Parsing & Tool Execution', () => {
    it('should dispatch get_absent_employees when asked about absent staff', async () => {
      const response = await AgentService.processMessage(
        'Who is absent today in Lahore Head Office?',
        adminContext
      );

      expect(response.toolCalls.length).toBeGreaterThan(0);
      const toolCall = response.toolCalls[0];
      expect(toolCall.name).toBe('get_absent_employees');
      expect(toolCall.status).toBe('SUCCESS');
      expect(toolCall.result.count).toBe(2);
      expect(response.message).toContain('Absent & Unlogged Employees');
      expect(response.suggestedFollowUps?.length).toBeGreaterThan(0);
    });

    it('should dispatch get_attendance_summary when asked for overview or attendance rate', async () => {
      const response = await AgentService.processMessage(
        'What is our attendance summary and rate today?',
        adminContext
      );

      expect(response.toolCalls.length).toBeGreaterThan(0);
      const toolCall = response.toolCalls[0];
      expect(toolCall.name).toBe('get_attendance_summary');
      expect(toolCall.status).toBe('SUCCESS');
      expect(response.message).toContain('Real-Time Attendance Overview');
      expect(response.message).toContain('Scheduled Staff');
    });

    it('should dispatch get_employee_timesheet when inquiring about worked hours for a person', async () => {
      const response = await AgentService.processMessage(
        'Show worked hours and timesheet for Alex Morgan',
        adminContext
      );

      expect(response.toolCalls.length).toBeGreaterThan(0);
      const toolCall = response.toolCalls[0];
      expect(toolCall.name).toBe('get_employee_timesheet');
      expect(toolCall.status).toBe('SUCCESS');
      expect(toolCall.result.totalWorkedHours).toBe(6.03);
      expect(response.message).toContain('Timesheet Calculation');
      expect(response.message).toContain('Alex Morgan');
    });

    it('should dispatch get_device_telemetry when asked about CCTV cameras and turnstiles', async () => {
      const response = await AgentService.processMessage(
        'Are all turnstiles and CCTV cameras online right now?',
        adminContext
      );

      expect(response.toolCalls.length).toBeGreaterThan(0);
      const toolCall = response.toolCalls[0];
      expect(toolCall.name).toBe('get_device_telemetry');
      expect(toolCall.status).toBe('SUCCESS');
      expect(toolCall.result.onlineCount).toBe(6);
      expect(response.message).toContain('Hardware & CCTV Device Status');
    });

    it('should dispatch search_employees when asking to locate team members', async () => {
      const response = await AgentService.processMessage(
        'Find employee Sara Khan in Product',
        adminContext
      );

      expect(response.toolCalls.length).toBeGreaterThan(0);
      const toolCall = response.toolCalls[0];
      expect(toolCall.name).toBe('search_employees');
      expect(toolCall.status).toBe('SUCCESS');
      expect(response.message).toContain('Employee Search Results');
    });
  });

  describe('3. Security, RBAC Guardrails & Audit Safety', () => {
    it('should deny unauthorized EMPLOYEE role from performing manual punch correction', async () => {
      const response = await AgentService.processMessage(
        'Please correct attendance punch for EMP-001 at 09:00',
        employeeContext
      );

      expect(response.toolCalls.length).toBe(1);
      const toolCall = response.toolCalls[0];
      expect(toolCall.name).toBe('correct_attendance_record');
      expect(toolCall.status).toBe('PERMISSION_DENIED');
      expect(response.message).toContain('Permission Denied');
      expect(response.message).toContain('requires one of [SUPER_ADMIN, ADMIN, SUPERVISOR]');
    });

    it('should permit SUPER_ADMIN role to perform manual punch correction with audit justification', async () => {
      const response = await AgentService.processMessage(
        'Please fix punch and correct attendance for EMP-001 at 09:00',
        adminContext
      );

      expect(response.toolCalls.length).toBe(1);
      const toolCall = response.toolCalls[0];
      expect(toolCall.name).toBe('correct_attendance_record');
      expect(toolCall.status).toBe('SUCCESS');
      expect(toolCall.result.auditLogged).toBe(true);
      expect(response.message).toContain('Manual Attendance Correction Applied');
    });
  });

  describe('4. Multi-Turn Session Memory & Follow-up Suggestions', () => {
    it('should persist conversation history across sequential messages in the same session', async () => {
      const first = await AgentService.processMessage(
        'What is our attendance summary today?',
        adminContext
      );

      const convId = first.conversationId;
      expect(convId).toBeDefined();

      const second = await AgentService.processMessage(
        'Who is absent right now?',
        adminContext,
        convId
      );

      expect(second.conversationId).toBe(convId);
      const history = AgentService.getConversationHistory(convId);
      expect(history.length).toBe(4); // User 1, Assistant 1, User 2, Assistant 2
      expect(history[0].role).toBe('user');
      expect(history[1].role).toBe('assistant');
      expect(history[2].role).toBe('user');
      expect(history[3].role).toBe('assistant');
    });
  });
});
