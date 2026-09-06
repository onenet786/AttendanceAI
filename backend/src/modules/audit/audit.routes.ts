import { Router } from 'express';
import { AuditController } from './audit.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { enforceTenantIsolation } from '../../middlewares/tenant.middleware.js';
import { requirePermissions } from '../../middlewares/rbac.middleware.js';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/', requirePermissions('audit.view'), AuditController.getLogs);

export default router;
