// src/routes/project.routes.js
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

// Crear proyecto
router.post(
  '/',
  authMiddleware,
  validate(createProjectValidator),
  createProject
);

// Listar proyectos archivados
router.get(
  '/archived',
  authMiddleware,
  validate(listArchivedProjectsValidator),
  getArchivedProjects
);

// Listar proyectos
router.get(
  '/',
  authMiddleware,
  validate(listProjectsValidator),
  getProjects
);

// Obtener proyecto por id
router.get(
  '/:id',
  authMiddleware,
  validate(getProjectByIdValidator),
  getProjectById
);

// Actualizar proyecto
router.put(
  '/:id',
  authMiddleware,
  validate(updateProjectValidator),
  updateProject
);

// Eliminar proyecto (soft/hard)
router.delete(
  '/:id',
  authMiddleware,
  validate(deleteProjectValidator),
  deleteProject
);

// Restaurar proyecto
router.patch(
  '/:id/restore',
  authMiddleware,
  validate(restoreProjectValidator),
  restoreProject
);

export default router;