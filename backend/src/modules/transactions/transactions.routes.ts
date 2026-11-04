import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import {
  createTransactionHandler,
  listTransactionsHandler,
  deleteTransactionHandler,
  updateTransactionHandler,
} from './transactions.controller.js';

export const transactionsRouter = Router();

transactionsRouter.use(requireAuth);

transactionsRouter.post('/', createTransactionHandler);
transactionsRouter.get('/', listTransactionsHandler);
transactionsRouter.delete('/:id', deleteTransactionHandler);
transactionsRouter.put('/:id', updateTransactionHandler);
