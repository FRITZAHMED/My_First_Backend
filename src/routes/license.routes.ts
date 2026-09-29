import { Router } from 'express';
import { authenticate, requireRole } from '../Middleware/auth.middleware.js';
import validate from '../Middleware/validate.middleware.js';
import LicenseController from '../controllers/license.controller.js';
import { idParams } from '../Validators/common.js';
import { createLicenseSchema, listLicensesSchema, updateLicenseSchema } from '../Validators/license.validator.js';

const router = Router();
const MANAGER = ['Administrator', 'Director', 'Manager'] as const;

/**
 * @openapi
 * /licenses:
 *   get:
 *     tags: [License]
 *     summary: Lister les licences (pagine)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20, maximum: 100 } }
 *       - { in: query, name: status, schema: { type: string, enum: [ACTIVE, EXPIRED, SUSPENDED] } }
 *       - { in: query, name: equipmentId, schema: { type: integer } }
 *     responses:
 *       200: { description: Liste paginee }
 *       401: { description: Non authentifie }
 */
router.get('/', authenticate, validate(listLicensesSchema), LicenseController.getAll);

/**
 * @openapi
 * /licenses/{id}:
 *   get:
 *     tags: [License]
 *     summary: Recuperer une licence par son id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Licence }
 *       404: { description: Introuvable }
 *       401: { description: Non authentifie }
 */
router.get('/:id', authenticate, validate(idParams), LicenseController.getById);

/**
 * @openapi
 * /licenses:
 *   post:
 *     tags: [License]
 *     summary: Creer une licence pour un equipement
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [licenseNumber, idEquipment]
 *             properties:
 *               licenseNumber: { type: string }
 *               status: { type: string, enum: [ACTIVE, EXPIRED, SUSPENDED] }
 *               idEquipment: { type: integer }
 *     responses:
 *       201: { description: Licence creee }
 *       409: { description: Numero de licence ou equipement deja utilise }
 *       401: { description: Non authentifie }
 *       403: { description: Acces refuse }
 */
router.post('/', authenticate, requireRole(...MANAGER), validate(createLicenseSchema), LicenseController.create);

/**
 * @openapi
 * /licenses/{id}:
 *   patch:
 *     tags: [License]
 *     summary: Modifier une licence
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
 *               licenseNumber: { type: string }
 *               status: { type: string, enum: [ACTIVE, EXPIRED, SUSPENDED] }
 *               idEquipment: { type: integer }
 *     responses:
 *       200: { description: Licence modifiee }
 *       404: { description: Introuvable }
 *       401: { description: Non authentifie }
 *       403: { description: Acces refuse }
 */
router.patch('/:id', authenticate, requireRole(...MANAGER), validate(idParams), validate(updateLicenseSchema), LicenseController.update);

/**
 * @openapi
 * /licenses/{id}:
 *   delete:
 *     tags: [License]
 *     summary: Supprimer une licence
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Licence supprimee }
 *       404: { description: Introuvable }
 *       401: { description: Non authentifie }
 *       403: { description: Acces refuse }
 */
router.delete('/:id', authenticate, requireRole(...MANAGER), validate(idParams), LicenseController.delete);

/**
 * @openapi
 * /licenses/stats:
 *   get:
 *     tags: [License]
 *     summary: Statistiques des licences par statut
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Statistiques }
 *       401: { description: Non authentifie }
 */
router.get('/stats', authenticate, LicenseController.getStats);

export default router;