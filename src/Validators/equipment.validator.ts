import { z } from 'zod';
import { envelope, pageQuery } from './common.js';

const statusEnum = z.enum(['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED']);

export const createEquipmentSchema = envelope({
	description: z.string().trim().min(1, 'Description obligatoire').max(255).optional(),
	serialNumber: z.string().trim().min(1).max(100).optional(),
	status: statusEnum.default('AVAILABLE'),
	idUser: z.number().int().positive().nullish(),
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
	query: z.object({}).passthrough().optional(),
	params: z.object({}).passthrough().optional(),
});

export const listEquipmentSchema = z.object({
	body: z.object({}).passthrough().optional(),
	query: z.object({ ...pageQuery, status: statusEnum.optional() }),
	params: z.object({}).passthrough().optional(),
});

export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>['body'];
export type UpdateEquipmentInput = z.infer<typeof updateEquipmentSchema>['body'];
export type ListEquipmentQuery = z.infer<typeof listEquipmentSchema>['query'];
