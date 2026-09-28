import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Evite d'avoir a entourer chaque controller d'un try/catch :
 * toute promesse rejetee est transmise automatiquement a `next(error)`.
 */
export const asyncHandler =
	(handler: AsyncRequestHandler): RequestHandler =>
	(req, res, next) => {
		void Promise.resolve(handler(req, res, next)).catch(next);
	};
