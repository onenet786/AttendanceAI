import { Router } from 'express';
import { AnalyticsController } from './analytics.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { enforceTenantIsolation } from '../../middlewares/tenant.middleware.js';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/attendance', AnalyticsController.getAttendanceAnalytics);
router.get('/payroll', AnalyticsController.getPayrollAnalytics);
router.get('/export', AnalyticsController.export);

export default router;
