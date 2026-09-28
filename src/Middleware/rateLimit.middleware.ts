import rateLimit from 'express-rate-limit';
import type { Request } from 'express';
import { env } from '../Config/env.js';

function keyGenerator(req: Request): string {
	return req.auth?.email ?? req.ip ?? 'unknown';
}

const shared = {
	standardHeaders: 'draft-7' as const,
	legacyHeaders: false,
	keyGenerator,
	handler: (_req: Request, res: { status: (code: number) => { json: (body: unknown) => void } }) => {
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

export const authLimiter = rateLimit({
	...shared,
	windowMs: env.RATE_LIMIT_WINDOW_MS,
	limit: env.AUTH_RATE_LIMIT_MAX,
	skipSuccessfulRequests: true,
});
