import { Router } from 'express';
import { authenticate, requireRole } from '../Middleware/auth.middleware.js';
import validate from '../Middleware/validate.middleware.js';
import RequestController from '../controllers/request.controller.js';
import { idRequestParams } from '../Validators/common.js';
import {createRequestSchema,listRequestSchema,updateRequestSchema} from '../Validators/request.validator.js';

const router = Router();
const MANAGER = ['Administrator', 'Director', 'Manager'] as const;

/**
 * @openapi
 * /requests:
 *   get:
 *     tags: [Requests]
 *     summary: Lister les demandes
 *     description: Un utilisateur simple ne voit que ses propres demandes ; les roles de pilotage voient tout.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20, maximum: 100 } }
 *     responses:
 *       200: { description: Liste paginee }
 *       401: { description: Non authentifie }
 */
router.get('/', authenticate, validate(listRequestSchema), RequestController.getAll);

/**
 * @openapi
 * /requests/{idRequest}:
 *   get:
 *     tags: [Requests]
 *     summary: Recuperer une demande par son id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: idRequest, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Demande }
 *       404: { description: Introuvable }
 *       401: { description: Non authentifie }
 *       403: { description: Acces refuse (pas votre demande) }
 */
router.get('/:idRequest', authenticate, validate(idRequestParams), RequestController.getById);

/**
 * @openapi
 * /requests:
 *   post:
 *     tags: [Requests]
 *     summary: Creer une demande
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description]
 *             properties:
 *               description: { type: string }
 *     responses:
 *       201: { description: Demande creee }
 *       401: { description: Non authentifie }
 */
router.post('/', authenticate, validate(createRequestSchema), RequestController.create);

/**
 * @openapi
 * /requests/{idRequest}:
 *   patch:
 *     tags: [Requests]
 *     summary: Modifier une demande
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: idRequest, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description: { type: string }
 *     responses:
 *       200: { description: Demande modifiee }
 *       404: { description: Introuvable }
 *       401: { description: Non authentifie }
 *       403: { description: Acces refuse (pas votre demande) }
 */
router.patch('/:idRequest',authenticate,validate(idRequestParams),validate(updateRequestSchema),RequestController.update);

/**
 * @openapi
 * /requests/{idRequest}:
 *   delete:
 *     tags: [Requests]
 *     summary: Supprimer une demande
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: idRequest, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Demande supprimee }
 *       404: { description: Introuvable }
 *       401: { description: Non authentifie }
 *       403: { description: Acces refuse }
 */
router.delete('/:idRequest',authenticate,requireRole(...MANAGER),validate(idRequestParams),RequestController.delete);

export default router;