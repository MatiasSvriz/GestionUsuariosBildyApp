import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const parsedData = schema.parse({
      body: req.body
    });

    req.body = parsedData.body;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message
      }));

      return next(AppError.validation('Error de validación', details));
    }

    next(error);
  }
};