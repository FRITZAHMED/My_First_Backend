import { z } from 'zod';

const statusEnum = z.enum(['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED']);

export const createEquipmentSchema = z.object({
	body: z.object({
		description: z.string().trim().min(1, 'Description obligatoire').max(255).optional(),
		serialNumber: z.string().trim().min(1).max(100).optional(),
		status: statusEnum.default('AVAILABLE'),
		idUser: z.number().int().positive().nullish(),
	}),
	query: z.object({}).optional(),
	params: z.object({}).optional(),
});

export const updateEquipmentSchema = z.object({
	body: z
		.object({
			description: z.string().trim().min(1).max(255).optional(),
			serialNumber: z.string().trim().min(1).max(100).optional(),
			status: statusEnum.optional(),
			idUser: z.number().int().positive().nullish(),
		})
		.refine((value) => Object.keys(value).length > 0, { message: 'Au moins un champ doit etre fourni' }),
	query: z.object({}).optional(),
	params: z.object({}).optional(),
});

export const listEquipmentSchema = z.object({
	body: z.object({}).optional(),
	query: z.object({
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
		status: statusEnum.optional(),
	}),
	params: z.object({}).optional(),
});

export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>['body'];
export type UpdateEquipmentInput = z.infer<typeof updateEquipmentSchema>['body'];
export type ListEquipmentQuery = z.infer<typeof listEquipmentSchema>['query'];
