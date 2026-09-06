import { Router } from 'express';
import { TasksController } from './tasks.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { enforceTenantIsolation } from '../../middlewares/tenant.middleware.js';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/projects', TasksController.listProjects);
router.post('/projects', TasksController.createProject);

router.get('/', TasksController.listTasks);
router.post('/', TasksController.createTask);
router.patch('/:taskId/status', TasksController.updateStatus);

router.post('/time-logs', TasksController.logTime);
router.get('/reconciliation', TasksController.reconcile);

export default router;
