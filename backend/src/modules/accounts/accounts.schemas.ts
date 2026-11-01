import { z } from 'zod';

const accountNameSchema = z.string().trim().min(1).max(50);
const currencySchema = z.enum(['USD', 'EUR', 'UAH']);

export const createAccountSchema = z.object({
  name: accountNameSchema,
  currency: currencySchema.default('USD'),
});

export const accountIdSchema = z.object({
  id: z.uuid(),
});

export const updateAccountSchema = z.object({
  name: accountNameSchema,
  currency: currencySchema,
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
