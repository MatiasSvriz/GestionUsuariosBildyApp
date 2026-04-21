// src/routes/client.routes.js
import { Router } from 'express';
import {
  createClient,
  updateClient,
  getClients,
  getArchivedClients,
  getClientById,
  deleteClient,
  restoreClient
} from '../controllers/client.controller.js';

import authMiddleware from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.js';

import {
  createClientValidator,
  updateClientValidator,
  getClientByIdValidator,
  deleteClientValidator,
  restoreClientValidator,
  listClientsValidator,
  listArchivedClientsValidator
} from '../validators/client.validator.js';

const router = Router();

// Crear cliente
router.post(
  '/',
  authMiddleware,
  validate(createClientValidator),
  createClient
);

// Listar clientes archivados
router.get(
  '/archived',
  authMiddleware,
  validate(listArchivedClientsValidator),
  getArchivedClients
);

// Listar clientes
router.get(
  '/',
  authMiddleware,
  validate(listClientsValidator),
  getClients
);

// Obtener un cliente por id
router.get(
  '/:id',
  authMiddleware,
  validate(getClientByIdValidator),
  getClientById
);

// Actualizar cliente
router.put(
  '/:id',
  authMiddleware,
  validate(updateClientValidator),
  updateClient
);

// Eliminar cliente (soft o hard)
router.delete(
  '/:id',
  authMiddleware,
  validate(deleteClientValidator),
  deleteClient
);

// Restaurar cliente archivado
router.patch(
  '/:id/restore',
  authMiddleware,
  validate(restoreClientValidator),
  restoreClient
);

export default router;