import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { config } from '../config/index.js';
import Company from '../models/Company.js';

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

const getRefreshTokenExpirationDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
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
    const refreshTokenExpiresAt = getRefreshTokenExpirationDate();

    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'admin',
      status: 'pending',
      verificationCode,
      verificationAttempts: 3,
      refreshToken,
      refreshTokenExpiresAt
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
      const refreshTokenExpiresAt = getRefreshTokenExpirationDate();

      user.refreshToken = refreshToken;
      user.refreshTokenExpiresAt = refreshTokenExpiresAt;
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

  export const updateCompanyData = async (req, res, next) => {
    try {
      const { name, cif, address, isFreelance } = req.body;
      const user = req.user;
  
      let companyName = name;
      let companyCif = cif;
      let companyAddress = address;
  
      if (isFreelance) {
        companyName = user.fullName;
        companyCif = user.nif;
        companyAddress = user.address;
      }
  
      if (!companyCif) {
        return next(AppError.badRequest('El CIF es obligatorio'));
      }
  
      const existingCompany = await Company.findOne({ cif: companyCif });
  
      if (!existingCompany) {
        const newCompany = await Company.create({
          owner: user._id,
          name: companyName,
          cif: companyCif,
          address: companyAddress,
          isFreelance
        });
  
        user.company = newCompany._id;
        user.role = 'admin';
        await user.save();
  
        return res.status(200).json({
          ok: true,
          data: {
            company: newCompany,
            user: {
              email: user.email,
              role: user.role,
              company: user.company
            }
          }
        });
      }
  
      user.company = existingCompany._id;
      user.role = 'guest';
      await user.save();
  
      res.status(200).json({
        ok: true,
        data: {
          company: existingCompany,
          user: {
            email: user.email,
            role: user.role,
            company: user.company
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  export const uploadCompanyLogo = async (req, res, next) => {
    try {
      const user = req.user;
  
      if (!user.company) {
        return next(AppError.badRequest('El usuario no tiene una compañía asociada'));
      }
  
      if (!req.file) {
        return next(AppError.badRequest('Debes subir una imagen'));
      }
  
      const company = await Company.findById(user.company);
  
      if (!company) {
        return next(AppError.notFound('Compañía no encontrada'));
      }
  
      company.logo = `/uploads/${req.file.filename}`;
      await company.save();
  
      res.status(200).json({
        ok: true,
        data: {
          logo: company.logo
        }
      });
    } catch (error) {
      next(error);
    }
  };

  export const getUser = async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).populate('company');
  
      if (!user) {
        return next(AppError.notFound('Usuario no encontrado'));
      }
  
      res.status(200).json({
        ok: true,
        data: {
          user
        }
      });
    } catch (error) {
      next(error);
    }
  };

  export const refreshAccessToken = async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
  
      const user = await User.findOne({ refreshToken }).select('+refreshToken +refreshTokenExpiresAt');
  
      if (!user) {
        return next(AppError.unauthorized('Refresh token inválido o expirado'));
      }
  
      if (!user.refreshTokenExpiresAt || user.refreshTokenExpiresAt < new Date()) {
        return next(AppError.unauthorized('Refresh token inválido o expirado'));
      }
  
      const accessToken = generateAccessToken(user);
  
      res.status(200).json({
        ok: true,
        data: {
          accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  };

  export const logoutUser = async (req, res, next) => {
    try {
      req.user.refreshToken = null;
      req.user.refreshTokenExpiresAt = null;
  
      await req.user.save();
  
      res.status(200).json({
        ok: true,
        message: 'Sesión cerrada correctamente'
      });
    } catch (error) {
      next(error);
    }
  };

  export const deleteUser = async (req, res, next) => {
    try {
      const user = req.user;
      const isSoftDelete = req.query.soft === 'true';
  
      if (isSoftDelete) {
        user.deleted = true;
        user.deletedAt = new Date();
        user.refreshToken = null;
        user.refreshTokenExpiresAt = null;
  
        await user.save();
  
        return res.status(200).json({
          ok: true,
          message: 'Usuario eliminado lógicamente'
        });
      }
  
      await User.findByIdAndDelete(user._id);
  
      res.status(200).json({
        ok: true,
        message: 'Usuario eliminado permanentemente'
      });
    } catch (error) {
      next(error);
    }
  };

  export const changePassword = async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
  
      const user = await User.findById(req.user._id).select('+password');
  
      if (!user) {
        return next(AppError.notFound('Usuario no encontrado'));
      }
  
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
  
      if (!isValidPassword) {
        return next(AppError.unauthorized('La contraseña actual no es correcta'));
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({
        ok: true,
        message: 'Contraseña actualizada correctamente'
      });
    } catch (error) {
      next(error);
    }
  };