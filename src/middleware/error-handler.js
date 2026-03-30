import { AppError } from '../utils/AppError.js';

export const notFoundHandler = (req, res, next) => {
  next(AppError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      ok: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'El archivo supera el tamaño máximo de 5 MB'
      }
    });
  }

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    ok: false,
    error: {
      code,
      message,
      ...(err.details && { details: err.details })
    }
  });
};