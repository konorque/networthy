import { afterAll } from 'vitest';
import { getTestDatabaseUrl } from './testEnv.js';

process.env['DATABASE_URL'] = getTestDatabaseUrl();

afterAll(async () => {
  const { prisma } = await import('../lib/prisma.js');
  await prisma.$disconnect();
});
