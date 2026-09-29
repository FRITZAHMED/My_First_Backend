import { Router } from 'express';
import { authenticate, requireRole } from '../Middleware/auth.middleware.js';
import validate from '../Middleware/validate.middleware.js';
import SubmissionController from '../controllers/submission.controller.js';
import { idRequestAndUserParams } from '../Validators/common.js';
import { createSubmissionSchema, listSubmissionSchema } from '../Validators/submission.validator.js';

const router = Router();
const MANAGER = ['Administrator', 'Director', 'Manager'] as const;

/**
 * @openapi
 * /submissions:
 *   get:
 *     tags: [Submissions]
 *     summary: Lister les soumissions (pagine)
 *     description: Un utilisateur simple ne voit que ses propres soumissions.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20, maximum: 100 } }
 *       - { in: query, name: idRequest, schema: { type: integer } }
 *     responses:
 *       200: { description: Liste paginee }
 *       401: { description: Non authentifie }
 */
router.get('/', authenticate, validate(listSubmissionSchema), SubmissionController.getAll);

/**
 * @openapi
 * /submissions/{idRequest}/{idUser}:
 *   get:
 *     tags: [Submissions]
 *     summary: Recuperer une soumission par idRequest et idUser
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: idRequest, required: true, schema: { type: integer } }
 *       - { in: path, name: idUser, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Soumission }
 *       404: { description: Introuvable }
 *       401: { description: Non authentifie }
 *       403: { description: Acces refuse }
 */
router.get('/:idRequest/:idUser',authenticate,validate(idRequestAndUserParams),SubmissionController.getById);

/**
 * @openapi
 * /submissions:
 *   post:
 *     tags: [Submissions]
 *     summary: Soumettre sa propre demande
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [requestId]
 *             properties:
 *               requestId: { type: integer }
 *     responses:
 *       201: { description: Soumission creee }
 *       409: { description: Deja soumise }
 *       401: { description: Non authentifie }
 */
router.post('/', authenticate, validate(createSubmissionSchema), SubmissionController.create);

/**
 * @openapi
 * /submissions/{idRequest}/{idUser}:
 *   delete:
 *     tags: [Submissions]
 *     summary: Supprimer une soumission
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: idRequest, required: true, schema: { type: integer } }
 *       - { in: path, name: idUser, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Soumission supprimee }
 *       404: { description: Introuvable }
 *       401: { description: Non authentifie }
 *       403: { description: Acces refuse }
 */
router.delete('/:idRequest/:idUser',authenticate,requireRole(...MANAGER),validate(idRequestAndUserParams),SubmissionController.delete);

export default router;