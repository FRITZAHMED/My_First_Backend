import { z } from 'zod';

const trimmedEmail = z
	.string()
	.trim()
	.toLowerCase()
	.email('Adresse email invalide')
	.max(150, 'Adresse email trop longue (150 caracteres maximum)');

const password = z.string()
	.min(8, 'Le mot de passe doit faire au moins 8 caracteres');
/**
 * Le middleware `validate` attend un schema decrivant `{ body, query, params }`
 * et remplace chaque partie par sa version typee.
 *
 * Les parties que le schema ne valide pas doivent imperativement etre en
 * `.passthrough()` : une route peut enchainer deux validations (params puis
 * body). Avec un `z.object({})` strict, la seconde passe effacerait les
 * params deja valides par la premiere.
 */
export const envelope = <T extends z.ZodRawShape>(shape: T) =>
	z.object({
		body: z.object(shape),
		query: z.object({}).passthrough().optional(),
		params: z.object({}).passthrough().optional(),
	});

export const paramsOnly = <T extends z.ZodRawShape>(shape: T) =>
	z.object({
		body: z.object({}).passthrough().optional(),
		query: z.object({}).passthrough().optional(),
		params: z.object(shape),
	});

export const queryOnly = <T extends z.ZodRawShape>(shape: T) =>
	z.object({
		body: z.object({}).passthrough().optional(),
		query: z.object(shape),
		params: z.object({}).passthrough().optional(),
	});

export const idParams = paramsOnly({ id: z.coerce.number().int().positive('Identifiant invalide') });

export const idRequestParams = paramsOnly({
	idRequest: z.coerce.number().int().positive('Identifiant de demande invalide'),
});

export const idLogisticServiceParams = paramsOnly({
	idLogisticService: z.coerce.number().int().positive("Identifiant d'affectation invalide"),
});

export const idRequestAndUserParams = paramsOnly({
	idRequest: z.coerce.number(),
	idUser: z.coerce.number(),
});

const pageQuery = {
	page: z.coerce.number(),
	limit: z.coerce.number(),
};

export { pageQuery, password as passwordSchema, trimmedEmail };
