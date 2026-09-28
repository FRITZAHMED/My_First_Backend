import { z } from 'zod';

export const createAssignmentSchema = z.object({
	body: z.object({
		idRequest: z.number().int().positive('Demande invalide'),
		idLogistician: z.number().int().positive('Logisticien invalide'),
	}),
	query: z.object({}).optional(),
	params: z.object({}).optional(),
});

export const listAssignmentSchema = z.object({
	body: z.object({}).optional(),
	query: z.object({
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	}),
	params: z.object({}).optional(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>['body'];
export type ListAssignmentQuery = z.infer<typeof listAssignmentSchema>['query'];
