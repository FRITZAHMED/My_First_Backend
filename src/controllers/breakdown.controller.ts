import type { Request, Response } from 'express';
import BreakdownService from '../services/BreakdownService.js';
import { asyncHandler } from '../Utils/asyncHandler.js';
import type {
	CreateBreakdownInput,
	ListBreakdownQuery,
	UpdateBreakdownInput,
} from '../Validators/breakdown.validator.js';

class BreakdownController {
	create = asyncHandler(async (req: Request, res: Response) => {
		const breakdown = await BreakdownService.createBreakdown(
			req.body as CreateBreakdownInput,
			req.auth!.idUser,
		);
		res.status(201).json({ success: true, message: 'Panne declaree', data: breakdown });
	});

	getAll = asyncHandler(async (req: Request, res: Response) => {
		const { breakdowns, meta } = await BreakdownService.listBreakdowns(req.query as unknown as ListBreakdownQuery);
		res.status(200).json({ success: true, data: breakdowns, meta });
	});

	getById = asyncHandler(async (req: Request, res: Response) => {
		const breakdown = await BreakdownService.getBreakdownById(Number(req.params.id));
		res.status(200).json({ success: true, data: breakdown });
	});

	update = asyncHandler(async (req: Request, res: Response) => {
		const breakdown = await BreakdownService.updateBreakdown(
			Number(req.params.id),
			req.body as UpdateBreakdownInput,
		);
		res.status(200).json({ success: true, message: 'Panne mise a jour', data: breakdown });
	});

	delete = asyncHandler(async (req: Request, res: Response) => {
		await BreakdownService.deleteBreakdown(Number(req.params.id));
		res.status(200).json({ success: true, message: 'Panne supprimee' });
	});
}

export default new BreakdownController();
