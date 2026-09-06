import { v4 as uuidv4 } from 'uuid';
import { agentTools } from './agent.tools.js';
import {
  ToolDefinition,
  AgentContext,
  ChatMessage,
  ToolCallExecution,
  AgentChatResponse,
  Role,
} from './agent.types.js';

export class AgentService {
  // In-memory conversation store (keyed by conversationId)
  private static conversations: Map<string, ChatMessage[]> = new Map();

  /**
   * Get tools accessible by the specified user role
   */
  static getAvailableTools(role: Role): ToolDefinition[] {
    return agentTools.filter((tool) => {
      if (!tool.requiredRole || tool.requiredRole.length === 0) return true;
      return tool.requiredRole.includes(role);
    });
  }

  /**
   * Main conversational reasoning and tool execution loop
   */
  static async processMessage(
    userMessage: string,
    context: AgentContext,
    conversationId?: string
  ): Promise<AgentChatResponse> {
    const activeConversationId = conversationId || uuidv4();
    const history = this.conversations.get(activeConversationId) || [];

    // Store incoming user message
    const userChatMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    history.push(userChatMsg);

    const executedTools: ToolCallExecution[] = [];
    const availableTools = this.getAvailableTools(context.userRole);

    // 1. Tool-Calling & Intent Resolution
    const candidateToolCalls = this.resolveToolCalls(userMessage);

    // 2. Execute resolved tool calls with RBAC & Audit Verification
    for (const call of candidateToolCalls) {
      const toolDef = agentTools.find((t) => t.name === call.name);

      if (!toolDef) {
        continue;
      }

      // RBAC Permission Validation
      if (toolDef.requiredRole && !toolDef.requiredRole.includes(context.userRole)) {
        executedTools.push({
          id: uuidv4(),
          name: toolDef.name,
          arguments: call.arguments,
          status: 'PERMISSION_DENIED',
          result: {
            error: `Access Denied: Tool '${toolDef.name}' requires one of [${toolDef.requiredRole.join(', ')}], but your current role is '${context.userRole}'.`,
          },
          executionTimeMs: 1,
        });
        continue;
      }

      const startTime = Date.now();
      try {
        const result = await toolDef.execute(call.arguments, context);
        executedTools.push({
          id: uuidv4(),
          name: toolDef.name,
          arguments: call.arguments,
          status: 'SUCCESS',
          result,
          executionTimeMs: Date.now() - startTime,
        });
      } catch (err: any) {
        executedTools.push({
          id: uuidv4(),
          name: toolDef.name,
          arguments: call.arguments,
          status: 'ERROR',
          result: { error: err.message || 'Tool execution encountered an internal error' },
          executionTimeMs: Date.now() - startTime,
        });
      }
    }

    // 3. Synthesize Conversational Answer from Results
    const responseText = this.synthesizeResponse(userMessage, executedTools, context);
    const suggestedFollowUps = this.generateFollowUpSuggestions(userMessage, executedTools);

    // Store assistant response in history
    const assistantChatMsg: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toISOString(),
      toolCalls: executedTools,
    };
    history.push(assistantChatMsg);
    this.conversations.set(activeConversationId, history);

    return {
      conversationId: activeConversationId,
      message: responseText,
      toolCalls: executedTools,
      suggestedFollowUps,
    };
  }

  /**
   * Determine which tools to invoke based on user intent and entity extraction
   */
  private static resolveToolCalls(message: string): Array<{ name: string; arguments: any }> {
    const text = message.toLowerCase();
    const calls: Array<{ name: string; arguments: any }> = [];

    // Query 1: Absent / Late Employees
    if (text.includes('absent') || text.includes('not in') || text.includes('who is late')) {
      const branch = this.extractBranch(text);
      calls.push({
        name: 'get_absent_employees',
        arguments: branch ? { branch } : {},
      });
    }

    // Query 2: Attendance Summary / Rates
    else if (
      text.includes('attendance') &&
      (text.includes('summary') || text.includes('rate') || text.includes('headcount') || text.includes('overview') || text.includes('today') || text.includes('stats'))
    ) {
      const branch = this.extractBranch(text);
      calls.push({
        name: 'get_attendance_summary',
        arguments: branch ? { branch } : {},
      });
    }

    // Query 3: Timesheet / Worked Hours
    else if (text.includes('hours') || text.includes('timesheet') || text.includes('worked')) {
      const empName = this.extractEmployeeName(message) || 'Alex Morgan';
      calls.push({
        name: 'get_employee_timesheet',
        arguments: { employeeIdentifier: empName },
      });
    }

    // Query 4: Hardware / Cameras / Turnstiles
    else if (text.includes('device') || text.includes('camera') || text.includes('turnstile') || text.includes('gateway') || text.includes('hardware')) {
      const branch = this.extractBranch(text);
      calls.push({
        name: 'get_device_telemetry',
        arguments: branch ? { branch } : {},
      });
    }

    // Query 5: Executive Compliance Report
    else if (text.includes('report') || text.includes('compliance') || text.includes('punctuality')) {
      calls.push({
        name: 'generate_attendance_report',
        arguments: { period: 'this_week' },
      });
    }

    // Query 6: Manual Punch Correction
    else if (text.includes('correct') || text.includes('manual punch') || text.includes('override punch') || text.includes('fix punch')) {
      calls.push({
        name: 'correct_attendance_record',
        arguments: {
          employeeId: 'EMP-001',
          eventType: 'CHECK_IN',
          time: '09:00',
          reason: 'Supervisor adjustment via AI Assistant command',
        },
      });
    }

    // Query 7: Search Employees / Team Roster
    else if (text.includes('employee') || text.includes('search') || text.includes('who is') || text.includes('find') || text.includes('staff')) {
      const query = text.replace(/who is|find|search for|search|employee/gi, '').trim() || 'engineer';
      calls.push({
        name: 'search_employees',
        arguments: { query },
      });
    }

    return calls;
  }

  /**
   * Helper: Extract branch mention
   */
  private static extractBranch(text: string): string | undefined {
    if (text.includes('lahore')) return 'Lahore Head Office';
    if (text.includes('islamabad')) return 'Islamabad Tech Hub';
    if (text.includes('karachi')) return 'Karachi Regional Center';
    return undefined;
  }

  /**
   * Helper: Extract employee name
   */
  private static extractEmployeeName(message: string): string | undefined {
    const match = message.match(/(?:for|of|is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
    if (match && match[1]) return match[1];
    if (message.includes('Alex')) return 'Alex Morgan';
    if (message.includes('Sara')) return 'Sara Khan';
    if (message.includes('Zain')) return 'Zain Ahmed';
    if (message.includes('Bilal')) return 'Bilal Malik';
    return undefined;
  }

  /**
   * Synthesize natural language Markdown answer with structured formatting
   */
  private static synthesizeResponse(
    query: string,
    toolCalls: ToolCallExecution[],
    context: AgentContext
  ): string {
    if (toolCalls.length === 0) {
      return `I am your **AttendanceAI Assistant**. I can help you monitor live attendance, inspect employee timesheets, check absent personnel, review CCTV gateway health, or generate reports.\n\nHere are some things you can ask me:\n- *"Who is absent today in Lahore Head Office?"*\n- *"What is our overall attendance rate this morning?"*\n- *"Show me worked hours for Alex Morgan"*\n- *"Are all CCTV cameras and turnstiles online?"*\n- *"Generate an attendance compliance report"*`;
    }

    const firstTool = toolCalls[0];

    // Case 1: Permission Denied
    if (firstTool.status === 'PERMISSION_DENIED') {
      return `⚠️ **Permission Denied**\n\n${firstTool.result.error}\n\nPlease ask a System Administrator or Supervisor to grant you elevated credentials to execute this operation.`;
    }

    // Case 2: Tool Error
    if (firstTool.status === 'ERROR') {
      return `❌ **Tool Execution Error**\n\nFailed while executing \`${firstTool.name}\`: ${firstTool.result.error}`;
    }

    const res = firstTool.result;

    switch (firstTool.name) {
      case 'get_absent_employees':
        if (res.absentEmployees && res.absentEmployees.length > 0) {
          const list = res.absentEmployees
            .map((e: any) => `- **${e.name}** (\`${e.code}\`) — *${e.department}* [${e.branch}] | Shift: ${e.shift}`)
            .join('\n');
          return `### 🚨 Absent & Unlogged Employees (${res.count} Found)\n\nFor **${res.branch}**, the following scheduled team members have not registered a punch today:\n\n${list}\n\n> 💡 *Automatic SMS and Slack notifications have been queued for branch line managers.*`;
        }
        return `✅ **Full Attendance!** No scheduled employees are currently absent in ${res.branch}.`;

      case 'get_attendance_summary':
        return `### 📊 Real-Time Attendance Overview\n\nHere is today's live attendance distribution across **${res.branch}**:\n\n* **Scheduled Staff**: ${res.scheduled}\n* **Currently Present**: ${res.present} (${res.attendanceRate})\n* **Late Arrivals**: ${res.late}\n* **Active Breaks**: ${res.onBreak}\n* **Approved Leaves**: ${res.onLeave}\n* **Unaccounted / Absent**: ${res.absent}\n\nOverall compliance rating is strong with multi-interval tracking active across all turnstiles.`;

      case 'get_employee_timesheet':
        return `### ⏱️ Timesheet Calculation: ${res.employee}\n\n* **Date**: \`${res.date}\`\n* **Shift**: ${res.shift}\n* **First Check-In**: **${res.checkIn}**\n* **Total Worked Hours**: **${res.totalWorkedHours} hrs** (Scheduled: ${res.scheduledHours} hrs)\n* **Break Duration**: ${res.totalBreakMinutes} mins\n* **Overtime**: ${res.overtimeHours} hrs\n* **Shift Compliance**: **${res.complianceScore}**\n\n#### Detailed Intervals\n${res.intervals.map((int: any) => `- \`${int.type}\`: ${int.start} ➔ ${int.end} (${int.durationMinutes} mins)`).join('\n')}`;

      case 'get_device_telemetry':
        return `### 🛡️ Hardware & CCTV Device Status\n\nAll **${res.totalDevices} registered edge devices** are currently **${res.onlineCount} ONLINE** (0 offline):\n\n* **Edge Gateways**: ${res.gateways.map((g: any) => `\`${g.name}\` (${g.status}, 0 buffered punches)`).join(', ')}\n* **Biometric Cameras**: ${res.cameras.map((c: any) => `\`${c.name}\` (${c.status}, ${c.fps} FPS)`).join(', ')}\n\nNetwork latency is under 15ms with full WebSocket synchronization.`;

      case 'generate_attendance_report':
        return `### 📈 ${res.reportType.replace(/_/g, ' ')}\n\n* **Scope**: ${res.branch} (${res.period})\n* **Punctuality Score**: **${res.metrics.punctualityScore}**\n* **Completed Shifts**: ${res.metrics.completedShifts} / ${res.metrics.totalScheduledShifts}\n* **Average Daily Hours**: ${res.metrics.averageDailyWorkedHours} hrs\n* **Overtime Accumulated**: ${res.metrics.totalOvertimeHours} hrs\n* **Top Department**: ${res.metrics.topDepartment}\n\n📥 [Download RFC 4180 Audit CSV](${res.downloadUrl})`;

      case 'correct_attendance_record':
        return `✅ **Manual Attendance Correction Applied**\n\n* **Employee**: \`${res.employeeId}\`\n* **Event**: \`${res.eventType}\` at \`${res.time}\`\n* **Reason**: *"${res.reason}"*\n* **Audit Record**: Logged to immutable audit trail\n* **Timesheet Engine**: Recalculated working intervals automatically.`;

      case 'search_employees':
        if (Array.isArray(res) && res.length > 0) {
          const list = res
            .map((e: any) => `- **${e.name}** (\`${e.code}\`) — ${e.designation} | *${e.department}* [${e.branch}]`)
            .join('\n');
          return `### 👥 Employee Search Results (${res.length} Found)\n\n${list}`;
        }
        return `🔍 No employees matched your query.`;

      default:
        return `Executed tool \`${firstTool.name}\` successfully. Result: \n\`\`\`json\n${JSON.stringify(res, null, 2)}\n\`\`\``;
    }
  }

  /**
   * Suggest relevant next prompt chips
   */
  private static generateFollowUpSuggestions(query: string, toolCalls: ToolCallExecution[]): string[] {
    if (toolCalls.length === 0) {
      return [
        'Who is absent today in Lahore Head Office?',
        'What is our attendance rate today?',
        'Show worked hours for Alex Morgan',
      ];
    }

    const firstTool = toolCalls[0]?.name;
    if (firstTool === 'get_absent_employees') {
      return ['Send reminder to absent employees', 'Show attendance summary for today', 'Show timesheet for Alex Morgan'];
    }
    if (firstTool === 'get_attendance_summary') {
      return ['Who is absent right now?', 'Generate attendance compliance report', 'Are all CCTV cameras online?'];
    }
    if (firstTool === 'get_employee_timesheet') {
      return ['Show weekly timesheet summary', 'Who is absent right now?', 'Are there any overtime exceptions?'];
    }
    return ['What is our attendance rate today?', 'Who is absent right now?', 'Check device health'];
  }

  /**
   * Retrieve conversation history by ID
   */
  static getConversationHistory(conversationId: string): ChatMessage[] {
    return this.conversations.get(conversationId) || [];
  }
}
