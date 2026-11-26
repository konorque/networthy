import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { resetDb, createLoggedInAgent, createAccount } from '../../test/helpers.js';

const DEMO_EMAIL = /@demo\.networthy\.app$/;
const TWO_DAYS_AGO = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

describe('POST /api/auth/demo', () => {
  beforeEach(resetDb);

  it('creates a logged-in demo user with seeded data', async () => {
    const agent = request.agent(app);
    const res = await agent.post('/api/auth/demo').expect(201);
    expect(res.body.email).toMatch(DEMO_EMAIL);

    // Cookie was set: the same agent can read its own data
    const accounts = await agent.get('/api/accounts').expect(200);
    expect(accounts.body).toHaveLength(3);

    const transactions = await agent.get('/api/transactions').expect(200);
    // 31 income/expense rows + 2 transfers x 2 halves
    expect(transactions.body).toHaveLength(35);
  });

  it('removes only demo users older than a day, never real users', async () => {
    // A real user with data, made "old" on purpose: only the email must protect it
    const realAgent = await createLoggedInAgent('real@example.com');
    await createAccount(realAgent, 'Real account');
    await prisma.user.update({
      where: { email: 'real@example.com' },
      data: { createdAt: TWO_DAYS_AGO },
    });

    // An old demo user (with seeded transactions that must be cleaned up too)
    const oldDemo = await request(app).post('/api/auth/demo').expect(201);
    await prisma.user.update({
      where: { id: oldDemo.body.id },
      data: { createdAt: TWO_DAYS_AGO },
    });

    // A fresh demo user that must survive
    const freshDemo = await request(app).post('/api/auth/demo').expect(201);

    // The next demo request triggers the cleanup
    await request(app).post('/api/auth/demo').expect(201);

    expect(await prisma.user.findUnique({ where: { id: oldDemo.body.id } })).toBeNull();
    expect(await prisma.user.findUnique({ where: { id: freshDemo.body.id } })).not.toBeNull();
    expect(await prisma.user.findUnique({ where: { email: 'real@example.com' } })).not.toBeNull();
    expect(await prisma.account.count({ where: { name: 'Real account' } })).toBe(1);
  });
});
