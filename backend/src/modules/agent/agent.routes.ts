import { Router } from 'express';
import { AgentController } from './agent.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { enforceTenantIsolation } from '../../middlewares/tenant.middleware.js';

const router = Router();
const controller = new AgentController();

// Protect agent operations with authentication and tenant isolation
router.use(authenticate);
router.use(enforceTenantIsolation);

// Chat with agent
router.post('/chat', controller.chat);

// List tools available for user's role
router.get('/tools', controller.listTools);

// Retrieve conversation history
router.get('/conversations/:id', controller.getConversation);

export default router;
