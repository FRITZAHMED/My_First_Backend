import type { NextFunction, Request, Response } from 'express';
import SubmissionService from '../services/SubmissionService.js';
import { toSubmissionDTO } from '../types/submission.dto.js';

class SubmissionController {
	async create(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const submission = await SubmissionService.createSubmission(req.body);

			res.status(201).json({
				success: true,
				message: 'Soumission créée avec succès',
				data: toSubmissionDTO(submission),
			});
		} catch (error) {
			next(error);
		}
	}

	async get(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const submission = await SubmissionService.getSubmission(
				Number(req.params.idUser),
				Number(req.params.idRequest),
			);

			res.status(200).json({ success: true, data: toSubmissionDTO(submission) });
		} catch (error) {
			next(error);
		}
	}

	async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const submissions = await SubmissionService.getAllSubmissions();
			res.status(200).json({ success: true, data: submissions.map(toSubmissionDTO) });
		} catch (error) {
			next(error);
		}
	}

	async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const submission = await SubmissionService.deleteSubmission(
				Number(req.params.idUser),
				Number(req.params.idRequest),
			);

			res.status(200).json({
				success: true,
				message: 'Soumission supprimée avec succès',
				data: toSubmissionDTO(submission),
			});
		} catch (error) {
			next(error);
		}
	}
}

export default new SubmissionController();