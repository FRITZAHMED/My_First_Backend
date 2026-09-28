import { z } from 'zod';

const trimmedEmail = z
	.string()
	.trim()
	.toLowerCase()
	.email('Adresse email invalide')
	.max(150, 'Adresse email trop longue (150 caracteres maximum)');

const password = z
	.string()
	.min(8, 'Le mot de passe doit faire au moins 8 caracteres')
	.max(72, 'Le mot de passe doit faire au plus 72 caracteres (limite bcrypt)');

/**
 * Le middleware `validate` attend un schema decrivant `{ body, query, params }`.
 * Ces helpers construisent donc des schemas de requete complets, ce qui evite
 * de repeter l'enveloppe a chaque fois et garantit que les controleurs ne
 recoivent que des donnees typees.
 */
const paramsOnly = <T extends z.ZodRawShape>(shape: T) =>
	z.object({
		body: z.object({}).passthrough().optional(),
		query: z.object({}).passthrough().optional(),
		params: z.object(shape),
	});

export const idParams = paramsOnly({ id: z.coerce.number().int().positive('Identifiant invalide') });

export const idRequestParams = paramsOnly({
	idRequest: z.coerce.number().int().positive('Identifiant de demande invalide'),
});

export const idLogisticServiceParams = paramsOnly({
	idLogisticService: z.coerce.number().int().positive("Identifiant d'affectation invalide"),
});

export const idRequestAndUserParams = paramsOnly({
	idRequest: z.coerce.number().int().positive('Identifiant de demande invalide'),
	idUser: z.coerce.number().int().positive('Identifiant utilisateur invalide'),
});

export { paramsOnly, password as passwordSchema, trimmedEmail };
