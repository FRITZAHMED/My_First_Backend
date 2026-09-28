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
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20, maximum: 100 } }
 *       - { in: query, name: idRequest, schema: { type: integer } }
 *     responses:
 *       200: { description: Liste paginee }
 *   post:
 *     tags: [Submissions]
 *     summary: Soumettre sa propre demande
 *     responses:
 *       201: { description: Soumission creee }
 *       409: { description: Deja soumise }
 */
router.get('/', authenticate, validate(listSubmissionSchema), SubmissionController.getAll);
router.post('/', authenticate, validate(createSubmissionSchema), SubmissionController.create);

router.get(
	'/:idRequest/:idUser',
	authenticate,
	validate(idRequestAndUserParams),
	SubmissionController.getById,
);

router.delete(
	'/:idRequest/:idUser',
	authenticate,
	requireRole(...MANAGER),
	validate(idRequestAndUserParams),
	SubmissionController.delete,
);

export default router;
