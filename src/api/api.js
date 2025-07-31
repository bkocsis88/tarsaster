const express = require('express');
const mariadb = require('mariadb');
const cors = require('cors');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
const api = express.Router();

api.use(cors());
api.use(express.urlencoded({ extended: true }));
api.use(express.json());

api.use(session({
    secret: 'valami_nagyon_titkos_szó', // environment variable-ben tárold élesben!
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // állítsd true-ra HTTPS esetén
        maxAge: 1000 * 60 * 60 // 1 óra
    }
}));

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

api.delete('/boardgames/:id', isAuthenticated('admin'), async (req, res) => {
    try {
        await query('DELETE FROM BoardGame WHERE boardgame_id = ?', [req.params.id]);
        res.json({ message: 'Játék törölve.' });
    } catch (err) {
        res.status(500).json({ error: 'Hiba a törlés során.' });
    }
});

//User végpontok
api.get('/users', isAuthenticated('admin'), async (req, res) => {
    try {
        const users = await query('SELECT user_id, username, full_name, email, location, birthdate FROM User');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Hiba a felhasználók lekérdezésekor.' });
    }
});

api.post('/users', isAuthenticated('admin'), async (req, res) => {
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

api.get('/users/:id', isAuthenticated('user'), async (req, res) => {
    // Ha csak user role van, akkor csak a saját profilt lehet lekérni
    if (req.session.role === 'user' && req.params.id != req.session.userId) {
        res.status(403).json({ error: 'Nincs elegendő jogosultság.' });
    } else {
        try {
            const [user] = await query('SELECT * FROM User WHERE user_id = ?', [req.params.id]);
            if (user) res.json(user);
            else res.status(404).json({ error: 'Felhasználó nem található.' });
        } catch (err) {
            res.status(500).json({ error: 'Hiba a lekérdezés során.' });
        }
    }
});

// 🔐 Login endpoint
api.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email és jelszó megadása kötelező!' });
    }

    const [user] = await query('SELECT * FROM User WHERE email = ?', [email]);

    if (!user) {
        return res.status(401).json({ error: 'Hibás e-mail vagy jelszó.' });
    }

    const isPasswordValid = password === user.password;
    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Hibás e-mail vagy jelszó.' });
    }

    const [role] = await query('SELECT role_name FROM UserRole WHERE user_id = ?', [user.user_id]);

    // Session létrehozása
    req.session.userId = user.user_id;
    req.session.username = user.username;
    req.session.role = role.role_name;

    res.json({ message: 'Sikeres bejelentkezés!', userId: user.user_id });
});

// Register endpoint
api.post('/register', [
    body('username').notEmpty().withMessage('Felhasználónév kötelező'),
    body('email').isEmail().withMessage('Érvényes email kell'),
    body('full_name').notEmpty().withMessage('Teljes név kötelező'),
    body('password').isLength({ min: 8 }).withMessage('A jelszónak legalább 8 karakteresnek kell lennie'),
    body('birthdate').optional({ checkFalsy: true }).isISO8601().withMessage('Születési dátum hibás'),
    body('location').optional().isLength({ max: 255 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, full_name, password, birthdate, location } = req.body;

    try {
        const existing = await query(
            'SELECT user_id FROM User WHERE username = ? OR email = ?',
            [username, email]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Felhasználónév vagy email már létezik' });
        }

        await query(
            `INSERT INTO User (username, email, full_name, password, birthdate, location)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [username, email, full_name, password, birthdate || null, location || null]
        );

        const users = await query(
            'SELECT user_id FROM User WHERE username = ?', [username]
        )

        await query(
            'INSERT INTO UserRole (user_id, role_name) VALUES (?, ?)', [users[0].user_id, 'user']
        )

        res.status(201).json({ message: 'Sikeres regisztráció' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Szerverhiba' });
    }
});

function isAuthenticated(requiredRole = null) {
    return (req, res, next) => {
        const userId = req.session.userId;
        const roles = req.session.role === 'admin' ? ['admin', 'user'] : [req.session.role];

        if (!userId) {
            return res.status(401).json({ error: 'Nincs bejelentkezve' });
        }

        if (requiredRole && !roles.includes(requiredRole)) {
            return res.status(403).json({ error: 'Nincs elegendő jogosultság' });
        }

        next();
    };
}

module.exports = api;