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
import validate from '../middleware/validate.js';
import authMiddleware from '../middleware/auth.middleware.js';
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

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Registro, autenticación y gestión de usuario
 */

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Registrar un usuario
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       409:
 *         description: Ya existe un usuario con ese email
 */
router.post('/register', validate(registerUserValidator), registerUser);

/**
 * @swagger
 * /api/user/validation:
 *   put:
 *     summary: Validar email mediante código
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email validado correctamente
 *       400:
 *         description: Código incorrecto
 *       429:
 *         description: Intentos agotados
 */
router.put('/validation', authMiddleware, validate(validateEmailCodeValidator), validateEmailCode);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login correcto, devuelve accessToken y refreshToken
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', validate(loginUserValidator), loginUser);

/**
 * @swagger
 * /api/user/register:
 *   put:
 *     summary: Actualizar datos personales del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, lastName, nif]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Matías
 *               lastName:
 *                 type: string
 *                 example: Svriz
 *               nif:
 *                 type: string
 *                 example: 12345678A
 *               address:
 *                 $ref: '#/components/schemas/Address'
 *     responses:
 *       200:
 *         description: Datos personales actualizados correctamente
 *       401:
 *         description: No autorizado
 */
router.put('/register', authMiddleware, validate(updatePersonalDataValidator), updatePersonalData);

/**
 * @swagger
 * /api/user/company:
 *   patch:
 *     summary: Crear o asociar compañía al usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cif]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Empresa Demo
 *               cif:
 *                 type: string
 *                 example: B12345678
 *               isFreelance:
 *                 type: boolean
 *                 example: false
 *               address:
 *                 $ref: '#/components/schemas/Address'
 *     responses:
 *       200:
 *         description: Compañía creada o asociada correctamente
 *       400:
 *         description: El CIF es obligatorio
 */
router.patch('/company', authMiddleware, validate(updateCompanyValidator), updateCompanyData);

/**
 * @swagger
 * /api/user/logo:
 *   patch:
 *     summary: Subir logo de la compañía
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [logo]
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo actualizado correctamente
 *       400:
 *         description: Usuario sin compañía o archivo no enviado
 */
router.patch('/logo', authMiddleware, uploadLogo, uploadCompanyLogo);

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Obtener usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario autenticado
 *       401:
 *         description: No autorizado
 */
router.get('/', authMiddleware, getUser);

/**
 * @swagger
 * /api/user/refresh:
 *   post:
 *     summary: Refrescar access token
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "refresh_token_demo"
 *     responses:
 *       200:
 *         description: Nuevo accessToken generado
 *       401:
 *         description: Refresh token inválido o expirado
 */
router.post('/refresh', validate(refreshTokenValidator), refreshAccessToken);

/**
 * @swagger
 * /api/user/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 */
router.post('/logout', authMiddleware, logoutUser);

/**
 * @swagger
 * /api/user:
 *   delete:
 *     summary: Eliminar usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: soft
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         example: true
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 */
router.delete('/', authMiddleware, deleteUser);

/**
 * @swagger
 * /api/user/password:
 *   put:
 *     summary: Cambiar contraseña
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "12345678"
 *               newPassword:
 *                 type: string
 *                 example: "87654321"
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       401:
 *         description: Contraseña actual incorrecta
 */
router.put('/password', authMiddleware, validate(changePasswordValidator), changePassword);

/**
 * @swagger
 * /api/user/invite:
 *   post:
 *     summary: Invitar usuario guest a la compañía
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: invitado@demo.com
 *               password:
 *                 type: string
 *                 example: "12345678"
 *               name:
 *                 type: string
 *                 example: Juan
 *               lastName:
 *                 type: string
 *                 example: Pérez
 *               nif:
 *                 type: string
 *                 example: 87654321B
 *     responses:
 *       201:
 *         description: Usuario invitado correctamente
 *       403:
 *         description: Solo administradores
 *       409:
 *         description: Ya existe un usuario con ese email
 */
router.post('/invite', authMiddleware, requireRole('admin'), validate(inviteUserValidator), inviteUser);

export default router;