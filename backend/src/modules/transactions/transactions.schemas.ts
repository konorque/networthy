import { z } from 'zod';

export const transactionInputSchema = z.object({
  accountId: z.uuid(),
  categoryId: z.uuid(),
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().int().positive().max(2_147_483_647),
  date: z.coerce.date(),
  note: z.string().trim().max(200).optional(),
});

export const transactionIdSchema = z.object({
  id: z.uuid(),
});

export type TransactionInput = z.infer<typeof transactionInputSchema>;
