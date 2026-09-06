import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service.js';
import { sendResponse } from '../../common/response.js';

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export class AuthController {
  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await AuthService.login(email, password, ip, userAgent);

      return sendResponse({
        res,
        statusCode: 200,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  public static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = refreshSchema.parse(req.body);
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await AuthService.refresh(refreshToken, ip, userAgent);

      return sendResponse({
        res,
        statusCode: 200,
        message: 'Tokens refreshed successfully',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  public static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
      await AuthService.logout(refreshToken);

      return sendResponse({
        res,
        statusCode: 200,
        message: 'Logged out successfully',
        data: null,
      });
    } catch (error) {
      return next(error);
    }
  }

  public static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const profile = await AuthService.getMe(userId);

      return sendResponse({
        res,
        statusCode: 200,
        message: 'Profile retrieved successfully',
        data: profile,
      });
    } catch (error) {
      return next(error);
    }
  }
}
