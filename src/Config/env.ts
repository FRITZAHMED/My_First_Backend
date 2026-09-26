import 'dotenv/config';
import { z } from 'zod';
 
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(7),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});
 
const parsed = envSchema.safeParse(process.env);
 
if (!parsed.success) {
  console.error("Variables d'environnement invalides :");
  console.error(parsed.error.format());
  process.exit(1);
}
 
export const env = parsed.data;