import { z } from 'zod';

const statusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);

export const createBreakdownSchema = z.object({
	body: z.object({
		label: z.string().trim().min(1, 'Libelle obligatoire').max(100),
		description: z.string().trim().max(2000).nullish(),
		idEquipment: z.number().int().positive().nullish(),
	}),
	query: z.object({}).optional(),
	params: z.object({}).optional(),
});

export const updateBreakdownSchema = z.object({
	body: z
		.object({
			label: z.string().trim().min(1).max(100).optional(),
			description: z.string().trim().max(2000).nullish(),
			status: statusEnum.optional(),
			idEquipment: z.number().int().positive().nullish(),
			resolvedAt: z.coerce.date().nullish(),
		})
		.refine((value) => Object.keys(value).length > 0, { message: 'Au moins un champ doit etre fourni' }),
	query: z.object({}).optional(),
	params: z.object({}).optional(),
});

export const listBreakdownSchema = z.object({
	body: z.object({}).optional(),
	query: z.object({
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
		status: statusEnum.optional(),
	}),
	params: z.object({}).optional(),
});

export type CreateBreakdownInput = z.infer<typeof createBreakdownSchema>['body'];
export type UpdateBreakdownInput = z.infer<typeof updateBreakdownSchema>['body'];
export type ListBreakdownQuery = z.infer<typeof listBreakdownSchema>['query'];
