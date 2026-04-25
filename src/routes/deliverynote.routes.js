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

/**
 * @swagger
 * tags:
 *   name: DeliveryNotes
 *   description: Gestión de albaranes
 */

/**
 * @swagger
 * /api/deliverynote:
 *   post:
 *     summary: Crear un albarán
 *     tags: [DeliveryNotes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - client
 *               - project
 *               - format
 *               - workDate
 *             properties:
 *               client:
 *                 type: string
 *                 example: 6808f1d9c3a4f7a123456781
 *               project:
 *                 type: string
 *                 example: 6808f1d9c3a4f7a123456782
 *               format:
 *                 type: string
 *                 enum: [material, hours]
 *                 example: material
 *               description:
 *                 type: string
 *                 example: Entrega de materiales
 *               workDate:
 *                 type: string
 *                 format: date-time
 *               material:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *               hours:
 *                 type: number
 *               workers:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Worker'
 *     responses:
 *       201:
 *         description: Albarán creado correctamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Cliente o proyecto no encontrado
 */
router.post(
  '/',
  authMiddleware,
  validate(createDeliveryNoteValidator),
  createDeliveryNote
);

/**
 * @swagger
 * /api/deliverynote:
 *   get:
 *     summary: Listar albaranes con filtros y paginación
 *     tags: [DeliveryNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *       - in: query
 *         name: client
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [material, hours]
 *       - in: query
 *         name: signed
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         example: -workDate
 *     responses:
 *       200:
 *         description: Lista de albaranes
 */
router.get(
  '/',
  authMiddleware,
  validate(listDeliveryNotesValidator),
  getDeliveryNotes
);

/**
 * @swagger
 * /api/deliverynote/pdf/{id}:
 *   get:
 *     summary: Descargar o generar PDF de un albarán
 *     tags: [DeliveryNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: PDF generado o URL del PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Albarán no encontrado
 */
router.get(
  '/pdf/:id',
  authMiddleware,
  validate(getDeliveryNotePdfValidator),
  getDeliveryNotePdf
);

/**
 * @swagger
 * /api/deliverynote/{id}:
 *   get:
 *     summary: Obtener un albarán por ID
 *     tags: [DeliveryNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Albarán encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryNote'
 *       404:
 *         description: Albarán no encontrado
 */
router.get(
  '/:id',
  authMiddleware,
  validate(getDeliveryNoteByIdValidator),
  getDeliveryNoteById
);

/**
 * @swagger
 * /api/deliverynote/{id}/sign:
 *   patch:
 *     summary: Firmar un albarán
 *     tags: [DeliveryNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Albarán firmado correctamente
 *       400:
 *         description: Error (ya firmado o sin archivo)
 */
router.patch(
  '/:id/sign',
  authMiddleware,
  uploadSignature,
  validate(signDeliveryNoteValidator),
  signDeliveryNote
);

/**
 * @swagger
 * /api/deliverynote/{id}:
 *   delete:
 *     summary: Eliminar un albarán (solo si no está firmado)
 *     tags: [DeliveryNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Albarán eliminado
 *       400:
 *         description: No se puede eliminar si está firmado
 *       404:
 *         description: Albarán no encontrado
 */
router.delete(
  '/:id',
  authMiddleware,
  validate(deleteDeliveryNoteValidator),
  deleteDeliveryNote
);

export default router;