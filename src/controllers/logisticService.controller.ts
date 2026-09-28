import type { Request, Response } from 'express';
import LogisticService from '../services/LogisticService.js';
import { asyncHandler } from '../Utils/asyncHandler.js';
import type { CreateAssignmentInput, ListAssignmentQuery } from '../Validators/logisticService.validator.js';

class LogisticServiceController {
	create = asyncHandler(async (req: Request, res: Response) => {
		const assignment = await LogisticService.createAssignment(req.body as CreateAssignmentInput);
		res.status(201).json({ success: true, message: 'Logisticien affecte', data: assignment });
	});

	getAll = asyncHandler(async (req: Request, res: Response) => {
		const { assignments, meta } = await LogisticService.listAssignments(
			req.query as unknown as ListAssignmentQuery,
		);
		res.status(200).json({ success: true, data: assignments, meta });
	});

	getById = asyncHandler(async (req: Request, res: Response) => {
		const assignment = await LogisticService.getAssignmentById(Number(req.params.idLogisticService));
		res.status(200).json({ success: true, data: assignment });
	});

	delete = asyncHandler(async (req: Request, res: Response) => {
		await LogisticService.deleteAssignment(Number(req.params.idLogisticService));
		res.status(200).json({ success: true, message: 'Affectation supprimee' });
	});
}

export default new LogisticServiceController();
