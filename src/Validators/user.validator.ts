import { z } from 'zod';
import { passwordSchema, trimmedEmail } from './common.js';

const roleEnum = z.enum(['Administrator', 'Director', 'Manager', 'Logistician', 'Employer']);

export const createUserSchema = z.object({
	body: z.object({
		professionalEmail: trimmedEmail,
		password: passwordSchema,
		role: roleEnum.default('Employer'),
	}),
	query: z.object({}).optional(),
	params: z.object({}).optional(),
});

export const updateUserSchema = z.object({
	body: z
		.object({
			professionalEmail: trimmedEmail.optional(),
			password: passwordSchema.optional(),
			role: roleEnum.optional(),
			isActive: z.boolean().optional(),
		})
		.refine((value) => Object.keys(value).length > 0, {
			message: 'Au moins un champ doit etre fourni',
		}),
	query: z.object({}).optional(),
	params: z.object({}).optional(),
});

export const listUsersSchema = z.object({
	body: z.object({}).optional(),
	query: z.object({
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
		role: roleEnum.optional(),
		search: z.string().trim().max(150).optional(),
	}),
	params: z.object({}).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type ListUsersQuery = z.infer<typeof listUsersSchema>['query'];
