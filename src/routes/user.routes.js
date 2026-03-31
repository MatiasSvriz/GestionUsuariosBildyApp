import { Router } from 'express';
import {
  registerUser,
  validateEmailCode,
  loginUser,
  updatePersonalData,
  updateCompanyData,
  uploadCompanyLogo,
  getUser,
  refreshAccessToken,
  logoutUser,
  deleteUser,
  changePassword,
  inviteUser
} from '../controllers/user.controller.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { uploadLogo } from '../middleware/upload.js';
import {
  registerUserValidator,
  validateEmailCodeValidator,
  loginUserValidator,
  updatePersonalDataValidator,
  updateCompanyValidator,
  refreshTokenValidator,
  changePasswordValidator,
  inviteUserValidator
} from '../validators/user.validator.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.post('/register', validate(registerUserValidator), registerUser);
router.put('/validation', authMiddleware, validate(validateEmailCodeValidator), validateEmailCode);
router.post('/login', validate(loginUserValidator), loginUser);
router.put('/register', authMiddleware, validate(updatePersonalDataValidator), updatePersonalData);
router.patch('/company', authMiddleware, validate(updateCompanyValidator), updateCompanyData);
router.patch('/logo', authMiddleware, uploadLogo.single('logo'), uploadCompanyLogo);
router.get('/', authMiddleware, getUser);
router.post('/refresh', validate(refreshTokenValidator), refreshAccessToken);
router.post('/logout', authMiddleware, logoutUser);
router.delete('/', authMiddleware, deleteUser);
router.put('/password', authMiddleware, validate(changePasswordValidator), changePassword);
router.post('/invite', authMiddleware, requireRole('admin'), validate(inviteUserValidator), inviteUser);

export default router;