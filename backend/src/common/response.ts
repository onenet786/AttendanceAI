import { Response } from 'express';

export interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
  meta?: Record<string, any>;
}

export function sendResponse<T>({
  res,
  statusCode = 200,
  message = 'Operation successful',
  data,
  meta,
}: ApiResponseOptions<T>) {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data: data !== undefined ? data : null,
    meta: meta !== undefined ? meta : undefined,
  });
}
