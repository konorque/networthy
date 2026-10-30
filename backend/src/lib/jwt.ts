import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from './HttpError.js';

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (typeof payload === 'string' || !payload.sub)
      throw new HttpError(401, 'Invalid token');
    return payload.sub;
  } catch {
    throw new HttpError(401, 'Invalid token');
  }
}
