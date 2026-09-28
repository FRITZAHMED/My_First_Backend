import { ConflictError, NotFoundError } from '../Utils/AppError.js';
import type { CreateSubmissionInput, ListSubmissionQuery } from '../Validators/submission.validator.js';
import { buildMeta, toSkipTake } from '../Utils/pagination.js';
import RequestRepository from '../repositories/RequestRepository.js';
import SubmissionRepository from '../repositories/SubmissionRepository.js';

class SubmissionService {
	/** Un utilisateur se soumet a sa propre demande ; pas de libre-service croise. */
	async createSubmission(data: CreateSubmissionInput, actorId: number) {
		const request = await RequestRepository.findById(data.idRequest);

		if (!request) {
			throw new NotFoundError('Demande');
		}

		if (request.idUser !== actorId) {
			throw new NotFoundError('Demande');
		}

		if (await SubmissionRepository.findById(actorId, data.idRequest)) {
			throw new ConflictError('Vous avez deja soumis cette demande');
		}

		return SubmissionRepository.create({ idUser: actorId, idRequest: data.idRequest });
	}

	async getSubmission(idUser: number, idRequest: number) {
		const submission = await SubmissionRepository.findById(idUser, idRequest);

		if (!submission) {
			throw new NotFoundError('Soumission');
		}

		return submission;
	}

	async listSubmissions(query: ListSubmissionQuery, options: { actorId: number; isPrivileged: boolean }) {
		const { skip, take } = toSkipTake(query);
		const filters = options.isPrivileged ? { idRequest: query.idRequest } : { idUser: options.actorId };

		const [submissions, total] = await Promise.all([
			SubmissionRepository.findMany(skip, take, filters),
			SubmissionRepository.count(filters),
		]);

		return { submissions, meta: buildMeta(query, total) };
	}

	async deleteSubmission(idUser: number, idRequest: number, actorId: number, isPrivileged: boolean) {
		if (!isPrivileged && idUser !== actorId) {
			throw new NotFoundError('Soumission');
		}

		await this.getSubmission(idUser, idRequest);
		return SubmissionRepository.delete(idUser, idRequest);
	}
}

export default new SubmissionService();
