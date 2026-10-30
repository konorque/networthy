import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../lib/HttpError.js';
import type { RegisterInput, LoginInput } from './auth.schemas.js';
import { Prisma } from '../../generated/prisma/client.js';

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
