import { z } from 'zod';
import { envelope, pageQuery } from './common.js';

export const licenseStatusEnum = z.enum(['ACTIVE', 'EXPIRED', 'SUSPENDED']);

export const createLicenseSchema = envelope({
	licenseNumber: z.string(),
	status: licenseStatusEnum.default('ACTIVE'),
	idEquipment: z.coerce.number(),
});

export const updateLicenseSchema = z.object({
	body: z.object({licenseNumber: z.string(),
			status: licenseStatusEnum,
			idEquipment: z.coerce.number(),
		})
		.refine((value) => Object.keys(value).length > 0, { message: 'Au moins un champ doit etre fourni' }),
	query: z.object({}).passthrough().optional(),
	params: z.object({}).passthrough().optional(),
});

export const listLicensesSchema = z.object({
	body: z.object({}).passthrough().optional(),
	query: z.object({ ...pageQuery, status: licenseStatusEnum.optional(), equipmentId: z.coerce.number().int().positive().optional() }),
	params: z.object({}).passthrough().optional(),
});

export type CreateLicenseInput = z.infer<typeof createLicenseSchema>['body'];
export type UpdateLicenseInput = z.infer<typeof updateLicenseSchema>['body'];
export type ListLicensesInput = z.infer<typeof listLicensesSchema>['query'];