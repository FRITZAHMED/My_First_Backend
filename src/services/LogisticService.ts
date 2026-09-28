import { ConflictError, ForbiddenError, NotFoundError } from '../Utils/AppError.js';
import type { CreateAssignmentInput, ListAssignmentQuery } from '../Validators/logisticService.validator.js';
import { buildMeta, toSkipTake } from '../Utils/pagination.js';
import LogisticServiceRepository from '../repositories/LogisticServiceRepository.js';
import RequestRepository from '../repositories/RequestRepository.js';
import UserRepository from '../repositories/UserRepository.js';

class LogisticService {
	async createAssignment(data: CreateAssignmentInput) {
		const [request, logistician] = await Promise.all([
			RequestRepository.findById(data.idRequest),
			UserRepository.findById(data.idLogistician),
		]);

		if (!request) {
			throw new NotFoundError('Demande');
		}

		if (!logistician) {
			throw new NotFoundError('Utilisateur');
		}

		if (logistician.role !== 'Logistician' && logistician.role !== 'Administrator') {
			throw new ForbiddenError('Seul un logisticien peut etre affecte a une demande');
		}

		if (await LogisticServiceRepository.findByPair(data.idRequest, data.idLogistician)) {
			throw new ConflictError('Ce logisticien est deja affecte a cette demande');
		}

		return LogisticServiceRepository.create(data);
	}

	async getAssignmentById(idLogisticService: number) {
		const assignment = await LogisticServiceRepository.findById(idLogisticService);

		if (!assignment) {
			throw new NotFoundError('Affectation');
		}

		return assignment;
	}

	async listAssignments(query: ListAssignmentQuery) {
		const { skip, take } = toSkipTake(query);

		const [assignments, total] = await Promise.all([
			LogisticServiceRepository.findMany(skip, take),
			LogisticServiceRepository.count(),
		]);

		return { assignments, meta: buildMeta(query, total) };
	}

	async deleteAssignment(idLogisticService: number) {
		await this.getAssignmentById(idLogisticService);
		return LogisticServiceRepository.delete(idLogisticService);
	}
}

export default new LogisticService();
