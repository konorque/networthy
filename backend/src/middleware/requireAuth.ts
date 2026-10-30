import type { Request, Response, NextFunction } from 'express';
import { HttpError } from '../lib/HttpError.js';
import { verifyToken } from '../lib/jwt.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies['token'];
  if (!token || typeof token !== 'string')
    throw new HttpError(401, 'Not authenticated');
  const userId = verifyToken(token);
  res.locals['userId'] = userId;
  next();
}
