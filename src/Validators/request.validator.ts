import { z } from 'zod';
import { envelope, pageQuery } from './common.js';

export const createRequestSchema = envelope({
	description: z.string().trim().min(1, 'Description obligatoire').max(2000).optional(),
});

export const updateRequestSchema = z
	.object({
		body: z
			.object({
				description: z.string().trim().min(1).max(2000).optional(),
			})
			.refine((value) => Object.keys(value).length > 0, { message: 'Au moins un champ doit etre fourni' }),
		query: z.object({}).passthrough().optional(),
		params: z.object({}).passthrough().optional(),
	});

export const listRequestSchema = z.object({
	body: z.object({}).passthrough().optional(),
	query: z.object({ ...pageQuery }),
	params: z.object({}).passthrough().optional(),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>['body'];
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>['body'];
export type ListRequestQuery = z.infer<typeof listRequestSchema>['query'];
