import { z } from 'zod';

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1).max(50),
});

export const categoryIdSchema = z.object({
  id: z.uuid(),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
