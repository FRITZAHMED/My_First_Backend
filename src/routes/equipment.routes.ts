import { Router } from 'express';
import { authenticate, requireRole } from '../Middleware/auth.middleware.js';
import validate from '../Middleware/validate.middleware.js';
import EquipmentController from '../controllers/equipment.controller.js';
import { idParams } from '../Validators/common.js';
import {
	createEquipmentSchema,
	listEquipmentSchema,
	updateEquipmentSchema,
} from '../Validators/equipment.validator.js';

const router = Router();
const MANAGER = ['Administrator', 'Director', 'Manager'] as const;

/**
 * @openapi
 * /equipment:
 *   get:
 *     tags: [Equipment]
 *     summary: Lister le parc informatique (pagine)
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20, maximum: 100 } }
 *       - { in: query, name: status, schema: { type: string, enum: [AVAILABLE, ASSIGNED, MAINTENANCE, RETIRED] } }
 *     responses:
 *       200: { description: Liste paginee }
 */
router.get('/', authenticate, validate(listEquipmentSchema), EquipmentController.getAll);

/**
 * @openapi
 * /equipment:
 *   post:
 *     tags: [Equipment]
 *     summary: Enregistrer un equipement
 *     responses:
 *       201: { description: Equipement cree }
 */
router.post(
	'/',
	authenticate,
	requireRole(...MANAGER),
	validate(createEquipmentSchema),
	EquipmentController.create,
);

router.get('/:id', authenticate, validate(idParams), EquipmentController.getById);
router.patch(
	'/:id',
	authenticate,
	requireRole(...MANAGER),
	validate(idParams),
	validate(updateEquipmentSchema),
	EquipmentController.update,
);
router.delete('/:id', authenticate, requireRole(...MANAGER), validate(idParams), EquipmentController.delete);

export default router;
