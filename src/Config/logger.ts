import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
	level: env.isProduction ? 'info' : 'debug',
	base: undefined,
	redact: {
		paths: [
			'req.headers.authorization',
			'req.headers.cookie',
			'req.body.password',
			'req.body.refreshToken',
			'res.headers["set-cookie"]',
			'*.password',
			'*.refreshToken',
		],
		censor: '[REDACTED]',
	},
	transport: env.isProduction
		? undefined
		: { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } },
});
