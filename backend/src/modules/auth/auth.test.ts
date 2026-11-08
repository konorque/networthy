import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

describe('POST /auth/register', () => {
  it('responds 400 for invalid email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'not-an-email', password: '12345678' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('responds 400 for invalid password', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'email@gmail.com', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});

describe('GET /auth/me', () => {
  it('responds 401 for Not authenticated', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Not authenticated' });
  });
});
