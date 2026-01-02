const express = require('express');
const request = require('supertest');
const api = require('../../api/api');

jest.mock('../../api/db', () => ({
  query: jest.fn()
}));

const { query } = require('../../api/db');

describe('GET /categories', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use('/api', api);
  });

  beforeEach(() => query.mockReset());

  it('should return categories list', async () => {
    query.mockResolvedValue([
      { category: 'Strategy' },
      { category: 'Party' }
    ]);

    const res = await request(app).get('/api/categories');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining(['Party', 'Strategy']));
    expect(res.body.length).toBe(2);
  });
});
