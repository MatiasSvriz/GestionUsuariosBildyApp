import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { config } from '../config/index.js';

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn || '15m'
    }
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(AppError.conflict('Ya existe un usuario con ese email'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();
    const refreshToken = generateRefreshToken();

    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'admin',
      status: 'pending',
      verificationCode,
      verificationAttempts: 3,
      refreshToken
    });

    const accessToken = generateAccessToken(user);

    res.status(201).json({
      ok: true,
      data: {
        user: {
          email: user.email,
          status: user.status,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};