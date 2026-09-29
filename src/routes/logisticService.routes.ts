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
 *     summary: Lister les affectations des equipements
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20, maximum: 100 } }
 *     responses:
 *       200: { description: Liste paginee }
 *       401: { description: Non authentifie }
 */
router.get('/', authenticate, validate(listAssignmentSchema), LogisticServiceController.getAll);

/**
 * @openapi
 * /logistic-services/{idLogisticService}:
 *   get:
 *     tags: [LogisticService]
 *     summary: Recuperer une affectation par son id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: idLogisticService, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Affectation }
 *       404: { description: Introuvable }
 *       401: { description: Non authentifie }
 */
router.get('/:idLogisticService',authenticate,validate(idLogisticServiceParams),LogisticServiceController.getById);

/**
 * @openapi
 * /logistic-services:
 *   post:
 *     tags: [LogisticService]
 *     summary: Affecter un logisticien a une demande
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [requestId, logisticianId]
 *             properties:
 *               requestId: { type: integer }
 *               logisticianId: { type: integer }
 *     responses:
 *       201: { description: Affectation creee }
 *       409: { description: Deja affecte }
 *       401: { description: Non authentifie }
 *       403: { description: Acces refuse }
 */
router.post('/',authenticate,requireRole(...MANAGER),validate(createAssignmentSchema),LogisticServiceController.create);

/**
 * @openapi
 * /logistic-services/{idLogisticService}:
 *   delete:
 *     tags: [LogisticService]
 *     summary: Supprimer une affectation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: idLogisticService, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Affectation supprimee }
 *       404: { description: Introuvable }
 *       401: { description: Non authentifie }
 *       403: { description: Acces refuse }
 */
router.delete('/:idLogisticService',authenticate,requireRole(...MANAGER),validate(idLogisticServiceParams),LogisticServiceController.delete);

export default router;