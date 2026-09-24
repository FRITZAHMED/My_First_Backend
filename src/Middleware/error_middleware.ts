import { ErrorRequestHandler } from 'express';
import { AppError } from '../Utils/AppError.js';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	const statusCode = err instanceof AppError ? err.statusCode : 500;
	const message = err instanceof Error ? err.message : 'Erreur interne du serveur';

	res.status(statusCode).json({
		success: false,
		message,
		stack: process.env.NODE_ENV === 'development' && err instanceof Error ? err.stack : undefined,
	});
};

export default errorHandler;