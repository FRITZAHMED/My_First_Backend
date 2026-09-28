import type { user_role } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../Utils/AppError.js';
import { verifyAccessToken } from '../Utils/jwt.js';

function extractToken(req: Request): string {
	const header = req.headers.authorization;

	if (header?.startsWith('Bearer ')) {
		return header.slice(7).trim();
	}

	throw new UnauthorizedError('En-tete Authorization: Bearer <token> manquant');
}

const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
	try {
		const payload = verifyAccessToken(extractToken(req));

		req.auth = {
			idUser: payload.sub,
			email: payload.email,
			role: payload.role as user_role,
		};

		next();
	} catch (error) {
		next(error);
	}
};

const requireRole =
	(...roles: user_role[]) =>
	(req: Request, _res: Response, next: NextFunction): void => {
		if (!req.auth) {
			next(new UnauthorizedError());
			return;
		}

		if (!roles.includes(req.auth.role)) {
			next(new ForbiddenError(`Acces reserve aux roles : ${roles.join(', ')}`));
			return;
		}

		next();
	};

export { authenticate, requireRole };
export default authenticate;
