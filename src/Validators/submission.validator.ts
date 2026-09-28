import { z } from 'zod';
import { envelope, pageQuery } from './common.js';

export const createSubmissionSchema = envelope({
	idRequest: z.number().int().positive('Demande invalide'),
});

export const listSubmissionSchema = z.object({
	body: z.object({}).passthrough().optional(),
	query: z.object({ ...pageQuery, idRequest: z.coerce.number().int().positive().optional() }),
	params: z.object({}).passthrough().optional(),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>['body'];
export type ListSubmissionQuery = z.infer<typeof listSubmissionSchema>['query'];
