import type { TransferInput } from './transfers.schemas.js';
import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../lib/HttpError.js';
import { randomUUID } from 'node:crypto';

export async function createTransfer(userId: string, input: TransferInput) {
  const accountOut = await prisma.account.findFirst({
    where: { id: input.fromAccountId, userId },
  });
  if (!accountOut) throw new HttpError(404, 'Account not found');
  const accountIn = await prisma.account.findFirst({
    where: { id: input.toAccountId, userId },
  });
  if (!accountIn) throw new HttpError(404, 'Account not found');

  if (
    accountOut.currency === accountIn.currency &&
    input.fromAmount !== input.toAmount
  )
    throw new HttpError(400, 'Amounts must match for the same currency');

  const transferId = randomUUID();

  const [outRecord, inRecord] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        accountId: input.fromAccountId,
        type: 'TRANSFER_OUT',
        amount: input.fromAmount,
        date: input.date,
        note: input.note ?? null,
        transferId,
      },
    }),
    prisma.transaction.create({
      data: {
        accountId: input.toAccountId,
        type: 'TRANSFER_IN',
        amount: input.toAmount,
        date: input.date,
        note: input.note ?? null,
        transferId,
      },
    }),
  ]);
  return { transferId, outRecord, inRecord };
}

export async function deleteTransfer(userId: string, transferId: string) {
  const result = await prisma.transaction.deleteMany({
    where: { transferId, account: { userId } },
  });
  if (result.count === 0) throw new HttpError(404, 'Transfer not found');
}
