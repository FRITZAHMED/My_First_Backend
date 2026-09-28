import { NotFoundError } from '../Utils/AppError.js';
import type { CreateRequestInput, ListRequestQuery, UpdateRequestInput } from '../Validators/request.validator.js';
import { buildMeta, toSkipTake } from '../Utils/pagination.js';
import RequestRepository from '../repositories/RequestRepository.js';

class RequestService {
	async createRequest(data: CreateRequestInput, authorId: number) {
		return RequestRepository.create({ description: data.description, idUser: authorId });
	}

	async getRequestById(idRequest: number) {
		const request = await RequestRepository.findById(idRequest);

		if (!request) {
			throw new NotFoundError('Demande');
		}

		return request;
	}

	/**
	 * Un utilisateur simple ne voit que ses propres demandes ;
	 * les roles de pilotage voient tout.
	 */
	async listRequests(query: ListRequestQuery, options: { authorId: number; isPrivileged: boolean }) {
		const { skip, take } = toSkipTake(query);

		const [requests, total] = options.isPrivileged
			? await Promise.all([RequestRepository.findMany(skip, take), RequestRepository.count()])
			: await Promise.all([
					RequestRepository.findManyByAuthor(options.authorId, skip, take),
					RequestRepository.countByAuthor(options.authorId),
				]);

		return { requests, meta: buildMeta(query, total) };
	}

	async updateRequest(idRequest: number, data: UpdateRequestInput, actorId: number, isPrivileged: boolean) {
		const request = await this.getRequestById(idRequest);

		if (!isPrivileged && request.idUser !== actorId) {
			throw new NotFoundError('Demande');
		}

		return RequestRepository.update(idRequest, { description: data.description });
	}

	async deleteRequest(idRequest: number, actorId: number, isPrivileged: boolean) {
		const request = await this.getRequestById(idRequest);

		if (!isPrivileged && request.idUser !== actorId) {
			throw new NotFoundError('Demande');
		}

		return RequestRepository.delete(idRequest);
	}
}

export default new RequestService();
