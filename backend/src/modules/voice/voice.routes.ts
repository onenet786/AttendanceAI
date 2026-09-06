import { Router } from 'express';
import { VoiceController } from './voice.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { enforceTenantIsolation } from '../../middlewares/tenant.middleware.js';

const router = Router();
const controller = new VoiceController();

// All voice actions are scoped to authenticated tenant
router.use(authenticate);
router.use(enforceTenantIsolation);

// Execute spoken voice command or attendance punch
router.post('/command', controller.executeCommand);

// Voiceprint enrollment
router.post('/enroll', controller.enrollVoiceprint);

// Voiceprint authentication check
router.post('/verify', controller.verifyVoiceprint);

export default router;
