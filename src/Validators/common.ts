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

const idParams = z.object({
	id: z.coerce.number().int().positive('Identifiant invalide'),
});

const idUserParams = z.object({
	idUser: z.coerce.number().int().positive('Identifiant utilisateur invalide'),
});

const idRequestParams = z.object({
	idRequest: z.coerce.number().int().positive('Identifiant de demande invalide'),
});

const idRequestAndUserParams = idRequestParams.merge(idUserParams);

const idLogisticServiceParams = z.object({
	idLogisticService: z.coerce.number().int().positive('Identifiant de service logistique invalide'),
});

export {
	idParams,
	idUserParams,
	idRequestParams,
	idRequestAndUserParams,
	idLogisticServiceParams,
	password as passwordSchema,
	trimmedEmail,
};
