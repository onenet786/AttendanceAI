import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { prisma } from './lib/prisma.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { sendResponse } from './common/response.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import tenantRoutes from './modules/tenants/tenants.routes.js';
import employeeRoutes from './modules/employees/employees.routes.js';
import attendanceRoutes from './modules/attendance/attendance.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';
import devicesRoutes from './modules/devices/devices.routes.js';
import biometricsRoutes from './modules/biometrics/face.routes.js';
import camerasRoutes from './modules/cameras/cameras.routes.js';

const app = express();

// Security and utility middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Swagger UI and local development
  })
);
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Global Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: {
    success: false,
    statusCode: 429,
    error: 'TooManyRequests',
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api/', apiLimiter);

// Health Check Endpoints
app.get('/health', (req: Request, res: Response) => {
  return sendResponse({
    res,
    message: 'AttendanceAI API service is operational',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

app.get('/health/database', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return sendResponse({
      res,
      message: 'Database connection healthy',
      data: { status: 'CONNECTED' },
    });
  } catch (error: any) {
    return res.status(503).json({
      success: false,
      statusCode: 503,
      error: 'ServiceUnavailable',
      message: 'Database connection failed',
      details: error.message,
    });
  }
});

// Swagger Documentation Specification
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'AttendanceAI Multi-Tenant Enterprise API',
    version: '1.0.0',
    description: 'Central unified API for HR, unified Attendance Engine, Payroll, Tasks & AI Voice integration.',
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/health': {
      get: {
        summary: 'Service health check',
        responses: { '200': { description: 'Service is healthy' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'User login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'admin@democompany.com' },
                  password: { type: 'string', example: 'Admin@123456' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Authenticated successfully' } },
      },
    },
    '/employees': {
      get: {
        summary: 'List employees with pagination and filters',
        responses: { '200': { description: 'Employee list' } },
      },
    },
    '/attendance/live/summary': {
      get: {
        summary: 'Real-time dashboard attendance summary (Present, Absent, Late)',
        responses: { '200': { description: 'Summary counters' } },
      },
    },
    '/attendance/punch': {
      post: {
        summary: 'Central Attendance Punch (QR, Barcode, Camera, Face, Voice, Manual)',
        responses: { '201': { description: 'Attendance event recorded' } },
      },
    },
  },
};

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount Versioned Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/organization', tenantRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/devices', devicesRoutes);
app.use('/api/v1/biometrics', biometricsRoutes);
app.use('/api/v1/cameras', camerasRoutes);

// 404 Route Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    error: 'NotFound',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Central Error Handler
app.use(errorHandler);

export default app;
