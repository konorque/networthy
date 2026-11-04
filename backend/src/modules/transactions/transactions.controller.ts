import type { Request, Response } from 'express';
import {
  transactionInputSchema,
  transactionIdSchema,
} from './transactions.schemas.js';
import {
  createTransaction,
  listTransactions,
  deleteTransaction,
  updateTransaction,
} from './transactions.service.js';

export async function createTransactionHandler(req: Request, res: Response) {
  const userId = res.locals['userId'];
  const input = transactionInputSchema.parse(req.body);
  const transaction = await createTransaction(userId, input);
  res.status(201).json(transaction);
}

export async function listTransactionsHandler(_req: Request, res: Response) {
  const userId = res.locals['userId'];
  const transactions = await listTransactions(userId);
  res.status(200).json(transactions);
}

export async function deleteTransactionHandler(req: Request, res: Response) {
  const userId = res.locals['userId'];
  const params = transactionIdSchema.parse(req.params);
  await deleteTransaction(userId, params.id);
  res.status(204).end();
}

export async function updateTransactionHandler(req: Request, res: Response) {
  const userId = res.locals['userId'];
  const params = transactionIdSchema.parse(req.params);
  const input = transactionInputSchema.parse(req.body);
  const transaction = await updateTransaction(userId, params.id, input);
  res.status(200).json(transaction);
}
