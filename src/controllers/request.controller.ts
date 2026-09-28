import type { Request, Response } from 'express';
import RequestService from '../services/RequestService.js';
import { asyncHandler } from '../Utils/asyncHandler.js';
import type {
	CreateRequestInput,
	ListRequestQuery,
	UpdateRequestInput,
} from '../Validators/request.validator.js';

const PRIVILEGED_ROLES = ['Administrator', 'Director', 'Manager'];

class RequestController {
	create = asyncHandler(async (req: Request, res: Response) => {
		const request = await RequestService.createRequest(req.body as CreateRequestInput, req.auth!.idUser);
		res.status(201).json({ success: true, message: 'Demande creee', data: request });
	});

	getAll = asyncHandler(async (req: Request, res: Response) => {
		const { requests, meta } = await RequestService.listRequests(req.query as unknown as ListRequestQuery, {
			authorId: req.auth!.idUser,
			isPrivileged: PRIVILEGED_ROLES.includes(req.auth!.role),
		});
		res.status(200).json({ success: true, data: requests, meta });
	});

	getById = asyncHandler(async (req: Request, res: Response) => {
		const request = await RequestService.getRequestById(Number(req.params.idRequest));
		res.status(200).json({ success: true, data: request });
	});

	update = asyncHandler(async (req: Request, res: Response) => {
		const request = await RequestService.updateRequest(
			Number(req.params.idRequest),
			req.body as UpdateRequestInput,
			req.auth!.idUser,
			PRIVILEGED_ROLES.includes(req.auth!.role),
		);
		res.status(200).json({ success: true, message: 'Demande mise a jour', data: request });
	});

	delete = asyncHandler(async (req: Request, res: Response) => {
		await RequestService.deleteRequest(
			Number(req.params.idRequest),
			req.auth!.idUser,
			PRIVILEGED_ROLES.includes(req.auth!.role),
		);
		res.status(200).json({ success: true, message: 'Demande supprimee' });
	});
}

export default new RequestController();
