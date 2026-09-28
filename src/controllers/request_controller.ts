import type { NextFunction, Request, Response } from 'express';
import RequestService from '../services/RequestService.js';
import { toRequestDTO } from '../types/request.dto.js';

class RequestController {
	async create(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const request = await RequestService.createRequest(req.body);
			res.status(201).json({ success: true, data: toRequestDTO(request) });
		} catch (error) {
			next(error);
		}
	}

	async get(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const request = await RequestService.getRequestById(Number(req.params.idRequest));
			res.status(200).json({ success: true, data: toRequestDTO(request) });
		} catch (error) {
			next(error);
		}
	}

	async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const requests = await RequestService.getAllRequests();
			res.status(200).json({ success: true, data: requests.map(toRequestDTO) });
		} catch (error) {
			next(error);
		}
	}

	async update(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const request = await RequestService.updateRequest(Number(req.params.idRequest), req.body);
			res.status(200).json({ success: true, data: toRequestDTO(request) });
		} catch (error) {
			next(error);
		}
	}

	async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const request = await RequestService.deleteRequest(Number(req.params.idRequest));
			res.status(200).json({ success: true, data: toRequestDTO(request) });
		} catch (error) {
			next(error);
		}
	}
}

export default new RequestController();