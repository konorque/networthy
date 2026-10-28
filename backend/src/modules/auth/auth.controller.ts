import type { Request, Response } from 'express';
import { registerSchema } from './auth.schemas.js';
import { register } from './auth.service.js';

export async function registerHandler(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const user = await register(input);
  res.status(201).json(user);
}
