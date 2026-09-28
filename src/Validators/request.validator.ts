import { z } from 'zod';

export const createRequestSchema = z.object({
	body: z.object({
		description: z.string().trim().min(1, 'Description obligatoire').max(2000).optional(),
	}),
	query: z.object({}).optional(),
	params: z.object({}).optional(),
});

export const updateRequestSchema = z.object({
	body: z
		.object({
			description: z.string().trim().min(1).max(2000).optional(),
		})
		.refine((value) => Object.keys(value).length > 0, { message: 'Au moins un champ doit etre fourni' }),
	query: z.object({}).optional(),
	params: z.object({}).optional(),
});

export const listRequestSchema = z.object({
	body: z.object({}).optional(),
	query: z.object({
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	}),
	params: z.object({}).optional(),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>['body'];
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>['body'];
export type ListRequestQuery = z.infer<typeof listRequestSchema>['query'];
