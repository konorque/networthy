import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb, createLoggedInAgent } from '../../test/helpers.js';

describe('accounts', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('creates an account and lists it with zero balance', async () => {
    const agent = await createLoggedInAgent();

    const created = await agent
      .post('/accounts')
      .send({ name: 'Card', currency: 'USD' });
    expect(created.status).toBe(201);

    const list = await agent.get('/accounts');
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0]).toMatchObject({
      name: 'Card',
      currency: 'USD',
      balance: 0,
    });
  });

  it('does not list other users accounts', async () => {
    const alice = await createLoggedInAgent('alice@example.com');
    const bob = await createLoggedInAgent('bob@example.com');

    const aliceCreated = await alice
      .post('/accounts')
      .send({ name: 'Card', currency: 'USD' });
    expect(aliceCreated.status).toBe(201);

    const bobList = await bob.get('/accounts');
    expect(bobList.status).toBe(200);
    expect(bobList.body).toHaveLength(0);
  });

  it('returns 404 when deleting other users account', async () => {
    const alice = await createLoggedInAgent('alice@example.com');
    const bob = await createLoggedInAgent('bob@example.com');

    const aliceCreated = await alice
      .post('/accounts')
      .send({ name: 'Card', currency: 'USD' });
    expect(aliceCreated.status).toBe(201);

    const res = await bob.delete(`/accounts/${aliceCreated.body.id}`);
    expect(res.status).toBe(404);
    const aliceList = await alice.get('/accounts');
    expect(aliceList.body).toHaveLength(1);
  });
});
