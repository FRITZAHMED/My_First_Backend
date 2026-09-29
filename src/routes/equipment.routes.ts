import { Router } from 'express';
import { authenticate, requireRole } from '../Middleware/auth.middleware.js';
import validate from '../Middleware/validate.middleware.js';
import EquipmentController from '../controllers/equipment.controller.js';
import { idParams } from '../Validators/common.js';
import {createEquipmentSchema,listEquipmentSchema,updateEquipmentSchema} from '../Validators/equipment.validator.js';

const router = Router();
const MANAGER = ['Administrator', 'Director', 'Manager'] as const;

/**
 * @openapi
 * /equipment:
 *   get:
 *     tags: [Equipment]
 *     summary: Lister des equipements
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20, maximum: 100 } }
 *       - { in: query, name: status, schema: { type: string, enum: [AVAILABLE, ASSIGNED, MAINTENANCE, RETIRED] } }
 *     responses:
 *       200: { description: Liste paginee }
 *       401: { description: Non authentifie }
 */
router.get('/', authenticate, validate(listEquipmentSchema), EquipmentController.getAll);

/**
 * @openapi
 * /equipment/{id}:
 *   get:
 *     tags: [Equipment]
 *     summary: Recuperer un equipement par son id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Equipement }
 *       404: { description: Introuvable }
 *       401: { description: Non authentifie }
 */
router.get('/:id', authenticate, validate(idParams), EquipmentController.getById);

/**
 * @openapi
 * /equipment:
 *   post:
 *     tags: [Equipment]
 *     summary: Enregistrer un equipement
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [serialNumber]
 *             properties:
 *               description: { type: string }
 *               serialNumber: { type: string }
 *               status: { type: string, enum: [AVAILABLE, ASSIGNED, MAINTENANCE, RETIRED] }
 *               idUser: { type: integer, nullable: true }
 *     responses:
 *       201: { description: Equipement cree }
 *       409: { description: Numero de serie deja utilise }
 *       401: { description: Non authentifie }
 *       403: { description: Acces refuse }
 */
router.post('/',authenticate,requireRole(...MANAGER),validate(createEquipmentSchema),EquipmentController.create);

/**
 * @openapi
 * /equipment/{id}:
 *   patch:
 *     tags: [Equipment]
 *     summary: Modifier un equipement
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
 *               description: { type: string }
 *               serialNumber: { type: string }
 *               status: { type: string, enum: [AVAILABLE, ASSIGNED, MAINTENANCE, RETIRED] }
 *               idUser: { type: integer, nullable: true }
 *     responses:
 *       200: { description: Equipement modifie }
 *       404: { description: Introuvable }
 *       401: { description: Non authentifie }
 *       403: { description: Acces refuse }
 */
router.patch('/:id',authenticate,requireRole(...MANAGER),validate(idParams),validate(updateEquipmentSchema),EquipmentController.update);

/**
 * @openapi
 * /equipment/{id}:
 *   delete:
 *     tags: [Equipment]
 *     summary: Supprimer un equipement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Equipement supprime }
 *       404: { description: Introuvable }
 *       401: { description: Non authentifie }
 *       403: { description: Acces refuse }
 */
router.delete('/:id', authenticate, requireRole(...MANAGER), validate(idParams), EquipmentController.delete);

export default router;