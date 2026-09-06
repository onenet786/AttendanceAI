import { Router } from 'express';
import { NotificationController } from './notification.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { enforceTenantIsolation } from '../../middlewares/tenant.middleware.js';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/', NotificationController.list);
router.get('/unread-count', NotificationController.getUnreadCount);
router.patch('/:id/read', NotificationController.markRead);
router.post('/read-all', NotificationController.markAllRead);
router.get('/watchdog', NotificationController.runWatchdog);

router.post('/webhooks', NotificationController.registerWebhook);
router.get('/webhooks', NotificationController.listWebhooks);

export default router;
