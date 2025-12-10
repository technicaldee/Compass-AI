import { Request, Response, NextFunction } from 'express';
import { handleError } from '../../utils/error-handler';
import { logger } from '../../utils/logger';

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const errorInfo = handleError(error);

  logger.error('Request error', {
    path: req.path,
    method: req.method,
    error: errorInfo,
  });

  res.status(errorInfo.statusCode).json({
    success: false,
    error: {
      message: errorInfo.message,
      code: errorInfo.code,
    },
    requestId: req.headers['x-request-id'] || 'unknown',
  });
};
