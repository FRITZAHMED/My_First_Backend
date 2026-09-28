import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	PORT: z.coerce.number(),
	DATABASE_URL: z.string(),
	JWT_ACCESS_SECRET: z.string(),
	JWT_REFRESH_SECRET: z.string(),
	JWT_ACCESS_EXPIRES_IN: z.string(),
	JWT_REFRESH_EXPIRES_IN: z.string(),
	CORS_ORIGINS: z.string().default('http://localhost:5173'),
	RATE_LIMIT_WINDOW_MS: z.coerce.number(),
	RATE_LIMIT_MAX: z.coerce.number(),
	AUTH_RATE_LIMIT_MAX: z.coerce.number(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	console.error("Variables d'environnement invalides :");
	console.error(parsed.error.format());
	process.exit(1);
}

const data = parsed.data;

export const env = {
	...data,
	isProduction: data.NODE_ENV === 'production',
	corsOrigins: data.CORS_ORIGINS.split(',')
		.map((origin) => origin.trim())
		.filter(Boolean),
};

export type Env = typeof env;
