import { Router } from 'express';
import userController from '../controllers/user_controller.js';

const userRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des utilisateurs
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Créer un utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       409:
 *         description: Cette adresse email est déjà utilisée
 */
userRouter.post('/users', userController.register.bind(userController));

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identifiant de l'utilisateur
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       404:
 *         description: Utilisateur introuvable
 */
userRouter.get('/users/:id', userController.getUser.bind(userController));

export default userRouter;
