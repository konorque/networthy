import { describe, it, expect, beforeEach } from 'vitest';
import {
  resetDb,
  createLoggedInAgent,
  createAccount,
  createCategory,
} from '../../test/helpers.js';

describe('transactions', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("returns 404 when creating a transaction on another user's account", async () => {
    const alice = await createLoggedInAgent('alice@example.com');
    const bob = await createLoggedInAgent('bob@example.com');
    const aliceAccountId = await createAccount(alice, 'Card');
    const bobCategoryId = await createCategory(bob, 'Food');

    const res = await bob.post('/transactions').send({
      accountId: aliceAccountId,
      categoryId: bobCategoryId,
      type: 'EXPENSE',
      amount: 25000,
      date: '2026-11-08',
    });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Account not found');

    const aliceTransactions = await alice.get('/transactions');
    expect(aliceTransactions.body).toHaveLength(0);
  });

  it('returns 400 when deleting half of a transfer via /transactions', async () => {
    const alice = await createLoggedInAgent('alice@example.com');
    const cardId = await createAccount(alice, 'Card');
    const cashId = await createAccount(alice, 'Cash');
    await alice
      .post('/transfers')
      .send({
        fromAccountId: cardId,
        toAccountId: cashId,
        fromAmount: 50000,
        toAmount: 50000,
        date: '2026-11-08',
      })
      .expect(201);

    const list = await alice.get('/transactions');
    const half = list.body[0];

    const res = await alice.delete(`/transactions/${half.id}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Use /transfers to change a transfer');

    const after = await alice.get('/transactions');
    expect(after.body).toHaveLength(2);
  });
});
