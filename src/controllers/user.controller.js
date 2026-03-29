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

export const validateEmailCode = async (req, res, next) => {
    try {
      const { code } = req.body;
      const user = req.user;
  
      if (user.status === 'verified') {
        return res.status(200).json({
          ok: true,
          message: 'El usuario ya está verificado'
        });
      }
  
      if (user.verificationAttempts <= 0) {
        return next(AppError.tooManyRequests('Se han agotado los intentos de verificación'));
      }
  
      if (user.verificationCode !== code) {
        user.verificationAttempts -= 1;
        await user.save();
  
        if (user.verificationAttempts <= 0) {
          return next(AppError.tooManyRequests('Se han agotado los intentos de verificación'));
        }
  
        return next(
          AppError.badRequest(
            `Código incorrecto. Intentos restantes: ${user.verificationAttempts}`
          )
        );
      }
  
      user.status = 'verified';
      user.verificationCode = null;
      await user.save();
  
      res.status(200).json({
        ok: true,
        message: 'Email validado correctamente'
      });
    } catch (error) {
      next(error);
    }
  };

  export const loginUser = async (req, res, next) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email }).select('+password +refreshToken');
  
      if (!user) {
        return next(AppError.unauthorized('Credenciales incorrectas'));
      }
  
      const isValidPassword = await bcrypt.compare(password, user.password);
  
      if (!isValidPassword) {
        return next(AppError.unauthorized('Credenciales incorrectas'));
      }
  
      const refreshToken = generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save();
  
      const accessToken = generateAccessToken(user);
  
      res.status(200).json({
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

  export const updatePersonalData = async (req, res, next) => {
    try {
      const { name, lastName, nif } = req.body;
  
      req.user.name = name;
      req.user.lastName = lastName;
      req.user.nif = nif;
  
      await req.user.save();
  
      res.status(200).json({
        ok: true,
        data: {
          user: {
            email: req.user.email,
            name: req.user.name,
            lastName: req.user.lastName,
            nif: req.user.nif,
            fullName: req.user.fullName,
            status: req.user.status,
            role: req.user.role
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };