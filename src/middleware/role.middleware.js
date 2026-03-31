import { AppError } from '../utils/AppError.js';

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Usuario no autenticado'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(AppError.forbidden('No tienes permisos para realizar esta acción'));
    }

    next();
  };
};