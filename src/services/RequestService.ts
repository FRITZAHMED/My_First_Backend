import { AppError } from '../Utils/AppError.js';
import RequestRepository, { type RequestCreateInput, type RequestUpdateInput } from '../repositories/RequestRepository.js';

class RequestService {
	async createRequest(requestData: RequestCreateInput) {
		return RequestRepository.create(requestData);
	}

	async getRequestById(idRequest: number) {
		const request = await RequestRepository.findById(idRequest);

		if (!request) {
			throw new AppError('Demande introuvable', 404);
		}

		return request;
	}

	async getAllRequests() {
		return RequestRepository.findAll();
	}

	async updateRequest(idRequest: number, requestData: RequestUpdateInput) {
		await this.getRequestById(idRequest);
		return RequestRepository.update(idRequest, requestData);
	}

	async deleteRequest(idRequest: number) {
		await this.getRequestById(idRequest);
		return RequestRepository.delete(idRequest);
	}
}

export default new RequestService();