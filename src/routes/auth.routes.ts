import { Router } from 'express';
import { authenticate } from '../Middleware/auth.middleware.js';
import { authLimiter } from '../Middleware/rateLimit.middleware.js';
import validate from '../Middleware/validate.middleware.js';
import AuthController from '../controllers/auth.controller.js';
import {
	changePasswordSchema,
	loginSchema,
	refreshSchema,
	registerSchema,
} from '../Validators/auth.validator.js';

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
 */
router.post('/register', validate(registerSchema), AuthController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Se connecter et obtenir les jetons
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
 *       200: { description: Jetons accessToken et refreshToken }
 *       401: { description: Identifiants invalides }
 *       429: { description: Trop de tentatives }
 */
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);

router.post('/refresh', authLimiter, validate(refreshSchema), AuthController.refresh);

router.post('/logout', authenticate, AuthController.logout);

router.get('/me', authenticate, AuthController.me);

router.put('/password', authenticate, validate(changePasswordSchema), AuthController.changePassword);

export default router;
