import type {
  CreateAccountInput,
  UpdateAccountInput,
} from './accounts.schemas.js';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../lib/HttpError.js';

export async function createAccount(userId: string, input: CreateAccountInput) {
  const account = await prisma.account.create({
    data: { name: input.name, currency: input.currency, userId },
    select: { id: true, name: true, currency: true, createdAt: true },
  });
  return account;
}

export async function listAccounts(userId: string) {
  const list = await prisma.account.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, currency: true, createdAt: true },
  });
  return list;
}

export async function deleteAccount(userId: string, accountId: string) {
  const result = await prisma.account.deleteMany({
    where: { id: accountId, userId },
  });
  if (result.count === 0) throw new HttpError(404, 'Account not found');
}

export async function updateAccount(
  userId: string,
  accountId: string,
  input: UpdateAccountInput,
) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) throw new HttpError(404, 'Account not found');
  const result = await prisma.account.update({
    where: { id: accountId },
    data: { name: input.name, currency: input.currency },
    select: { id: true, name: true, currency: true, createdAt: true },
  });
  return result;
}
