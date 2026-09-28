import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { env } from '../Config/env.js';

/**
 * On identifie le client par son email une fois authentifie, et par son IP
 * sinon. Derriere un reverse proxy, `trust proxy` est active dans server.ts,
 * ce qui rend `req.ip` fiable.
 */
function keyGenerator(req: Request): string {
	return req.auth?.email ?? req.ip ?? 'unknown';
}

const shared = {
	standardHeaders: 'draft-7' as const,
	legacyHeaders: false,
	keyGenerator,
	handler: (_req: Request, res: Response) => {
		res.status(429).json({
			success: false,
			code: 'TOO_MANY_REQUESTS',
			message: 'Trop de requetes, reessayez plus tard',
		});
	},
};

export const apiLimiter = rateLimit({
	...shared,
	windowMs: env.RATE_LIMIT_WINDOW_MS,
	limit: env.RATE_LIMIT_MAX,
});

/** Limite resserree sur /auth/login afin de freiner le brute force. */
export const authLimiter = rateLimit({
	...shared,
	windowMs: env.RATE_LIMIT_WINDOW_MS,
	limit: env.AUTH_RATE_LIMIT_MAX,
	skipSuccessfulRequests: true,
});
