import { Router } from 'express';

import {
  createProject,
  updateProject,
  getProjects,
  getArchivedProjects,
  getProjectById,
  deleteProject,
  restoreProject
} from '../controllers/project.controller.js';

import authMiddleware from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.js';

import {
  createProjectValidator,
  updateProjectValidator,
  getProjectByIdValidator,
  deleteProjectValidator,
  restoreProjectValidator,
  listProjectsValidator,
  listArchivedProjectsValidator
} from '../validators/project.validator.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Gestión de proyectos
 */

/**
 * @swagger
 * /api/project:
 *   post:
 *     summary: Crear un proyecto
 *     tags: [Projects]
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
 *               - name
 *               - projectCode
 *             properties:
 *               client:
 *                 type: string
 *                 example: 6808f1d9c3a4f7a123456781
 *               name:
 *                 type: string
 *                 example: Reforma vivienda
 *               projectCode:
 *                 type: string
 *                 example: PR-001
 *               email:
 *                 type: string
 *                 example: obra@demo.com
 *               notes:
 *                 type: string
 *                 example: Proyecto importante
 *               address:
 *                 $ref: '#/components/schemas/Address'
 *     responses:
 *       201:
 *         description: Proyecto creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Cliente no encontrado
 */
router.post(
  '/',
  authMiddleware,
  validate(createProjectValidator),
  createProject
);

/**
 * @swagger
 * /api/project/archived:
 *   get:
 *     summary: Listar proyectos archivados
 *     tags: [Projects]
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
 *         name: name
 *         schema:
 *           type: string
 *         example: Reforma
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         example: -createdAt
 *     responses:
 *       200:
 *         description: Lista de proyectos archivados
 */
router.get(
  '/archived',
  authMiddleware,
  validate(listArchivedProjectsValidator),
  getArchivedProjects
);

/**
 * @swagger
 * /api/project:
 *   get:
 *     summary: Listar proyectos
 *     tags: [Projects]
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
 *         name: name
 *         schema:
 *           type: string
 *         example: Proyecto
 *       - in: query
 *         name: client
 *         schema:
 *           type: string
 *         example: 6808f1d9c3a4f7a123456781
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         example: -createdAt
 *     responses:
 *       200:
 *         description: Lista de proyectos
 */
router.get(
  '/',
  authMiddleware,
  validate(listProjectsValidator),
  getProjects
);

/**
 * @swagger
 * /api/project/{id}:
 *   get:
 *     summary: Obtener un proyecto por ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6808f1d9c3a4f7a123456782
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Proyecto no encontrado
 */
router.get(
  '/:id',
  authMiddleware,
  validate(getProjectByIdValidator),
  getProjectById
);

/**
 * @swagger
 * /api/project/{id}:
 *   put:
 *     summary: Actualizar un proyecto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               projectCode:
 *                 type: string
 *               email:
 *                 type: string
 *               notes:
 *                 type: string
 *               address:
 *                 $ref: '#/components/schemas/Address'
 *     responses:
 *       200:
 *         description: Proyecto actualizado correctamente
 *       404:
 *         description: Proyecto no encontrado
 */
router.put(
  '/:id',
  authMiddleware,
  validate(updateProjectValidator),
  updateProject
);

/**
 * @swagger
 * /api/project/{id}:
 *   delete:
 *     summary: Eliminar proyecto (soft o hard)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *       - in: query
 *         name: soft
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         example: true
 *     responses:
 *       200:
 *         description: Proyecto eliminado correctamente
 *       404:
 *         description: Proyecto no encontrado
 */
router.delete(
  '/:id',
  authMiddleware,
  validate(deleteProjectValidator),
  deleteProject
);

/**
 * @swagger
 * /api/project/{id}/restore:
 *   patch:
 *     summary: Restaurar proyecto archivado
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Proyecto restaurado correctamente
 *       404:
 *         description: Proyecto no encontrado
 */
router.patch(
  '/:id/restore',
  authMiddleware,
  validate(restoreProjectValidator),
  restoreProject
);

export default router;