import { Router } from 'express';
import { authenticate, requireRole } from '../Middleware/auth.middleware.js';
import validate from '../Middleware/validate.middleware.js';
import BreakdownController from '../controllers/breakdown.controller.js';
import { idParams } from '../Validators/common.js';
import {
	createBreakdownSchema,
	listBreakdownSchema,
	updateBreakdownSchema,
} from '../Validators/breakdown.validator.js';

const router = Router();
const LOGISTIC = ['Administrator', 'Director', 'Manager', 'Logistician'] as const;
const MANAGER = ['Administrator', 'Director', 'Manager'] as const;

/**
 * @openapi
 * /breakdowns:
 *   get:
 *     tags: [Breakdowns]
 *     summary: Lister les pannes (pagine)
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20, maximum: 100 } }
 *       - { in: query, name: status, schema: { type: string, enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED] } }
 *     responses:
 *       200: { description: Liste paginee }
 *   post:
 *     tags: [Breakdowns]
 *     summary: Declarer une panne
 *     responses:
 *       201: { description: Panne declaree }
 */
router.get('/', authenticate, validate(listBreakdownSchema), BreakdownController.getAll);
router.post('/', authenticate, validate(createBreakdownSchema), BreakdownController.create);

router.get('/:id', authenticate, validate(idParams), BreakdownController.getById);
router.patch(
	'/:id',
	authenticate,
	requireRole(...LOGISTIC),
	validate(idParams),
	validate(updateBreakdownSchema),
	BreakdownController.update,
);
router.delete('/:id', authenticate, requireRole(...MANAGER), validate(idParams), BreakdownController.delete);

export default router;
