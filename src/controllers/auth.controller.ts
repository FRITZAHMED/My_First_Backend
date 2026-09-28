import type { Request, Response } from 'express';
import AuthService from '../services/AuthService.js';
import { asyncHandler } from '../Utils/asyncHandler.js';
import { ForbiddenError } from '../Utils/AppError.js';

class AuthController {
	register = asyncHandler(async (req: Request, res: Response) => {
		
		const actorRole = req.auth?.role;

		if (actorRole && !['Administrator', 'Director'].includes(actorRole)) {
			throw new ForbiddenError('Vous ne pouvez pas creer de compte pour un autre role');
		}

		const result = await AuthService.register(req.body, actorRole);
		res.status(201).json({ success: true, message: 'Creation du Compte Avec Success', data: result });
	});

	login = asyncHandler(async (req: Request, res: Response) => {
		const tokens = await AuthService.login(req.body);
		res.status(200).json({ success: true, data: tokens });
	});

	refresh = asyncHandler(async (req: Request, res: Response) => {
		const tokens = await AuthService.refresh(req.body.refreshToken);
		res.status(200).json({ success: true, data: tokens });
	});

	logout = asyncHandler(async (req: Request, res: Response) => {
		await AuthService.logout(req.auth!.idUser);
		res.status(200).json({ success: true, message: 'Deconnexion effectuee' });
	});

	me = asyncHandler(async (req: Request, res: Response) => {
		const { idUser, email, role } = req.auth!;
		res.status(200).json({ success: true, data: { idUser, email, role } });
	});

	changePassword = asyncHandler(async (req: Request, res: Response) => {
		const result = await AuthService.changePassword(req.auth!.idUser, req.body);
		res.status(200).json({ success: true, ...result });
	});
}

export default new AuthController();
