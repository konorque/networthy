import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import {
  createAccountHandler,
  listAccountsHandler,
  deleteAccountHandler,
  updateAccountHandler,
} from './accounts.controller.js';

export const accountsRouter = Router();

accountsRouter.use(requireAuth);

accountsRouter.post('/', createAccountHandler);
accountsRouter.get('/', listAccountsHandler);
accountsRouter.delete('/:id', deleteAccountHandler);
accountsRouter.put('/:id', updateAccountHandler);
