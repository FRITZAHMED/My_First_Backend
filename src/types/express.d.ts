import type { user_role } from '@prisma/client';

declare global {
	namespace Express {
		interface Request {
			auth?: {
				idUser: number;
				email: string;
				role: user_role;
			};
		}
	}
}

export {};
