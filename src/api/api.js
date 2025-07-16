const express = require('express');
const mariadb = require('mariadb');
const cors = require('cors');
const api = express.Router();

api.use(cors());
api.use(express.json());


const pool = mariadb.createPool({
    host: 'localhost',
    user: 'dbuser',
    password: 'bIwDEiL43kqb',
    database: 'board_game',
    connectionLimit: 5
});


async function query(sql, params = []) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(sql, params);
        return rows;
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

//Boardgame végpontok
api.get('/boardgames', async (req, res) => {
    try {
        const games = await query('SELECT * FROM BoardGame');
        res.json(games);
    } catch (err) {
        res.status(500).json({ error: 'Hiba a társasjátékok lekérdezésekor.' });
    }
});

api.get('/boardgames/:id', async (req, res) => {
    try {
        const [game] = await query('SELECT * FROM BoardGame WHERE boardgame_id = ?', [req.params.id]);
        if (game) res.json(game);
        else res.status(404).json({ error: 'Játék nem található.' });
    } catch (err) {
        res.status(500).json({ error: 'Hiba a lekérdezés során.' });
    }
});

api.post('/boardgames', async (req, res) => {
    const { name, age_limit, player_count, category, playing_time, publisher, video_url, tags } = req.body;
    try {
        const result = await query(`INSERT INTO BoardGame (name, age_limit, player_count, category, playing_time, publisher, video_url, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, age_limit, player_count, category, playing_time, publisher, video_url, tags]);
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Hiba a játék létrehozásakor.' });
    }
});

api.delete('/boardgames/:id', async (req, res) => {
    try {
        await query('DELETE FROM BoardGame WHERE boardgame_id = ?', [req.params.id]);
        res.json({ message: 'Játék törölve.' });
    } catch (err) {
        res.status(500).json({ error: 'Hiba a törlés során.' });
    }
});

//User végpontok
api.get('/users', async (req, res) => {
    try {
        const users = await query('SELECT user_id, username, full_name, email, location, birthdate FROM User');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Hiba a felhasználók lekérdezésekor.' });
    }
});

api.post('/users', async (req, res) => {
    const { username, email, full_name, password, birthdate, location } = req.body;
    try {
        const result = await query(`INSERT INTO User (username, email, full_name, password, birthdate, location)
      VALUES (?, ?, ?, ?, ?, ?)`,
            [username, email, full_name, password, birthdate, location]);
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Hiba a felhasználó létrehozásakor.' });
    }
});

module.exports = api;