import { z } from 'zod';
export const LogisticDepartementSchema = z.object({
    ID_ServiceLogistique: z.number().int().positive().optional(),
    ID_Demande: z.number().int().positive(),
    Email_Professionnel: z.string().trim().email().max(150),
    Mot_Passe: z.string().min(8).max(255),
});
export const CreateLogisticDepartement = LogisticDepartementSchema.omit({
    ID_ServiceLogistique: true,
});
export const UpdateLogisticDepartement = CreateLogisticDepartement.partial();
