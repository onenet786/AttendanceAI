import { Router } from 'express';
import { FaceBiometricController } from './face.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { enforceTenantIsolation } from '../../middlewares/tenant.middleware.js';

const router = Router();
const controller = new FaceBiometricController();

// Biometric enrollment (Admin / HR)
router.post('/enroll', authenticate, enforceTenantIsolation, controller.enrollFace);

// Biometric identification lookup
router.post('/identify', authenticate, enforceTenantIsolation, controller.identifyFace);

// Webcam Biometric punch (User portal or Kiosk)
router.post('/webcam-punch', authenticate, enforceTenantIsolation, controller.webcamPunch);

export default router;
