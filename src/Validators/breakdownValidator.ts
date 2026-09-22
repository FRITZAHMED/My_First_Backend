import { z } from 'zod';

export const BreakdownSchema = z.object({
  ID_Panne: z.number(),
  Libelle: z.string(),
  Description: z.string(),
});

export const CreateBreakdown = BreakdownSchema.omit({
  ID_Panne: true,
});

export const UpdateBreakdown = CreateBreakdown.partial();

export type Breakdown = z.infer<typeof BreakdownSchema>;
export type CreateBreakdownInput = z.infer<typeof CreateBreakdown>;
export type UpdateBreakdownInput = z.infer<typeof UpdateBreakdown>;
