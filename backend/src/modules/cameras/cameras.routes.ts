import { Router } from 'express';
import { CamerasController } from './cameras.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { enforceTenantIsolation } from '../../middlewares/tenant.middleware.js';

const router = Router();
const controller = new CamerasController();

// Camera stream management (Admin / Security Supervisor)
router.get('/', authenticate, enforceTenantIsolation, controller.listCameras);
router.post('/', authenticate, enforceTenantIsolation, controller.registerCamera);

// Edge Gateway real-time ingress & batch sync (Authenticated via X-Gateway-Token)
router.post('/gateway/match-stream', controller.processGatewayDetection);
router.post('/gateway/sync-batch', controller.syncGatewayBatch);

export default router;
