import { Request, Response, NextFunction } from 'express';
import { AppError } from '../common/errors.js';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      error: err.name,
      message: err.message,
      details: err.details,
      timestamp: new Date().toISOString(),
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      error: 'ValidationError',
      message: 'Invalid request payload',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
      timestamp: new Date().toISOString(),
    });
  }

  console.error('[Unhandled Server Error]:', err);

  return res.status(500).json({
    success: false,
    statusCode: 500,
    error: 'InternalServerError',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected internal server error occurred' : err.message,
    details: null,
    timestamp: new Date().toISOString(),
  });
}
