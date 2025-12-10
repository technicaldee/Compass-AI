import { Request, Response, NextFunction } from 'express';
import { ProjectPayloadSchema } from '../../types/schemas';
import { ValidationError } from '../../utils/error-handler';

export const validateProjectPayload = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const result = ProjectPayloadSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Invalid project payload', result.error.errors);
    }
    req.body = result.data;
    next();
  } catch (error) {
    next(error);
  }
};

export const validatePartialProject = (_req: Request, _res: Response, next: NextFunction): void => {
  // Allow partial updates
  next();
};
