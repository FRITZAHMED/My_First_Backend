import { Router } from 'express';
import { authenticate, requireRole } from '../Middleware/auth.middleware.js';
import validate from '../Middleware/validate.middleware.js';
import LogisticServiceController from '../controllers/logisticService.controller.js';
import { idLogisticServiceParams } from '../Validators/common.js';
import { createAssignmentSchema, listAssignmentSchema } from '../Validators/logisticService.validator.js';

const router = Router();
const MANAGER = ['Administrator', 'Director', 'Manager'] as const;

/**
 * @openapi
 * /logistic-services:
 *   get:
 *     tags: [LogisticService]
 *     summary: Lister les affectations de logisticiens (pagine)
 *     responses:
 *       200: { description: Liste paginee }
 *   post:
 *     tags: [LogisticService]
 *     summary: Affecter un logisticien a une demande
 *     responses:
 *       201: { description: Affectation creee }
 *       409: { description: Deja affecte }
 */
router.get('/', authenticate, validate(listAssignmentSchema), LogisticServiceController.getAll);
router.post(
	'/',
	authenticate,
	requireRole(...MANAGER),
	validate(createAssignmentSchema),
	LogisticServiceController.create,
);

router.get(
	'/:idLogisticService',
	authenticate,
	validate(idLogisticServiceParams),
	LogisticServiceController.getById,
);
router.delete(
	'/:idLogisticService',
	authenticate,
	requireRole(...MANAGER),
	validate(idLogisticServiceParams),
	LogisticServiceController.delete,
);

export default router;
