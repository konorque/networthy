import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import {
  createAccountHandler,
  listAccountsHandler,
  deleteAccountHandler,
  updateAccountHandler,
  getAccountHandler,
} from './accounts.controller.js';

export const accountsRouter = Router();

accountsRouter.use(requireAuth);

accountsRouter.post('/', createAccountHandler);
accountsRouter.get('/', listAccountsHandler);
accountsRouter.get('/:id', getAccountHandler);
accountsRouter.delete('/:id', deleteAccountHandler);
accountsRouter.put('/:id', updateAccountHandler);
