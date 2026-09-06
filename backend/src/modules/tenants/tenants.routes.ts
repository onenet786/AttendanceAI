import { Router } from 'express';
import { TenantController } from './tenants.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { enforceTenantIsolation } from '../../middlewares/tenant.middleware.js';
import { requirePermissions } from '../../middlewares/rbac.middleware.js';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/companies', TenantController.getCompanies);
router.get('/branches', TenantController.getBranches);
router.post('/branches', requirePermissions('organization.manage'), TenantController.createBranch);
router.get('/departments', TenantController.getDepartments);
router.get('/designations', TenantController.getDesignations);
router.get('/shifts', TenantController.getShifts);

export default router;
