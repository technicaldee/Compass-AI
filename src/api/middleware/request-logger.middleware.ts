import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';
import { metrics } from '../../utils/metrics';
import { randomUUID } from 'crypto';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = randomUUID();
  req.headers['x-request-id'] = requestId;

  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
    });

    metrics.timing('http.request.duration', duration, {
      method: req.method,
      statusCode: res.statusCode.toString(),
    });
    metrics.increment('http.request.total', {
      method: req.method,
      statusCode: res.statusCode.toString(),
    });
  });

  next();
};
