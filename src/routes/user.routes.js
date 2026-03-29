import { Router } from 'express';
import { registerUser } from '../controllers/user.controller.js';
import { validate } from '../middleware/validate.js';
import { registerUserValidator } from '../validators/user.validator.js';

const router = Router();

router.post('/register', (req, res, next) => {
  next();
}, validate(registerUserValidator), registerUser);

export default router;