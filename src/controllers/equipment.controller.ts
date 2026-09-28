import type { Request, Response } from 'express';
import EquipmentService from '../services/EquipmentService.js';
import { asyncHandler } from '../Utils/asyncHandler.js';
import type {
	CreateEquipmentInput,
	ListEquipmentQuery,
	UpdateEquipmentInput,
} from '../Validators/equipment.validator.js';

class EquipmentController {
	create = asyncHandler(async (req: Request, res: Response) => {
		const equipment = await EquipmentService.createEquipment(req.body as CreateEquipmentInput);
		res.status(201).json({ success: true, message: 'Equipement cree', data: equipment });
	});

	getAll = asyncHandler(async (req: Request, res: Response) => {
		const { equipment, meta } = await EquipmentService.listEquipment(
			req.query as unknown as ListEquipmentQuery,
		);
		res.status(200).json({ success: true, data: equipment, meta });
	});

	getById = asyncHandler(async (req: Request, res: Response) => {
		const equipment = await EquipmentService.getEquipmentById(Number(req.params.id));
		res.status(200).json({ success: true, data: equipment });
	});

	update = asyncHandler(async (req: Request, res: Response) => {
		const equipment = await EquipmentService.updateEquipment(
			Number(req.params.id),
			req.body as UpdateEquipmentInput,
		);
		res.status(200).json({ success: true, message: 'Equipement mis a jour', data: equipment });
	});

	delete = asyncHandler(async (req: Request, res: Response) => {
		await EquipmentService.deleteEquipment(Number(req.params.id));
		res.status(200).json({ success: true, message: 'Equipement supprime' });
	});
}

export default new EquipmentController();
