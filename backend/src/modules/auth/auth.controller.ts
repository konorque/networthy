import type { Request, Response } from 'express';
import { signToken } from '../../lib/jwt.js';
import { registerSchema, loginSchema } from './auth.schemas.js';
import { register, login, getMe } from './auth.service.js';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env['NODE_ENV'] === 'production',
};

export async function registerHandler(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const user = await register(input);
  res.status(201).json(user);
}

export async function loginHandler(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const user = await login(input);
  const token = signToken(user.id);
  res.cookie('token', token, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json(user);
}

export async function meHandler(_req: Request, res: Response) {
  const userId = res.locals['userId'];
  const user = await getMe(userId);
  res.status(200).json(user);
}

export function logoutHandler(_req: Request, res: Response) {
  res.clearCookie('token', cookieOptions);
  res.status(204).end();
}
