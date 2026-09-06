import { Request, Response, NextFunction } from 'express';
import { FaceBiometricService } from './face.service.js';

const faceService = new FaceBiometricService();

export class FaceBiometricController {
  /**
   * Enroll employee face template vector
   */
  async enrollFace(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId || (req.headers['x-tenant-id'] as string);
      const { employeeId, vector, qualityScore } = req.body;

      if (!employeeId || !vector || !Array.isArray(vector)) {
        return res.status(400).json({
          success: false,
          error: 'BAD_REQUEST',
          message: 'employeeId and numeric vector array are required',
        });
      }

      const enrolled = await faceService.enrollFace(
        tenantId,
        employeeId,
        vector,
        qualityScore || 0.95
      );

      return res.status(201).json({
        success: true,
        message: 'Employee facial embedding enrolled successfully',
        data: {
          employeeId: enrolled.employeeId,
          employeeCode: enrolled.employeeCode,
          employeeName: enrolled.employeeName,
          qualityScore: enrolled.qualityScore,
          vectorDimensions: enrolled.vector.length,
          enrolledAt: enrolled.enrolledAt,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Vector match lookup without creating a punch
   */
  async identifyFace(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId || (req.headers['x-tenant-id'] as string);
      const { vector, branchId, minConfidence } = req.body;

      if (!vector || !Array.isArray(vector)) {
        return res.status(400).json({
          success: false,
          error: 'BAD_REQUEST',
          message: 'Candidate vector array is required',
        });
      }

      const result = faceService.identifyFace(
        tenantId,
        vector,
        branchId,
        minConfidence || 0.82
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Full Webcam Biometric Punch Ingress
   */
  async webcamPunch(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId || (req.headers['x-tenant-id'] as string);
      const { vector, branchId, action, liveness, snapshotUrl, deviceId } = req.body;

      if (!vector || !Array.isArray(vector)) {
        return res.status(400).json({
          success: false,
          error: 'BAD_REQUEST',
          message: 'Candidate vector array is required',
        });
      }

      const punchResult = await faceService.processBiometricPunch({
        tenantId,
        candidateVector: vector,
        branchId,
        source: 'WEBCAM',
        deviceId,
        action: action || 'CHECK_IN',
        liveness,
        snapshotUrl,
      });

      if (!punchResult.success) {
        return res.status(400).json(punchResult);
      }

      return res.status(200).json(punchResult);
    } catch (error: any) {
      next(error);
    }
  }
}
