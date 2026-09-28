import { z } from 'zod';
import { envelope, pageQuery } from './common.js';

const statusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);

export const createBreakdownSchema = envelope({
	label: z.string().trim().min(1, 'Libelle obligatoire').max(100),
	description: z.string().trim().max(2000).nullish(),
	idEquipment: z.number().int().positive().nullish(),
});

export const updateBreakdownSchema = z
	.object({
		body: z
			.object({
				label: z.string().trim().min(1).max(100).optional(),
				description: z.string().trim().max(2000).nullish(),
				status: statusEnum.optional(),
				idEquipment: z.number().int().positive().nullish(),
				resolvedAt: z.coerce.date().nullish(),
			})
			.refine((value) => Object.keys(value).length > 0, { message: 'Au moins un champ doit etre fourni' }),
		query: z.object({}).passthrough().optional(),
		params: z.object({}).passthrough().optional(),
	});

export const listBreakdownSchema = z.object({
	body: z.object({}).passthrough().optional(),
	query: z.object({ ...pageQuery, status: statusEnum.optional() }),
	params: z.object({}).passthrough().optional(),
});

export type CreateBreakdownInput = z.infer<typeof createBreakdownSchema>['body'];
export type UpdateBreakdownInput = z.infer<typeof updateBreakdownSchema>['body'];
export type ListBreakdownQuery = z.infer<typeof listBreakdownSchema>['query'];
