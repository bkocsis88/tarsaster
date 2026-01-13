const express = require('express');
const request = require('supertest');
const api = require('../../api/api');

jest.mock('../../api/db', () => ({
  query: jest.fn()
}));

describe('Owned boardgames endpoints', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use('/api', api);
  });

  it('POST /owned/:id → 401 if not logged in', async () => {
    const res = await request(app).post('/api/owned/1');
    expect(res.status).toBe(401);
  });

  it('DELETE /owned/:id → 401 if not logged in', async () => {
    const res = await request(app).delete('/api/owned/1');
    expect(res.status).toBe(401);
  });
});
