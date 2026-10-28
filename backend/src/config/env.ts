import { config } from 'dotenv';
import { z } from 'zod';

config({ path: '../.env' });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(3000),
});

export const env = envSchema.parse(process.env);
