import { describe, it, expect, beforeEach } from 'vitest';
import {
  resetDb,
  createLoggedInAgent,
  createAccount,
} from '../../test/helpers.js';

describe('transfers', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('moves money between accounts', async () => {
    const alice = await createLoggedInAgent('alice@example.com');
    const aliceCard = await alice
      .post('/accounts')
      .send({ name: 'Card', currency: 'USD' });
    const aliceCash = await alice
      .post('/accounts')
      .send({ name: 'Cash', currency: 'USD' });
    const transfer = await alice.post('/transfers').send({
      fromAccountId: aliceCard.body.id,
      toAccountId: aliceCash.body.id,
      fromAmount: 50000,
      toAmount: 50000,
      date: '2026-11-08',
    });

    expect(transfer.status).toBe(201);
    const card = await alice.get(`/accounts/${aliceCard.body.id}`);
    expect(card.body.balance).toBe(-50000);
    const cash = await alice.get(`/accounts/${aliceCash.body.id}`);
    expect(cash.body.balance).toBe(50000);
  });
  it('returns 400 for a transfer to the same account', async () => {
    const alice = await createLoggedInAgent('alice@example.com');
    const cardId = await createAccount(alice, 'Card');

    const res = await alice.post('/transfers').send({
      fromAccountId: cardId,
      toAccountId: cardId,
      fromAmount: 50000,
      toAmount: 50000,
      date: '2026-11-08',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('returns 400 for different amounts in the same currency', async () => {
    const alice = await createLoggedInAgent('alice@example.com');
    const cardId = await createAccount(alice, 'Card');
    const cashId = await createAccount(alice, 'Cash');

    const res = await alice.post('/transfers').send({
      fromAccountId: cardId,
      toAccountId: cashId,
      fromAmount: 50000,
      toAmount: 60000,
      date: '2026-11-08',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Amounts must match for the same currency');
  });

  it('deletes both halves and restores balances', async () => {
    const alice = await createLoggedInAgent('alice@example.com');
    const cardId = await createAccount(alice, 'Card');
    const cashId = await createAccount(alice, 'Cash');
    const transfer = await alice
      .post('/transfers')
      .send({
        fromAccountId: cardId,
        toAccountId: cashId,
        fromAmount: 50000,
        toAmount: 50000,
        date: '2026-11-08',
      })
      .expect(201);

    const res = await alice.delete(`/transfers/${transfer.body.transferId}`);
    expect(res.status).toBe(204);

    const transactions = await alice.get('/transactions');
    expect(transactions.body).toHaveLength(0);

    const card = await alice.get(`/accounts/${cardId}`);
    const cash = await alice.get(`/accounts/${cashId}`);
    expect(card.body.balance).toBe(0);
    expect(cash.body.balance).toBe(0);
  });
});
