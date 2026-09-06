import { Router } from 'express';
import { EmployeeController } from './employees.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { enforceTenantIsolation } from '../../middlewares/tenant.middleware.js';
import { requirePermissions } from '../../middlewares/rbac.middleware.js';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/', requirePermissions('employee.view'), EmployeeController.getEmployees);
router.get('/:id', requirePermissions('employee.view'), EmployeeController.getEmployeeById);
router.post('/', requirePermissions('employee.create'), EmployeeController.createEmployee);
router.put('/:id', requirePermissions('employee.edit'), EmployeeController.updateEmployee);

export default router;
