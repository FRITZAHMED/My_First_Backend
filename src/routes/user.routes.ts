import { Router } from 'express';
import { authenticate, requireRole } from '../Middleware/auth.middleware.js';
import validate from '../Middleware/validate.middleware.js';
import UserController from '../controllers/user.controller.js';
import { idParams } from '../Validators/common.js';
import { createUserSchema, listUsersSchema, updateUserSchema } from '../Validators/user.validator.js';

const router = Router();
const ADMIN = ['Administrator', 'Director'] as const;

/**
 * @openapi
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Creer un utilisateur avec n'importe quel role
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [professionalEmail, password, role]
 *             properties:
 *               professionalEmail: { type: string, format: email }
 *               password: { type: string, format: password, minLength: 8 }
 *               role: { type: string, enum: [Administrator, Director, Manager, Logistician, Employer] }
 *     responses:
 *       201: { description: Utilisateur cree }
 *       409: { description: Email deja utilise }
 *       401: { description: Non authentifier }
 *       403: { description: Acces refuse }
 */
router.post('/', authenticate, requireRole(...ADMIN), validate(createUserSchema), UserController.create);
/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Lister les utilisateurs (pagine)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20, maximum: 100 } }
 *       - { in: query, name: role, schema: { type: string } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200: { description: Liste paginee }
 *       401: { description: Non authentifie }
 *       403: { description: Acces refuse }
 */
router.get('/', authenticate, requireRole(...ADMIN), validate(listUsersSchema), UserController.getAll);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Recuperer un utilisateur par son id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Utilisateur }
 *       404: { description: Introuvable }
 *       401: { description: Non authentifie }
 *       403: { description: Acces refuse }
 */
router.get('/:id', authenticate, validate(idParams), UserController.getById);


/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Modifier un utilisateur
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               professionalEmail: { type: string, format: email }
 *               role: { type: string, enum: [Administrator, Director, Manager, Logistician, Employer] }
 *               isActive: { type: boolean }
 *     responses:
 *       200: { description: Utilisateur modifie }
 *       404: { description: Introuvable }
 *       401: { description: Non authentifie }
 *       403: { description: Acces refuse }
 */
router.patch('/:id', authenticate, requireRole(...ADMIN), validate(idParams), validate(updateUserSchema), UserController.update);

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Supprimer un utilisateur
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Utilisateur supprime }
 *       404: { description: Introuvable }
 *       401: { description: Non authentifie }
 *       403: { description: Acces refuse }
 */
router.delete('/:id', authenticate, requireRole('Administrator'), validate(idParams), UserController.delete);

export default router;