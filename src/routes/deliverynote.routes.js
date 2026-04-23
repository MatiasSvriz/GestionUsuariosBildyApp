// src/routes/deliverynote.routes.js
import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.js';
import { uploadSignature } from '../middleware/upload.js';

import {
  createDeliveryNote,
  getDeliveryNotes,
  getDeliveryNoteById,
  deleteDeliveryNote,
  signDeliveryNote,
  getDeliveryNotePdf
} from '../controllers/deliverynote.controller.js';

import {
  createDeliveryNoteValidator,
  listDeliveryNotesValidator,
  getDeliveryNoteByIdValidator,
  deleteDeliveryNoteValidator,
  signDeliveryNoteValidator,
  getDeliveryNotePdfValidator
} from '../validators/deliverynote.validator.js';

const router = Router();

router.post(
  '/',
  authMiddleware,
  validate(createDeliveryNoteValidator),
  createDeliveryNote
);

router.get(
  '/',
  authMiddleware,
  validate(listDeliveryNotesValidator),
  getDeliveryNotes
);

router.get(
  '/pdf/:id',
  authMiddleware,
  validate(getDeliveryNotePdfValidator),
  getDeliveryNotePdf
);

router.get(
  '/:id',
  authMiddleware,
  validate(getDeliveryNoteByIdValidator),
  getDeliveryNoteById
);

router.patch(
  '/:id/sign',
  authMiddleware,
  uploadSignature,
  validate(signDeliveryNoteValidator),
  signDeliveryNote
);

router.delete(
  '/:id',
  authMiddleware,
  validate(deleteDeliveryNoteValidator),
  deleteDeliveryNote
);

export default router;