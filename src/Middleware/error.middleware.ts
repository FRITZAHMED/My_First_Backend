import { Prisma } from '@prisma/client';
import type { ErrorRequestHandler, Request } from 'express';
import { env } from '../Config/env.js';
import { logger } from '../Config/logger.js';
import { AppError } from '../Utils/AppError.js';

interface NormalisedError {
	statusCode: number;
	code: string;
	message: string;
	details?: unknown;
}


function normalise(error: unknown): NormalisedError {
	if (error instanceof AppError) {
		return { statusCode: error.statusCode, code: error.code, message: error.message, details: error.details };
	}

	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		switch (error.code) {
			case 'P2002':
				return {
					statusCode: 409,
					code: 'CONFLICT',
					message: 'Une ressource avec ces donnees existe deja',
					details: { target: error.meta?.target },
				};
			case 'P2025':
				return { statusCode: 404, code: 'NOT_FOUND', message: 'Ressource n`as pas ete trouver' };
			case 'P2003':
				return { statusCode: 409, code: 'FOREIGN_KEY_CONFLICT', message: 'Ressource encore referencee' };
			default:
				break;
		}
	}

	if (error instanceof Prisma.PrismaClientValidationError) {
		return { statusCode: 400, code: 'INVALID_QUERY', message: 'Requete invalide' };
	}

	if (error instanceof Prisma.PrismaClientInitializationError) {
		return { statusCode: 503, code: 'DATABASE_UNAVAILABLE', message: 'Base de donnees indisponible' };
	}

	if (error instanceof SyntaxError && 'body' in (error as object)) {
		return { statusCode: 400, code: 'INVALID_JSON', message: 'Corps de requete JSON invalide' };
	}

	return {
		statusCode: 500,
		code: 'INTERNAL_ERROR',
		message: 'Erreur interne du serveur',
	};
}

export const notFoundHandler = (req: Request) => {
	const error = new AppError(`Route introuvable : ${req.method} ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND');
	error.statusCode = 404;
	throw error;
};

const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
	const { statusCode, code, message, details } = normalise(error);

	const logPayload = {
		err: error,
		code,
		statusCode,
		method: req.method,
		url: req.originalUrl,
		userId: req.auth?.idUser,
	};

	if (statusCode >= 500) {
		logger.error(logPayload, message);
	} else {
		logger.warn(logPayload, message);
	}

	res.status(statusCode).json({
		success: false,
		code,
		message,
		...(details !== undefined && { details }),
		...(env.NODE_ENV === 'development' && error instanceof Error && { stack: error.stack }),
	});
};

export default errorHandler;
