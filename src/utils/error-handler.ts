import { logger } from './logger';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(id ? `${resource} with id ${id} not found` : `${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ExternalAPIError extends AppError {
  constructor(service: string, message: string, details?: unknown) {
    super(`External API error (${service}): ${message}`, 502, 'EXTERNAL_API_ERROR', details);
    this.name = 'ExternalAPIError';
  }
}

export const handleError = (
  error: unknown
): { message: string; statusCode: number; code?: string } => {
  if (error instanceof AppError) {
    logger.error('Application error', {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      stack: error.stack,
    });
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    logger.error('Unexpected error', {
      error: error.message,
      stack: error.stack,
    });
    return {
      message: 'An unexpected error occurred',
      statusCode: 500,
      code: 'INTERNAL_ERROR',
    };
  }

  logger.error('Unknown error', { error });
  return {
    message: 'An unknown error occurred',
    statusCode: 500,
    code: 'UNKNOWN_ERROR',
  };
};
