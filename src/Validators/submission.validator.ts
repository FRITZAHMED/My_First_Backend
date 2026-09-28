import { z } from 'zod';

export const createSubmissionSchema = z.object({
	body: z.object({
		idRequest: z.number().int().positive('Demande invalide'),
	}),
	query: z.object({}).optional(),
	params: z.object({}).optional(),
});

export const listSubmissionSchema = z.object({
	body: z.object({}).optional(),
	query: z.object({
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
		idRequest: z.coerce.number().int().positive().optional(),
	}),
	params: z.object({}).optional(),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>['body'];
export type ListSubmissionQuery = z.infer<typeof listSubmissionSchema>['query'];
