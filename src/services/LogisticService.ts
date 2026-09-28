import { AppError } from '../Utils/AppError.js';
import { hashPassword } from '../Utils/password.js';
import LogisticServiceRepository, {
	type LogisticServiceCreateInput,
	type LogisticServiceUpdateInput,
} from '../repositories/LogisticServiceRepository.js';
import RequestRepository from '../repositories/RequestRepository.js';

class LogisticService {
	async createLogisticService(serviceData: LogisticServiceCreateInput) {
		const request = await RequestRepository.findById(serviceData.idRequest);

		if (!request) {
			throw new AppError('Demande introuvable', 404);
		}

		return LogisticServiceRepository.create({
			...serviceData,
			password: await hashPassword(serviceData.password),
		});
	}

	async getLogisticServiceById(idLogisticService: number) {
		const service = await LogisticServiceRepository.findById(idLogisticService);

		if (!service) {
			throw new AppError('Service logistique introuvable', 404);
		}

		return service;
	}

	async getAllLogisticServices() {
		return LogisticServiceRepository.findAll();
	}

	async updateLogisticService(idLogisticService: number, serviceData: LogisticServiceUpdateInput) {
		await this.getLogisticServiceById(idLogisticService);

		if (serviceData.idRequest !== undefined) {
			const request = await RequestRepository.findById(serviceData.idRequest);

			if (!request) {
				throw new AppError('Demande introuvable', 404);
			}
		}

		const updateData = { ...serviceData };
		if (updateData.password) {
			updateData.password = await hashPassword(updateData.password);
		}

		return LogisticServiceRepository.update(idLogisticService, updateData);
	}

	async deleteLogisticService(idLogisticService: number) {
		await this.getLogisticServiceById(idLogisticService);
		return LogisticServiceRepository.delete(idLogisticService);
	}
}

export default new LogisticService();