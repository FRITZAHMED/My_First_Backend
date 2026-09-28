import type { Request, Response } from 'express';
import SubmissionService from '../services/SubmissionService.js';
import { asyncHandler } from '../Utils/asyncHandler.js';
import type { CreateSubmissionInput, ListSubmissionQuery } from '../Validators/submission.validator.js';

const PRIVILEGED_ROLES = ['Administrator', 'Director', 'Manager'];

class SubmissionController {
	create = asyncHandler(async (req: Request, res: Response) => {
		const submission = await SubmissionService.createSubmission(
			req.body as CreateSubmissionInput,
			req.auth!.idUser,
		);
		res.status(201).json({ success: true, message: 'Demande soumise', data: submission });
	});

	getAll = asyncHandler(async (req: Request, res: Response) => {
		const { submissions, meta } = await SubmissionService.listSubmissions(
			req.query as unknown as ListSubmissionQuery,
			{
				actorId: req.auth!.idUser,
				isPrivileged: PRIVILEGED_ROLES.includes(req.auth!.role),
			},
		);
		res.status(200).json({ success: true, data: submissions, meta });
	});

	getById = asyncHandler(async (req: Request, res: Response) => {
		const submission = await SubmissionService.getSubmission(
			Number(req.params.idUser),
			Number(req.params.idRequest),
		);
		res.status(200).json({ success: true, data: submission });
	});

	delete = asyncHandler(async (req: Request, res: Response) => {
		await SubmissionService.deleteSubmission(
			Number(req.params.idUser),
			Number(req.params.idRequest),
			req.auth!.idUser,
			PRIVILEGED_ROLES.includes(req.auth!.role),
		);
		res.status(200).json({ success: true, message: 'Soumission supprimee' });
	});
}

export default new SubmissionController();
