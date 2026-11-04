import type { TransactionInput } from './transactions.schemas.js';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../lib/HttpError.js';

async function assertOwnAccountAndCategory(
  userId: string,
  accountId: string,
  categoryId: string,
) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) throw new HttpError(404, 'Account not found');
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });
  if (!category) throw new HttpError(404, 'Category not found');
}

export async function createTransaction(
  userId: string,
  input: TransactionInput,
) {
  await assertOwnAccountAndCategory(userId, input.accountId, input.categoryId);
  return await prisma.transaction.create({
    data: {
      accountId: input.accountId,
      categoryId: input.categoryId,
      type: input.type,
      amount: input.amount,
      date: input.date,
      note: input.note ?? null,
    },
    select: {
      id: true,
      accountId: true,
      categoryId: true,
      type: true,
      amount: true,
      date: true,
      note: true,
    },
  });
}

export async function listTransactions(userId: string) {
  return await prisma.transaction.findMany({
    where: { account: { userId } },
    orderBy: { date: 'desc' },
    select: {
      id: true,
      accountId: true,
      categoryId: true,
      type: true,
      amount: true,
      date: true,
      note: true,
    },
  });
}

export async function deleteTransaction(userId: string, transactionId: string) {
  const result = await prisma.transaction.deleteMany({
    where: { id: transactionId, account: { userId } },
  });
  if (result.count === 0) throw new HttpError(404, 'Transaction not found');
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  input: TransactionInput,
) {
  const existing = await prisma.transaction.findFirst({
    where: { id: transactionId, account: { userId } },
  });
  if (!existing) throw new HttpError(404, 'Transaction not found');
  await assertOwnAccountAndCategory(userId, input.accountId, input.categoryId);
  const transaction = await prisma.transaction.update({
    where: { id: transactionId, account: { userId } },
    data: {
      accountId: input.accountId,
      categoryId: input.categoryId,
      type: input.type,
      amount: input.amount,
      date: input.date,
      note: input.note ?? null,
    },
    select: {
      id: true,
      accountId: true,
      categoryId: true,
      type: true,
      amount: true,
      date: true,
      note: true,
    },
  });
  return transaction;
}
