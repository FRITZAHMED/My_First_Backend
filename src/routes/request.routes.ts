import { Router } from 'express';
import { authenticate, requireRole } from '../Middleware/auth.middleware.js';
import validate from '../Middleware/validate.middleware.js';
import RequestController from '../controllers/request.controller.js';
import { idRequestParams } from '../Validators/common.js';
import { createRequestSchema, listRequestSchema, updateRequestSchema } from '../Validators/request.validator.js';

const router = Router();
const MANAGER = ['Administrator', 'Director', 'Manager'] as const;

/**
 * @openapi
 * /requests:
 *   get:
 *     tags: [Requests]
 *     summary: Lister les demandes
 *     description: Un utilisateur simple ne voit que ses propres demandes ; les roles de pilotage voient tout.
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20, maximum: 100 } }
 *     responses:
 *       200: { description: Liste paginee }
 *   post:
 *     tags: [Requests]
 *     summary: Creer une demande
 *     responses:
 *       201: { description: Demande creee }
 */
router.get('/', authenticate, validate(listRequestSchema), RequestController.getAll);
router.post('/', authenticate, validate(createRequestSchema), RequestController.create);

router.get('/:idRequest', authenticate, validate(idRequestParams), RequestController.getById);
router.patch('/:idRequest', authenticate, validate(idRequestParams), validate(updateRequestSchema), RequestController.update);
router.delete('/:idRequest', authenticate, requireRole(...MANAGER), validate(idRequestParams), RequestController.delete);

export default router;
