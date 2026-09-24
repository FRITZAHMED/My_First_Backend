import type { NextFunction, Request, Response } from 'express';
import userService from '../services/UserService.js';
import { toUserDTO } from '../types/user.dto.js';

class UserController {
	async register(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const newUser = await userService.registerUser(req.body);

			res.status(201).json({
				success: true,
				message: 'Utilisateur créé avec succès',
				data: toUserDTO(newUser),
			});
		} catch (error) {
			next(error);
		}
	}

	async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const user = await userService.getUserById(Number(req.params.id));

			res.status(200).json({
				success: true,
				data: toUserDTO(user),
			});
		} catch (error) {
			next(error);
		}
	}
}

export default new UserController();