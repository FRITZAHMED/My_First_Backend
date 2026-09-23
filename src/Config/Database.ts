import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { logger } from './logger.js';
 
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
 
export async function connectDB(): Promise<void> {
  await prisma.$connect();
  logger.info('Connexion à la base de données établie');
}
 
export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Connexion à la base de données fermée');
}