import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { connectDB, disconnectDB } from './Config/Database.js';
import { env } from './Config/env.js';
import { logger } from './Config/logger.js';
import swaggerSpec from './Docs/swagger.js';
import errorHandler, { notFoundHandler } from './Middleware/error.middleware.js';
// import { apiLimiter } from './Middleware/rateLimit.middleware.js';
import routes from './routes/index.js';

export function createApp() {
	const app = express();

	app.set('trust proxy', 1);
	app.disable('x-powered-by');

	app.use(helmet());
	app.use(
		cors({
			origin: env.corsOrigins,
			credentials: true,
			methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
		}),
	);
	app.use(
		pinoHttp({
			logger,
			autoLogging: { ignore: (req) => req.url === '/api/health' },
			customLogLevel: (_req, res, err) => {
				if (err || res.statusCode >= 500) return 'error';
				if (res.statusCode >= 400) return 'warn';
				return 'info';
			},
		}),
	);
	app.use(compression());
	app.use(express.json({ limit: '100kb' }));
	app.use(express.urlencoded({ extended: true, limit: '100kb' }));
	app.use(hpp());
	// app.use('/api', apiLimiter);

	app.get('/', (_req, res) => {
		res.json( { name: 'RHopenLabs API', docs: '/api-docs Swagger' });
	});

	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
	app.use('/api', routes);

	app.use(notFoundHandler);
	app.use(errorHandler);

	return app;
}

const app = createApp();

const server = app.listen(env.PORT, () => {
	logger.info({ port: env.PORT }, `API demarree sur http://localhost:${env.PORT}`);
	logger.info({ docs: `http://localhost:${env.PORT}/api-docs` }, 'Documentation Swagger disponible');
});

async function bootstrap() {
	try {
		await connectDB();
	} catch (error) {
		logger.error({ err: error }, 'Impossible de se connecter a la base de donnees');
		process.exit(1);
	}
}

void bootstrap();

async function shutdown(signal: string) {
	logger.info({ signal }, 'Arret en cours...');
	server.close();
	await disconnectDB().catch(() => undefined);
	process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
	logger.error({ err: reason }, 'Promesse rejetee non geree');
});

process.on('uncaughtException', (error) => {
	logger.fatal({ err: error }, 'Exception non interceptee, arret du processus');
	process.exit(1);
});

export default app;
