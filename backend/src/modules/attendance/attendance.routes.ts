import { Router } from 'express';
import { AttendanceController } from './attendance.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { enforceTenantIsolation } from '../../middlewares/tenant.middleware.js';
import { requirePermissions } from '../../middlewares/rbac.middleware.js';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.post('/punch', requirePermissions('attendance.create'), AttendanceController.punch);
router.get('/live/summary', requirePermissions('attendance.view'), AttendanceController.getLiveSummary);
router.get('/live/events', requirePermissions('attendance.view'), AttendanceController.getRecentEvents);
router.get('/daily', requirePermissions('attendance.view'), AttendanceController.getDailyRecords);

export default router;
