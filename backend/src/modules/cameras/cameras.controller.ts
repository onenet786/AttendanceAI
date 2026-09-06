import { Request, Response, NextFunction } from 'express';
import { CamerasService } from './cameras.service.js';

const camerasService = new CamerasService();

export class CamerasController {
  /**
   * List registered IP cameras
   */
  async listCameras(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId || (req.headers['x-tenant-id'] as string);
      const branchId = req.query.branchId as string;

      const cameras = await camerasService.listCameras(tenantId, branchId);

      return res.status(200).json({
        success: true,
        data: cameras,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Register new IP camera stream
   */
  async registerCamera(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId || (req.headers['x-tenant-id'] as string);
      const camera = await camerasService.registerCamera(tenantId, req.body);

      return res.status(201).json({
        success: true,
        message: 'Camera stream registered successfully',
        data: camera,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Ingest real-time face detection from Local Edge Gateway
   */
  async processGatewayDetection(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId || (req.headers['x-tenant-id'] as string);
      const gatewayToken = (req.headers['x-gateway-token'] as string) || req.body.gatewayToken;

      if (!gatewayToken) {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'X-Gateway-Token header is required for Edge Gateway ingress',
        });
      }

      const result = await camerasService.processGatewayDetection(
        tenantId,
        gatewayToken,
        req.body
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Synchronize offline buffered events from Edge Gateway local SQLite
   */
  async syncGatewayBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId || (req.headers['x-tenant-id'] as string);
      const gatewayToken = (req.headers['x-gateway-token'] as string) || req.body.gatewayToken;
      const { events } = req.body;

      if (!gatewayToken) {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'X-Gateway-Token header is required for Edge Gateway sync',
        });
      }

      if (!events || !Array.isArray(events)) {
        return res.status(400).json({
          success: false,
          error: 'BAD_REQUEST',
          message: 'events array is required',
        });
      }

      const syncResult = await camerasService.syncGatewayBatch(
        tenantId,
        gatewayToken,
        events
      );

      return res.status(200).json({
        success: true,
        message: `Processed ${syncResult.totalReceived} offline gateway events: ${syncResult.syncedCount} synced, ${syncResult.rejectedCount} rejected`,
        data: syncResult,
      });
    } catch (error: any) {
      next(error);
    }
  }
}
