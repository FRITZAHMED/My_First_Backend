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
 *   get:
 *     tags: [Users]
 *     summary: Lister les utilisateurs (pagine)
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20, maximum: 100 } }
 *       - { in: query, name: role, schema: { type: string } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200: { description: Liste paginee }
 *   post:
 *     tags: [Users]
 *     summary: Creer un utilisateur avec n'importe quel role
 *     responses:
 *       201: { description: Utilisateur cree }
 *       409: { description: Email deja utilise }
 */
router.get('/', authenticate, requireRole(...ADMIN), validate(listUsersSchema), UserController.getAll);
router.post('/', authenticate, requireRole(...ADMIN), validate(createUserSchema), UserController.create);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Recuperer un utilisateur par son id
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Utilisateur }
 *       404: { description: Introuvable }
 */
router.get('/:id', authenticate, validate(idParams), UserController.getById);
router.patch(
	'/:id',
	authenticate,
	requireRole(...ADMIN),
	validate(idParams),
	validate(updateUserSchema),
	UserController.update,
);
router.delete('/:id', authenticate, requireRole('Administrator'), validate(idParams), UserController.delete);

export default router;
