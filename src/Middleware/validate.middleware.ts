import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import type { ZodTypeAny } from 'zod';
import { ValidationError } from '../Utils/AppError.js';

type RequestParts = {
	body?: unknown;
	query?: unknown;
	params?: unknown;
};

function toFieldErrors(error: ZodError): Array<{ field: string; message: string }> {
	return error.issues.map((issue) => ({
		field: issue.path.join('.') || '(racine)',
		message: issue.message,
	}));
}

const validate =
	(schema: ZodTypeAny) =>
	(req: Request, _res: Response, next: NextFunction): void => {
		try {
			const parsed = schema.parse({
				body: req.body,
				query: req.query,
				params: req.params,
			}) as RequestParts;

			if (parsed.body !== undefined) req.body = parsed.body;
			if (parsed.query !== undefined) req.query = parsed.query as Request['query'];
			if (parsed.params !== undefined) req.params = parsed.params as Request['params'];

			next();
		} catch (error) {
			if (error instanceof ZodError) {
				next(new ValidationError('Erreur de validation des donnees', toFieldErrors(error)));
				return;
			}
			next(error);
		}
	};

export default validate;
