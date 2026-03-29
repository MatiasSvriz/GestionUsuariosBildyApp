import { Router } from 'express';
import {
  registerUser,
  validateEmailCode,
  loginUser,
  updatePersonalData
} from '../controllers/user.controller.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  registerUserValidator,
  validateEmailCodeValidator,
  loginUserValidator,
  updatePersonalDataValidator
} from '../validators/user.validator.js';

const router = Router();

router.post('/register', validate(registerUserValidator), registerUser);
router.put('/validation', authMiddleware, validate(validateEmailCodeValidator), validateEmailCode);
router.post('/login', validate(loginUserValidator), loginUser);
router.put('/register', authMiddleware, validate(updatePersonalDataValidator), updatePersonalData);

export default router;