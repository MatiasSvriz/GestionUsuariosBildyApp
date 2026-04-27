import { AppError } from '../utils/AppError.js';
import { sendSlackError } from '../services/notification.service.js';

export const notFoundHandler = (req, res, next) => {
  next(AppError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = async (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  // 🔥 SOLO ERRORES 5XX → requisito de la práctica
  if (statusCode >= 500) {
    await sendSlackError({
      timestamp: new Date().toISOString(),
      method: req.method,
      route: req.originalUrl,
      message,
      stack: err.stack
    });
  }

  res.status(statusCode).json({
    ok: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message
    }
  });
};