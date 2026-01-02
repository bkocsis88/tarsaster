// boardgames.test.js
const express = require('express');
const request = require('supertest');

// Router betöltése
const api = require('../../api/api');

// Csak a db query-t mockoljuk
jest.mock('../../api/db', () => ({
  query: jest.fn()
}));

// Mockolt query importálása
const { query } = require('../../api/db');

describe('GET /boardgames', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', api); // router middleware
  });

  beforeEach(() => {
    query.mockReset(); // minden teszt előtt reset
  });

  it('should return all boardgames for unauthenticated users with wishlist and owned false', async () => {
    const mockGames = [
      { boardgame_id: 1, name: 'Catan' },
      { boardgame_id: 2, name: 'Ticket to Ride' }
    ];
    query.mockResolvedValue(mockGames);

    const res = await request(app).get('/api/boardgames');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { boardgame_id: 1, name: 'Catan', is_in_wishlist: false, is_owned: false },
      { boardgame_id: 2, name: 'Ticket to Ride', is_in_wishlist: false, is_owned: false }
    ]);

    expect(query).toHaveBeenCalledWith('SELECT * FROM BoardGame', []);
  });

  it('should filter by category', async () => {
    const mockGames = [{ boardgame_id: 1, name: 'Catan', category: 'Strategy' }];
    query.mockResolvedValue(mockGames);

    const res = await request(app).get('/api/boardgames').query({ category: 'Strategy' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { boardgame_id: 1, name: 'Catan', category: 'Strategy', is_in_wishlist: false, is_owned: false }
    ]);

    expect(query).toHaveBeenCalledWith(
      'SELECT * FROM BoardGame WHERE category = ?',
      ['Strategy']
    );
  });

  it('should return 400 if isInWishlist is used without authentication', async () => {
    const res = await request(app).get('/api/boardgames').query({ isInWishlist: 'true' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: 'Az isInWishlist paraméter csak bejelentkezes után használható.'
    });
  });
});