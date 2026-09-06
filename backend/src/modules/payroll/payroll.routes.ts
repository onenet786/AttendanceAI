import { Router } from 'express';
import { PayrollController } from './payroll.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { enforceTenantIsolation } from '../../middlewares/tenant.middleware.js';

const router = Router();
const controller = new PayrollController();

// All payroll actions are strictly tenant-isolated
router.use(authenticate);
router.use(enforceTenantIsolation);

// Salary structures
router.post('/structures', controller.upsertStructure);
router.get('/structures/:employeeId', controller.getStructure);

// Payroll accounting periods & runs
router.post('/periods', controller.createPeriod);
router.post('/periods/:id/run', controller.executeRun);
router.post('/periods/:id/lock', controller.lockPeriod);
router.get('/periods/:id/payslips', controller.getPayslips);

export default router;
