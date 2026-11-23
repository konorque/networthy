import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import { Router } from 'express';
import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { accountsRouter } from './modules/accounts/accounts.routes.js';
import { categoriesRouter } from './modules/categories/categories.routes.js';
import { transactionsRouter } from './modules/transactions/transactions.routes.js';
import { transfersRouter } from './modules/transfers/transfers.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const apiRouter = Router();

// Behind Render's proxy: trust one hop so req.ip (used by the rate limiter) is the real client IP
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(apiLimiter);
app.use(express.json());
app.use(cookieParser());
apiRouter.use('/auth', authRouter);
apiRouter.use('/accounts', accountsRouter);
apiRouter.use('/categories', categoriesRouter);
apiRouter.use('/transactions', transactionsRouter);
apiRouter.use('/transfers', transfersRouter);

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', apiRouter);
// Unknown /api/* path: JSON 404 instead of falling through to the frontend below
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Production: the same server also serves the built frontend (one origin, so cookies just work).
// Path works for both src/app.ts (tsx) and dist/app.js (compiled): both are 2 levels below the repo root.
if (process.env['NODE_ENV'] === 'production') {
  const frontendDist = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../frontend/dist',
  );
  app.use(express.static(frontendDist));
  // Any other path (/categories, /profile...) is a React Router page: return index.html
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}
app.use(errorHandler);

export default app;
