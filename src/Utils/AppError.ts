export class AppError extends Error {
	constructor(
		message: string,
		public readonly statusCode: number = 500,
		public readonly code: string = 'INTERNAL_ERROR',
		public readonly details?: unknown,
	) {
		super(message);
		this.name = 'AppError';
		Error.captureStackTrace(this, AppError);
	}
}

export class NotFoundError extends AppError {
	constructor(resource = 'Ressource') {
		super(`${resource} introuvable`, 404, 'NOT_FOUND');
	}
}

export class ConflictError extends AppError {
	constructor(message: string) {
		super(message, 409, 'CONFLICT');
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = 'Authentification requise') {
		super(message, 401, 'UNAUTHORIZED');
	}
}

export class ForbiddenError extends AppError {
	constructor(message = 'Acces refuse') {
		super(message, 403, 'FORBIDDEN');
	}
}

export class ValidationError extends AppError {
	constructor(message: string, details?: unknown) {
		super(message, 400, 'VALIDATION_ERROR', details);
	}
}
