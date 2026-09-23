import { z } from 'zod';
export const RequestSchema = z.object({
    ID_Demande: z.number(),
    Description: z.string().max(100),
    Date_Creation: z.coerce.date(),
});
export const CreateRequest = RequestSchema.omit({
    ID_Demande: true,
});
export const UpdateRequest = CreateRequest.partial();
