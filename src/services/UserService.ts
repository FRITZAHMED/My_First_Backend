import { ConflictError, NotFoundError } from '../Utils/AppError.js';
import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from '../Validators/user.validator.js';
import { buildMeta, toSkipTake } from '../Utils/pagination.js';
import { hashPassword } from '../Utils/password.js';
import UserRepository from '../repositories/UserRepository.js';

class UserService {
	async createUser(userData: CreateUserInput) {
		const existing = await UserRepository.findByEmail(userData.professionalEmail);

		if (existing) {
			throw new ConflictError('Cette adresse email est deja utilisee');
		}

		return UserRepository.create({
			professionalEmail: userData.professionalEmail,
			role: userData.role,
			password: await hashPassword(userData.password),
		});
	}

	async getUserById(idUser: number) {
		const user = await UserRepository.findById(idUser);

		if (!user) {
			throw new NotFoundError('Utilisateur');
		}

		return user;
	}

	async listUsers(query: ListUsersQuery) {
		const { skip, take } = toSkipTake(query);
		const filters = { role: query.role, search: query.search };

		const [users, total] = await Promise.all([
			UserRepository.findMany(skip, take, filters),
			UserRepository.count(filters),
		]);

		return { users, meta: buildMeta(query, total) };
	}

	async updateUser(idUser: number, userData: UpdateUserInput) {
		await this.getUserById(idUser);

		if (userData.professionalEmail) {
			const existing = await UserRepository.findByEmail(userData.professionalEmail);

			if (existing && existing.idUser !== idUser) {
				throw new ConflictError('Cette adresse email est deja utilisee');
			}
		}

		const data = {
			...(userData.professionalEmail !== undefined && { professionalEmail: userData.professionalEmail }),
			...(userData.role !== undefined && { role: userData.role }),
			...(userData.isActive !== undefined && { isActive: userData.isActive }),
			// Le mot de passe est toujours re-hache : un hash ne doit jamais
			// pouvoir transiter via l'API.
			...(userData.password !== undefined && { password: await hashPassword(userData.password) }),
		};

		return UserRepository.update(idUser, data);
	}

	async deleteUser(idUser: number) {
		await this.getUserById(idUser);
		await UserRepository.setRefreshToken(idUser, null);
		return UserRepository.delete(idUser);
	}
}

export default new UserService();
