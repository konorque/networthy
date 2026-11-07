import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import {
  createTransferHandler,
  deleteTransferHandler,
} from './transfers.controller.js';

export const transfersRouter = Router();

transfersRouter.use(requireAuth);

transfersRouter.post('/', createTransferHandler);
transfersRouter.delete('/:id', deleteTransferHandler);
