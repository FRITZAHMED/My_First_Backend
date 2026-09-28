import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { logger } from './logger.js';

export const prisma = new PrismaClient({
	log: env.isProduction ? ['error'] : ['warn', 'error'],
});

export async function connectDB(): Promise<void> {
	await prisma.$connect();
	logger.info('Connexion a la base de donnees etablie');
}

export async function disconnectDB(): Promise<void> {
	await prisma.$disconnect();
	logger.info('Connexion a la base de donnees fermee');
}
