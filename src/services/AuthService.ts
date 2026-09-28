import type { user_role } from '@prisma/client';
import { env } from '../Config/env.js';
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from '../Utils/AppError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../Utils/jwt.js';
import { comparePassword, createTokenId, hashPassword, hashToken } from '../Utils/password.js';
import type { ChangePasswordInput, LoginInput, RegisterInput } from '../Validators/auth.validator.js';
import { logger } from '../Config/logger.js';
import UserRepository from '../repositories/UserRepository.js';

const SELF_REGISTERED_ROLES: user_role[] = ['Employer', 'Logistician'];

class AuthService {
	async register(input: RegisterInput, actorRole?: user_role) {
		const role = actorRole && actorRole !== 'Employer' ? input.role : 'Employer';

		if (!actorRole && !SELF_REGISTERED_ROLES.includes(role)) {
			throw new ForbiddenError("L'inscription publique est limitee aux roles Employer et Logistician");
		}

		const existing = await UserRepository.findByEmail(input.professionalEmail);

		if (existing) {
			throw new ConflictError('Cette adresse email est deja utilisee');
		}

		await UserRepository.create({
			professionalEmail: input.professionalEmail,
			role,
			password: await hashPassword(input.password),
		});

		// On ne renvoie pas de token : l'utilisateur doit se connecter.
		return { professionalEmail: input.professionalEmail, role };
	}

	async login(input: LoginInput) {
		const user = await UserRepository.findByEmailWithPassword(input.professionalEmail);

		// Meme message dans les deux cas pour ne pas reveler
		// quels emails existent reellement.
		const invalid = new UnauthorizedError('Identifiants invalides');

		if (!user) {
			await comparePassword(input.password, '$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv');
			throw invalid;
		}

		if (!(await comparePassword(input.password, user.password))) {
			logger.warn({ email: input.professionalEmail }, 'Echec de connexion');
			throw invalid;
		}

		if (!user.isActive) {
			throw new ForbiddenError('Ce compte est desactive');
		}

		return this.issueTokens(user.idUser, user.professionalEmail, user.role);
	}

	async refresh(refreshToken: string) {
		const payload = verifyRefreshToken(refreshToken);
		const tokenHash = hashToken(refreshToken);

		const user = await UserRepository.findByIdWithPassword(payload.sub);

		if (!user) {
			throw new UnauthorizedError('Session invalide');
		}

		if (user.refreshToken !== tokenHash) {
			// Jeton deja consomme ou vole : on invalide toute la session.
			await UserRepository.setRefreshToken(user.idUser, null);
			throw new UnauthorizedError('Session invalide, reconnectez-vous');
		}

		if (!user.isActive) {
			throw new ForbiddenError('Ce compte est desactive');
		}

		return this.issueTokens(user.idUser, user.professionalEmail, user.role);
	}

	async logout(idUser: number) {
		await UserRepository.setRefreshToken(idUser, null);
	}

	async changePassword(idUser: number, input: ChangePasswordInput) {
		const user = await UserRepository.findByIdWithPassword(idUser);

		if (!user) {
			throw new NotFoundError('Utilisateur');
		}

		if (!(await comparePassword(input.currentPassword, user.password))) {
			throw new UnauthorizedError('Mot de passe actuel incorrect');
		}

		await UserRepository.update(idUser, { password: await hashPassword(input.newPassword) });
		// Le changement de mot de pave invalide toutes les sessions ouvertes.
		await UserRepository.setRefreshToken(idUser, null);

		return { message: 'Mot de passe modifie, reconnectez-vous' };
	}

	private async issueTokens(idUser: number, email: string, role: user_role) {
		const jti = createTokenId();
		const refreshToken = signRefreshToken({ id: idUser, jti });

		await UserRepository.setRefreshToken(idUser, hashToken(refreshToken));

		return {
			accessToken: signAccessToken({ id: idUser, email, role }),
			refreshToken,
			tokenType: 'Bearer' as const,
			expiresIn: env.JWT_ACCESS_EXPIRES_IN,
		};
	}
}

export default new AuthService();
