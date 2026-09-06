export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'HR_MANAGER' | 'BRANCH_MANAGER' | 'SUPERVISOR' | 'EMPLOYEE';

export interface ToolParameterSchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  enum?: string[];
  required?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  requiredRole?: Role[];
  parameters: {
    type: 'object';
    properties: Record<string, ToolParameterSchema>;
    required: string[];
  };
  execute: (params: any, context: AgentContext) => Promise<any>;
}

export interface AgentContext {
  tenantId: string;
  userId: string;
  userRole: Role;
  employeeId?: string;
  ipAddress?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  toolCalls?: ToolCallExecution[];
}

export interface ToolCallExecution {
  id: string;
  name: string;
  arguments: Record<string, any>;
  result?: any;
  status: 'SUCCESS' | 'ERROR' | 'PERMISSION_DENIED';
  executionTimeMs: number;
}

export interface AgentChatResponse {
  conversationId: string;
  message: string;
  toolCalls: ToolCallExecution[];
  suggestedFollowUps?: string[];
}
