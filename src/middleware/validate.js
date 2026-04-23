import { AppError } from '../utils/AppError.js';

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    next();
  } catch (error) {
    const details = error.issues?.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message
    })) || [];

    next(AppError.validation('Error de validación', details));
  }
};

export default validate;