import { z } from 'zod';

export const BreakdownSchema = z.object({
  idBreakdown: z.number(),
  Label: z.string(),
  Description: z.string(),
});

export const CreateBreakdown = BreakdownSchema.omit({
  idBreakdown: true,
});

export const UpdateBreakdown = CreateBreakdown.partial();

export type Breakdown = z.infer<typeof BreakdownSchema>;
export type CreateBreakdownInput = z.infer<typeof CreateBreakdown>;
export type UpdateBreakdownInput = z.infer<typeof UpdateBreakdown>;
