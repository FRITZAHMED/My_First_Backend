import { Router } from 'express';
import { prisma } from '../Config/Database.js';
import { asyncHandler } from '../Utils/asyncHandler.js';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Systeme]
 *     summary: Sonde de disponibilite (utilisee par les orchestrateurs)
 *     responses:
 *       200: { description: Service et base de donnees operationnels }
 *       503: { description: Base de donnees injoignable }
 */
router.get(
	'/',
	asyncHandler(async (_req, res) => {
		const database = await prisma.$queryRaw`SELECT 1`.then(() => 'up' as const).catch(() => 'down' as const);

		res.status(database === 'up' ? 200 : 503).json({
			success: database === 'up',
			data: { status: database === 'up' ? 'ok' : 'degraded', database, uptime: process.uptime() },
		});
	}),
);

export default router;
