import { z } from 'zod';
import { passwordSchema, trimmedEmail } from './common.js';

export const registerSchema = z.object({
	body: z.object({
		professionalEmail: trimmedEmail,
		password: passwordSchema,
		role: z.enum(['Administrator', 'Director', 'Manager', 'Logistician', 'Employer']).default('Employer'),
	}),
	query: z.object({}).optional(),
	params: z.object({}).optional(),
});

export const loginSchema = z.object({
	body: z.object({
		professionalEmail: trimmedEmail,
		password: z.string().min(1, 'Mot de passe obligatoire').max(72),
	}),
	query: z.object({}).optional(),
	params: z.object({}).optional(),
});

export const refreshSchema = z.object({
	body: z.object({
		refreshToken: z.string().min(20, 'Refresh token invalide'),
	}),
	query: z.object({}).optional(),
	params: z.object({}).optional(),
});

export const changePasswordSchema = z.object({
	body: z.object({
		currentPassword: z.string().min(1, 'Mot de passe actuel obligatoire'),
		newPassword: passwordSchema,
	}),
	query: z.object({}).optional(),
	params: z.object({}).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshInput = z.infer<typeof refreshSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
