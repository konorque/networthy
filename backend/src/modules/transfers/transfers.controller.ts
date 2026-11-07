import type { Request, Response } from 'express';
import { transferInputSchema, transferIdSchema } from './transfers.schemas.js';
import { createTransfer, deleteTransfer } from './transfers.service.js';

export async function createTransferHandler(req: Request, res: Response) {
  const userId = res.locals['userId'];
  const input = transferInputSchema.parse(req.body);
  const transfer = await createTransfer(userId, input);
  res.status(201).json(transfer);
}

export async function deleteTransferHandler(req: Request, res: Response) {
  const userId = res.locals['userId'];
  const params = transferIdSchema.parse(req.params);
  await deleteTransfer(userId, params.id);
  res.status(204).end();
}
