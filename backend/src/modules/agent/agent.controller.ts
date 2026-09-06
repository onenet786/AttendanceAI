import { Request, Response, NextFunction } from 'express';
import { AgentService } from './agent.service.js';
import { AgentContext, Role } from './agent.types.js';

export class AgentController {
  /**
   * Process a conversational user prompt with tool dispatching
   */
  async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, conversationId } = req.body;

      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          error: 'BAD_REQUEST',
          message: 'Field "message" is required and cannot be empty.',
        });
      }

      const userRole: Role = (req.user?.roles?.[0] as Role) || (req.user?.isSuperAdmin ? 'SUPER_ADMIN' : 'EMPLOYEE');

      const context: AgentContext = {
        tenantId: req.user?.tenantId || (req.headers['x-tenant-id'] as string) || 'default-tenant',
        userId: req.user?.id || 'demo-user',
        userRole,
        employeeId: (req.user as any)?.employeeId,
        ipAddress: req.ip || req.socket.remoteAddress,
      };

      const response = await AgentService.processMessage(message, context, conversationId);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Agent response generated successfully',
        data: response,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * List available tools and authorized capabilities for the authenticated user's role
   */
  async listTools(req: Request, res: Response, next: NextFunction) {
    try {
      const role: Role = (req.user?.roles?.[0] as Role) || (req.user?.isSuperAdmin ? 'SUPER_ADMIN' : 'EMPLOYEE');
      const tools = AgentService.getAvailableTools(role);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: {
          role,
          count: tools.length,
          tools: tools.map((t) => ({
            name: t.name,
            description: t.description,
            parameters: t.parameters,
            requiredRole: t.requiredRole || [],
          })),
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get conversation history
   */
  async getConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const history = AgentService.getConversationHistory(id);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        data: {
          conversationId: id,
          messages: history,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }
}
