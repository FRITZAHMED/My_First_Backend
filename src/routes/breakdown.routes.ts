import { Router } from 'express';
import { authenticate, requireRole } from '../Middleware/auth.middleware.js';
import validate from '../Middleware/validate.middleware.js';
import BreakdownController from '../controllers/breakdown.controller.js';
import { idParams } from '../Validators/common.js';
import {createBreakdownSchema,listBreakdownSchema,updateBreakdownSchema} from '../Validators/breakdown.validator.js';

const router = Router();
const LOGISTIC = ['Administrator', 'Director', 'Manager', 'Logistician'] as const;
const MANAGER = ['Administrator', 'Director', 'Manager'] as const;

/**
 * @openapi
 * /breakdowns:
 *   get:
 *     tags: [Breakdowns]
 *     summary: Lister les pannes (pagine)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20, maximum: 100 } }
 *       - { in: query, name: status, schema: { type: string, enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED] } }
 *     responses:
 *       200: { description: Liste paginee }
 *       401: { description: Non authentifie }
 */
router.get('/', authenticate, validate(listBreakdownSchema), BreakdownController.getAll);

/**
 * @openapi
 * /breakdowns/{id}:
 *   get:
 *     tags: [Breakdowns]
 *     summary: Recuperer une panne par son id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Panne }
 *       404: { description: Introuvable }
 *       401: { description: Non authentifie }
 */
router.get('/:id', authenticate, validate(idParams), BreakdownController.getById);

/**
 * @openapi
 * /breakdowns:
 *   post:
 *     tags: [Breakdowns]
 *     summary: Declarer une panne
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [equipmentId, description, severity]
 *             properties:
 *               equipmentId: { type: integer }
 *               description: { type: string }
 *               severity: { type: string, enum: [Low, Medium, High, Critical] }
 *     responses:
 *       201: { description: Panne declaree }
 *       401: { description: Non authentifie }
 *       400: { description: Validation echouee }
 */
router.post('/', authenticate, validate(createBreakdownSchema), BreakdownController.create);

/**
 * @openapi
 * /breakdowns/{id}:
 *   patch:
 *     tags: [Breakdowns]
 *     summary: Modifier une panne 
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
 *               status: { type: string, enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED] }
 *               description: { type: string }
 *     responses:
 *       200: { description: Panne modifiee }
 *       404: { description: Introuvable }
 *       401: { description: Non authentifie }
 *       403: { description: Acces refuse }
 */
router.patch('/:id',authenticate,requireRole(...LOGISTIC),validate(idParams),validate(updateBreakdownSchema),BreakdownController.update);

/**
 * @openapi
 * /breakdowns/{id}:
 *   delete:
 *     tags: [Breakdowns]
 *     summary: Supprimer une panne
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Panne supprimee }
 *       404: { description: Introuvable }
 *       401: { description: Non authentifie }
 *       403: { description: Acces refuse }
 */
router.delete('/:id', authenticate, requireRole(...MANAGER), validate(idParams), BreakdownController.delete);

export default router;