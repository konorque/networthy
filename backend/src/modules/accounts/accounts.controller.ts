import type { Request, Response } from 'express';
import {
  createAccountSchema,
  accountIdSchema,
  updateAccountSchema,
} from './accounts.schemas.js';
import {
  createAccount,
  listAccounts,
  deleteAccount,
  updateAccount,
} from './accounts.service.js';

export async function createAccountHandler(req: Request, res: Response) {
  const userId = res.locals['userId'];
  const input = createAccountSchema.parse(req.body);
  const account = await createAccount(userId, input);
  res.status(201).json(account);
}

export async function listAccountsHandler(_req: Request, res: Response) {
  const userId = res.locals['userId'];
  const accounts = await listAccounts(userId);
  res.status(200).json(accounts);
}

export async function deleteAccountHandler(req: Request, res: Response) {
  const userId = res.locals['userId'];
  const input = accountIdSchema.parse(req.params);
  await deleteAccount(userId, input.id);
  res.status(204).end();
}

export async function updateAccountHandler(req: Request, res: Response) {
  const userId = res.locals['userId'];
  const params = accountIdSchema.parse(req.params);
  const input = updateAccountSchema.parse(req.body);
  const account = await updateAccount(userId, params.id, input);
  res.status(200).json(account);
}
