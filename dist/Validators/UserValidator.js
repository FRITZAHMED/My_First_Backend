import { z } from 'zod';
const UserSchema = z.object({
    id_User: z.number(),
    Profesionnal_Email: z.string().max(8),
    Password: z.string().max(8),
    Role: z.enum([
        'Employer',
        'LogisticDepartement',
        'Manager',
        'Responsable',
        'AdministrationDepartement'
    ]),
});
export const CreateUser = z.object(UserSchema);
export const UpdateUser = CreateUser.partial();
export const UpdateProfile = z.object({
    Profesionnal_Email: UserSchema.optional,
    Password: UserSchema.optional,
});
