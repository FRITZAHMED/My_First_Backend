import { AppError } from '../Utils/AppError.js';
import RequestRepository from '../repositories/RequestRepository.js';
import SubmissionRepository, { type SubmissionCreateInput } from '../repositories/SubmissionRepository.js';
import UserRepository from '../repositories/UserRepository.js';

class SubmissionService {
	async createSubmission(submissionData: SubmissionCreateInput) {
		const [user, request] = await Promise.all([
			UserRepository.findById(submissionData.idUser),
			RequestRepository.findById(submissionData.idRequest),
		]);

		if (!user) {
			throw new AppError('Utilisateur introuvable', 404);
		}

		if (!request) {
			throw new AppError('Demande introuvable', 404);
		}

		if (await SubmissionRepository.findById(submissionData.idUser, submissionData.idRequest)) {
			throw new AppError('Cette soumission existe déjà', 409);
		}

		return SubmissionRepository.create(submissionData);
	}

	async getSubmission(idUser: number, idRequest: number) {
		const submission = await SubmissionRepository.findById(idUser, idRequest);

		if (!submission) {
			throw new AppError('Soumission introuvable', 404);
		}

		return submission;
	}

	async getAllSubmissions() {
		return SubmissionRepository.findAll();
	}

	async deleteSubmission(idUser: number, idRequest: number) {
		await this.getSubmission(idUser, idRequest);
		return SubmissionRepository.delete(idUser, idRequest);
	}
}

export default new SubmissionService();