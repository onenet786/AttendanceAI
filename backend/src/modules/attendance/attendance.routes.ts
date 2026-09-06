import { Router } from 'express';
import { AttendanceController } from './attendance.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { enforceTenantIsolation } from '../../middlewares/tenant.middleware.js';
import { requirePermissions } from '../../middlewares/rbac.middleware.js';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

// Live and Central Punch
router.post('/punch', requirePermissions('attendance.create'), AttendanceController.punch);
router.post('/correct', requirePermissions('attendance.correct'), AttendanceController.correct);
router.get('/timeline/:employeeId', requirePermissions('attendance.view'), AttendanceController.getEmployeeTimeline);
router.get('/live/summary', requirePermissions('attendance.view'), AttendanceController.getLiveSummary);
router.get('/live/events', requirePermissions('attendance.view'), AttendanceController.getRecentEvents);
router.get('/daily', requirePermissions('attendance.view'), AttendanceController.getDailyRecords);

// Reports & Exports
router.get('/reports/daily', requirePermissions('reports.view'), AttendanceController.getDailyReport);
router.get('/reports/monthly', requirePermissions('reports.view'), AttendanceController.getMonthlyReport);
router.get('/reports/exceptions', requirePermissions('reports.view'), AttendanceController.getExceptionsReport);
router.get('/reports/export-csv', requirePermissions('reports.export'), AttendanceController.exportCsv);

export default router;
