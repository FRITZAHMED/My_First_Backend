import { Router } from 'express';
import { authenticate } from '../Middleware/auth.middleware.js';
import { authLimiter } from '../Middleware/rateLimit.middleware.js';
import validate from '../Middleware/validate.middleware.js';
import AuthController from '../controllers/auth.controller.js';
import {changePasswordSchema,loginSchema,refreshSchema,registerSchema} from '../Validators/auth.validator.js';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Creer un compte
 *     description: Sans jeton, seuls les roles Employer et Logistician sont acceptes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [professionalEmail, password]
 *             properties:
 *               professionalEmail: { type: string, format: email }
 *               password: { type: string, format: password, minLength: 8 }
 *               role: { type: string, enum: [Employer, Logistician] }
 *     responses:
 *       201: { description: Compte cree }
 *       409: { description: Email deja utilise }
 *       400: { description: Validation echouee }
 */
router.post('/register', validate(registerSchema), AuthController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Se connecter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [professionalEmail, password]
 *             properties:
 *               professionalEmail: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Jetons accessToken et refreshToken
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 *       401: { description: Identifiants invalides }
 *       429: { description: Trop de tentatives }
 */
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rafraichir le access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Nouveaux jetons
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 *       401: { description: Refresh token invalide ou expire }
 *       429: { description: Trop de tentatives }
 */
router.post('/refresh', authLimiter, validate(refreshSchema), AuthController.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Deconnexion 
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Deconnexion effectuee }
 *       401: { description: Non authentifie }
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Recuperer l'utilisateur connecter
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Utilisateur courant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idUser: { type: integer }
 *                 email: { type: string, format: email }
 *                 role: { type: string, enum: [Administrator, Director, Manager, Logistician, Employer] }
 *       401: { description: Non authentifie }
 */
router.get('/me', authenticate, AuthController.me);

/**
 * @openapi
 * /auth/password:
 *   put:
 *     tags: [Auth]
 *     summary: Changer le mot de passe
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
 *               currentPassword: { type: string }
 *               newPassword: { type: string, format: password, minLength: 8 }
 *     responses:
 *       200: { description: Mot de passe modifie, reconnectez-vous }
 *       401: { description: Mot de passe actuel incorrect }
 *       400: { description: Validation echouee }
 */
router.put('/password', authenticate, validate(changePasswordSchema), AuthController.changePassword);

export default router;