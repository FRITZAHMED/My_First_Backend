import type { NextFunction, Request, Response } from 'express';
import LogisticService from '../services/LogisticService.js';
import { toLogisticServiceDTO } from '../types/logisticservice.dto.js';

class LogisticServiceController {
	async create(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const service = await LogisticService.createLogisticService(req.body);
			res.status(201).json({ success: true, data: toLogisticServiceDTO(service) });
		} catch (error) {
			next(error);
		}
	}

	async get(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const service = await LogisticService.getLogisticServiceById(Number(req.params.idLogisticService));
			res.status(200).json({ success: true, data: toLogisticServiceDTO(service) });
		} catch (error) {
			next(error);
		}
	}

	async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const services = await LogisticService.getAllLogisticServices();
			res.status(200).json({ success: true, data: services.map(toLogisticServiceDTO) });
		} catch (error) {
			next(error);
		}
	}

	async update(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const service = await LogisticService.updateLogisticService(
				Number(req.params.idLogisticService),
				req.body,
			);
			res.status(200).json({ success: true, data: toLogisticServiceDTO(service) });
		} catch (error) {
			next(error);
		}
	}

	async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const service = await LogisticService.deleteLogisticService(Number(req.params.idLogisticService));
			res.status(200).json({ success: true, data: toLogisticServiceDTO(service) });
		} catch (error) {
			next(error);
		}
	}
}

export default new LogisticServiceController();