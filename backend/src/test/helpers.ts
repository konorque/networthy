import request from 'supertest';
import app from '../app.js';
import { prisma } from '../lib/prisma.js';

type Agent = ReturnType<typeof request.agent>;

export async function resetDb() {
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
}

export async function createLoggedInAgent(
  email = 'test@example.com',
  password = 'password123',
) {
  const agent = request.agent(app);
  await agent.post('/auth/register').send({ email, password }).expect(201);
  await agent.post('/auth/login').send({ email, password }).expect(200);
  return agent;
}

export async function createAccount(agent: Agent, name: string, currency = 'USD') {
  const res = await agent.post('/accounts').send({ name, currency }).expect(201);
  return res.body.id as string;
}

export async function createCategory(agent: Agent, name: string) {
  const res = await agent.post('/categories').send({ name }).expect(201);
  return res.body.id as string;
}
