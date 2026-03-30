import { Router } from 'express';
import {
  registerUser,
  validateEmailCode,
  loginUser,
  updatePersonalData,
  updateCompanyData,
  uploadCompanyLogo,
  getUser
} from '../controllers/user.controller.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { uploadLogo } from '../middleware/upload.js';
import {
  registerUserValidator,
  validateEmailCodeValidator,
  loginUserValidator,
  updatePersonalDataValidator,
  updateCompanyValidator
} from '../validators/user.validator.js';

const router = Router();

router.post('/register', validate(registerUserValidator), registerUser);
router.put('/validation', authMiddleware, validate(validateEmailCodeValidator), validateEmailCode);
router.post('/login', validate(loginUserValidator), loginUser);
router.put('/register', authMiddleware, validate(updatePersonalDataValidator), updatePersonalData);
router.patch('/company', authMiddleware, validate(updateCompanyValidator), updateCompanyData);
router.patch('/logo', authMiddleware, uploadLogo.single('logo'), uploadCompanyLogo);
router.get('/', authMiddleware, getUser);

export default router;