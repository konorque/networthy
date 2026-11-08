import { describe, it, expect, beforeEach } from 'vitest';
import {
  resetDb,
  createLoggedInAgent,
  createAccount,
  createCategory,
} from '../../test/helpers.js';

describe('categories', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('returns 409 for a duplicate category name', async () => {
    const alice = await createLoggedInAgent('alice@example.com');
    await createCategory(alice, 'Food');

    const res = await alice.post('/categories').send({ name: 'Food' });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Category already exists');
  });

  it('returns 409 when deleting a category that has transactions', async () => {
    const alice = await createLoggedInAgent('alice@example.com');
    const accountId = await createAccount(alice, 'Card');
    const categoryId = await createCategory(alice, 'Food');
    await alice
      .post('/transactions')
      .send({ accountId, categoryId, type: 'EXPENSE', amount: 25000, date: '2026-11-08' })
      .expect(201);

    const res = await alice.delete(`/categories/${categoryId}`);
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Category has transactions');

    const list = await alice.get('/categories');
    expect(list.body).toHaveLength(1);
  });
});
