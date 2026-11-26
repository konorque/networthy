import { Router } from 'express';
import {
  registerHandler,
  loginHandler,
  meHandler,
  logoutHandler,
  demoHandler,
} from './auth.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { authLimiter, demoLimiter } from '../../middleware/rateLimit.js';

export const authRouter = Router();

authRouter.post('/register', authLimiter, registerHandler);
authRouter.post('/demo', demoLimiter, demoHandler);
authRouter.post('/login', authLimiter, loginHandler);
authRouter.get('/me', requireAuth, meHandler);
authRouter.post('/logout', logoutHandler);
