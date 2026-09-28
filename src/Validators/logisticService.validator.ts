import { z } from 'zod';
import { envelope, pageQuery } from './common.js';

export const createAssignmentSchema = envelope({
	idRequest: z.number().int().positive('Demande invalide'),
	idLogistician: z.number().int().positive('Logisticien invalide'),
});

export const listAssignmentSchema = z.object({
	body: z.object({}).passthrough().optional(),
	query: z.object({ ...pageQuery }),
	params: z.object({}).passthrough().optional(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>['body'];
export type ListAssignmentQuery = z.infer<typeof listAssignmentSchema>['query'];
