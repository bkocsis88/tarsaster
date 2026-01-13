const express = require('express');
const request = require('supertest');
const api = require('../../api/api');

jest.mock('../../api/db', () => ({
  query: jest.fn()
}));

const { query } = require('../../api/db');

describe('Wishlist endpoints', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use('/api', api);
  });

  beforeEach(() => query.mockReset());

  it('POST /wishlist/:id → 401 if not logged in', async () => {
    const res = await request(app).post('/api/wishlist/1');
    expect(res.status).toBe(401);
  });

  it('DELETE /wishlist/:id → 401 if not logged in', async () => {
    const res = await request(app).delete('/api/wishlist/1');
    expect(res.status).toBe(401);
  });
});
