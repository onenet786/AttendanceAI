import { Request, Response, NextFunction } from 'express';
import { VoiceService } from './voice.service.js';

const voiceService = new VoiceService();

export class VoiceController {
  /**
   * Execute voice command or spoken punch
   */
  async executeCommand(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId || (req.headers['x-tenant-id'] as string);
      const employeeId = req.body.employeeId || req.user?.id;
      const { transcript, audioBase64, candidateVoiceVector, branchId, deviceId } = req.body;

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          error: 'BAD_REQUEST',
          message: 'employeeId is required',
        });
      }

      const result = await voiceService.processVoiceCommand({
        tenantId,
        employeeId,
        transcript,
        audioBase64,
        candidateVoiceVector,
        branchId,
        deviceId,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Enroll employee acoustic voiceprint
   */
  async enrollVoiceprint(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId || (req.headers['x-tenant-id'] as string);
      const { employeeId, voiceVector } = req.body;

      if (!employeeId || !voiceVector || !Array.isArray(voiceVector)) {
        return res.status(400).json({
          success: false,
          error: 'BAD_REQUEST',
          message: 'employeeId and numeric voiceVector array are required',
        });
      }

      const enrolled = await voiceService.enrollVoiceprint(
        tenantId,
        employeeId,
        voiceVector
      );

      return res.status(201).json({
        success: true,
        message: 'Acoustic voiceprint enrolled successfully',
        data: {
          employeeId: enrolled.employeeId,
          employeeCode: enrolled.employeeCode,
          employeeName: enrolled.employeeName,
          vectorDimensions: enrolled.voiceVector.length,
          enrolledAt: enrolled.enrolledAt,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Standalone voice biometric verification
   */
  async verifyVoiceprint(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId || (req.headers['x-tenant-id'] as string);
      const { employeeId, voiceVector, minConfidence } = req.body;

      if (!employeeId || !voiceVector || !Array.isArray(voiceVector)) {
        return res.status(400).json({
          success: false,
          error: 'BAD_REQUEST',
          message: 'employeeId and voiceVector array are required',
        });
      }

      const verification = voiceService.verifyVoiceprint(
        tenantId,
        employeeId,
        voiceVector,
        minConfidence || 0.80
      );

      return res.status(200).json({
        success: true,
        data: verification,
      });
    } catch (error: any) {
      next(error);
    }
  }
}
