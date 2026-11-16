import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[API Error]:', err);

  const requestId = req.headers['x-request-id'] || `req_${Date.now()}`;

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request input data',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
        requestId,
      },
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || (statusCode === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'),
      message: statusCode === 500 && process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : message,
      requestId,
    },
  });
}
