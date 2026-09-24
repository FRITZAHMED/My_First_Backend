import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

type ValidatedRequestParts = {
	body: unknown;
	query: unknown;
	params: unknown;
};

const validate = (schema: z.ZodTypeAny) => async (req: Request, res: Response, next: NextFunction) => {
	try {
		const parsed = await schema.parseAsync({
			body: req.body,
			query: req.query,
			params: req.params,
		}) as ValidatedRequestParts;

		if (parsed.body) req.body = parsed.body;
		if (parsed.params) req.params = parsed.params as typeof req.params;
		if (parsed.query) req.query = parsed.query as typeof req.query;
		return next();
	} catch (error: unknown) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({
				success: false,
				message: 'Erreur de validation des données',
				errors: error.issues.map((issue) => ({
					field: issue.path.join('.'),
					message: issue.message,
				})),
			});
		}
		return next(error);
	}
};

export default validate;