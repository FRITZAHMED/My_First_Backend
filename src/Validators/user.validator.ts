import { z } from 'zod';
import { envelope, pageQuery, passwordSchema, trimmedEmail } from './common.js';

const roleEnum = z.enum(['Administrator', 'Director', 'Manager', 'Logistician', 'Employer']);

export const createUserSchema = envelope({
	professionalEmail: trimmedEmail,
	password: passwordSchema,
	role: roleEnum.default('Employer'),
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
	query: z.object({}).passthrough().optional(),
	params: z.object({}).passthrough().optional(),
});

export const listUsersSchema = z.object({
	body: z.object({}).passthrough().optional(),
	query: z.object({ ...pageQuery, role: roleEnum.optional(), search: z.string().trim().max(150).optional() }),
	params: z.object({}).passthrough().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type ListUsersQuery = z.infer<typeof listUsersSchema>['query'];
