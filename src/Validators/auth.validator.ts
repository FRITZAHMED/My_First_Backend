import { z } from 'zod';
import { envelope, passwordSchema, trimmedEmail } from './common.js';

export const registerSchema = envelope({
	professionalEmail: trimmedEmail,
	password: passwordSchema,
	role: z.enum(['Administrator', 'Director', 'Manager', 'Logistician', 'Employer']).default('Employer'),
});

export const loginSchema = envelope({
	professionalEmail: trimmedEmail,
	password: z.string().min(1, 'Mot de passe obligatoire').max(72),
});

export const refreshSchema = envelope({
	refreshToken: z.string().min(20, 'Refresh token invalide'),
});

export const changePasswordSchema = envelope({
	currentPassword: z.string().min(1, 'Mot de passe actuel obligatoire'),
	newPassword: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshInput = z.infer<typeof refreshSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
