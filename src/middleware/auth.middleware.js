import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { config } from '../config/index.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(AppError.unauthorized('Token no proporcionado'));
    }

    const token = authHeader.split(' ')[1];

    const payload = jwt.verify(token, config.jwtSecret);

    const user = await User.findById(payload.id).select(
      '+verificationCode +refreshToken +refreshTokenExpiresAt'
    );

    if (!user) {
      return next(AppError.unauthorized('Usuario no autorizado'));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(AppError.unauthorized('Token inválido o expirado'));
  }
};

export default authMiddleware;