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
  const accounts = await prisma.account.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, currency: true, createdAt: true },
  });
  const incoming = await prisma.transaction.groupBy({
    by: ['accountId'],
    where: { account: { userId }, type: { in: ['INCOME', 'TRANSFER_IN'] } },
    _sum: { amount: true },
  });
  const outgoing = await prisma.transaction.groupBy({
    by: ['accountId'],
    where: { account: { userId }, type: { in: ['EXPENSE', 'TRANSFER_OUT'] } },
    _sum: { amount: true },
  });
  return accounts.map((account) => {
    const income =
      incoming.find((s) => s.accountId === account.id)?._sum.amount ?? 0;
    const expense =
      outgoing.find((s) => s.accountId === account.id)?._sum.amount ?? 0;
    return { ...account, balance: income - expense };
  });
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

export async function getAccount(userId: string, accountId: string) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
    select: { id: true, name: true, currency: true, createdAt: true },
  });
  if (!account) throw new HttpError(404, 'Account not found');
  const incomes = await prisma.transaction.aggregate({
    where: { accountId, type: { in: ['INCOME', 'TRANSFER_IN'] } },
    _sum: { amount: true },
  });
  const expenses = await prisma.transaction.aggregate({
    where: { accountId, type: { in: ['EXPENSE', 'TRANSFER_OUT'] } },
    _sum: { amount: true },
  });
  const balance = (incomes._sum.amount ?? 0) - (expenses._sum.amount ?? 0);
  return { ...account, balance };
}
