import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../lib/HttpError.js';
import type { RegisterInput, LoginInput } from './auth.schemas.js';
import { Prisma } from '../../generated/prisma/client.js';
import { randomUUID } from 'node:crypto';
import { seedDemoData } from './demo.seed.js';

export async function register(input: RegisterInput) {
  const passwordHash = await bcrypt.hash(input.password, 10);
  try {
    return await prisma.user.create({
      data: { email: input.email, passwordHash },
      select: { id: true, email: true, createdAt: true },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new HttpError(409, 'Email already in use');
    }
    throw err;
  }
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new HttpError(401, 'Invalid credentials');
  const compareHash = await bcrypt.compare(input.password, user.passwordHash);
  if (!compareHash) throw new HttpError(401, 'Invalid credentials');
  return { id: user.id, email: user.email };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, createdAt: true },
  });
  if (!user) throw new HttpError(401, 'Not authenticated');
  return user;
}

export async function createDemoUser() {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await prisma.transaction.deleteMany({
    where: {
      account: {
        user: {
          email: { endsWith: '@demo.networthy.app' },
          createdAt: { lt: dayAgo },
        },
      },
    },
  });
  await prisma.user.deleteMany({
    where: {
      email: { endsWith: '@demo.networthy.app' },
      createdAt: { lt: dayAgo },
    },
  });
  const email = `demo-${randomUUID()}@demo.networthy.app`;
  const passwordHash = await bcrypt.hash(randomUUID(), 10);
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true },
    });
    await seedDemoData(tx, user.id);
    return user;
  });
}
