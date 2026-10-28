import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../lib/HttpError.js';
import type { RegisterInput } from './auth.schemas.js';
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
