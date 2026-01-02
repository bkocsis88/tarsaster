const express = require('express');
const request = require('supertest');
const api = require('../../api/api');

jest.mock('../../api/db', () => ({
  query: jest.fn()
}));

describe('Auth endpoints', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', api);
  });

  it('POST /login → 400 if missing credentials', async () => {
    const res = await request(app).post('/api/login').send({});
    expect(res.status).toBe(400);
  });

  it('POST /register → 400 if invalid input', async () => {
    const res = await request(app).post('/api/register').send({ email: 'bad' });
    expect(res.status).toBe(400);
  });
});
