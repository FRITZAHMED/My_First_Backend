import type { Request, Response } from 'express';
import UserService from '../services/UserService.js';
import { asyncHandler } from '../Utils/asyncHandler.js';
import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from '../Validators/user.validator.js';

class UserController {
	create = asyncHandler(async (req: Request, res: Response) => {
		const user = await UserService.createUser(req.body as CreateUserInput);
		res.status(201).json({ success: true, message: 'Utilisateur cree', data: user });
	});

	getAll = asyncHandler(async (req: Request, res: Response) => {
		const { users, meta } = await UserService.listUsers(req.query as unknown as ListUsersQuery);
		res.status(200).json({ success: true, data: users, meta });
	});

	getById = asyncHandler(async (req: Request, res: Response) => {
		const user = await UserService.getUserById(Number(req.params.id));
		res.status(200).json({ success: true, data: user });
	});

	update = asyncHandler(async (req: Request, res: Response) => {
		const user = await UserService.updateUser(Number(req.params.id), req.body as UpdateUserInput);
		res.status(200).json({ success: true, message: 'Utilisateur mis a jour', data: user });
	});

	delete = asyncHandler(async (req: Request, res: Response) => {
		await UserService.deleteUser(Number(req.params.id));
		res.status(200).json({ success: true, message: 'Utilisateur supprime' });
	});
}

export default new UserController();
