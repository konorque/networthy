import { z } from 'zod';

const amountSchema = z.number().int().positive().max(2_147_483_647);

export const transferInputSchema = z
  .object({
    fromAccountId: z.uuid(),
    toAccountId: z.uuid(),
    fromAmount: amountSchema,
    toAmount: amountSchema,
    date: z.coerce.date(),
    note: z.string().trim().max(200).optional(),
  })
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    message: 'Accounts must be different',
    path: ['toAccountId'],
  });

export const transferIdSchema = z.object({ id: z.uuid() });

export type TransferInput = z.infer<typeof transferInputSchema>;
