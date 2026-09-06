import { Router } from 'express';
import { DevicesController } from './devices.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { enforceTenantIsolation } from '../../middlewares/tenant.middleware.js';
import { requirePermissions } from '../../middlewares/rbac.middleware.js';

const router = Router();

// 1. Unauthenticated Device Hardware Endpoints (Authenticate via X-Device-Token)
router.post('/heartbeat', DevicesController.heartbeat);
router.post('/terminal-punch', DevicesController.terminalPunch);

// 2. Authenticated Admin & Tenant Endpoints
router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/', requirePermissions('organization.manage'), DevicesController.list);
router.post('/register', requirePermissions('organization.manage'), DevicesController.register);
router.post('/qr/generate-rotating', requirePermissions('attendance.create'), DevicesController.generateRotatingQr);

export default router;
