import { Router } from 'express';
import {
  registerHandler,
  loginHandler,
  meHandler,
  logoutHandler,
} from './auth.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';

export const authRouter = Router();

authRouter.post('/register', registerHandler);
authRouter.post('/login', loginHandler);
authRouter.get('/me', requireAuth, meHandler);
authRouter.post('/logout', logoutHandler);
