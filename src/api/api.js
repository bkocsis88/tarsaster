const express = require('express');
const mariadb = require('mariadb');
const cors = require('cors');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const api = express.Router();

const sendPasswordResetEmail = require('./forget_pw.js');

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
    connectionLimit: 5,
    dateStrings: true
});

async function getUserById(userId) {
    const [user] = await query('SELECT user_id, username, full_name, email, location, birthdate FROM User WHERE user_id = ?', [userId]);
    return user || null;
}

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
    const {
        name,
        age_limit_min,
        age_limit_max,
        player_count_min,
        player_count_max,
        category,
        playing_time_min,
        playing_time_max,
        publisher,
        video_url,
        tags
    } = req.query;

    let sql = 'SELECT * FROM BoardGame WHERE 1=1';
    const params = [];

    if (name) {
        sql += ' AND name LIKE ?';
        params.push(`%${name}%`);
    }

    if (age_limit_min) {
        sql += ' AND age_limit >= ?';
        params.push(age_limit_min);
    }
    if (age_limit_max) {
        sql += ' AND age_limit <= ?';
        params.push(age_limit_max);
    }

    if (player_count_min) {
        sql += ' AND player_count >= ?';
        params.push(player_count_min);
    }
    if (player_count_max) {
        sql += ' AND player_count <= ?';
        params.push(player_count_max);
    }

    if (category) {
        sql += ' AND category = ?';
        params.push(category);
    }

    if (playing_time_min) {
        sql += ' AND playing_time_in_minutes >= ?';
        params.push(playing_time_min);
    }
    if (playing_time_max) {
        sql += ' AND playing_time_in_minutes <= ?';
        params.push(playing_time_max);
    }

    if (publisher) {
        sql += ' AND publisher LIKE ?';
        params.push(`%${publisher}%`);
    }

    if (video_url) {
        sql += ' AND video_url LIKE ?';
        params.push(`%${video_url}%`);
    }

    if (tags) {
        const tagList = tags.split(',');
        for (const tag of tagList) {
            sql += ' AND tags LIKE ?';
            params.push(`%${tag.trim()}%`);
        }
    }

    try {
        const results = await query(sql, params);
        res.json(results);
    } catch (err) {
        console.error(err);
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
    const { name, age_limit, player_count, category, playing_time_in_minutes, publisher, video_url, tags } = req.body;
    try {
        const result = await query(`INSERT INTO BoardGame (name, age_limit, player_count, category, playing_time_in_minutes, publisher, video_url, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, age_limit, player_count, category, playing_time_in_minutes, publisher, video_url, tags]);
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

api.patch('/users/:id', isAuthenticated('user'), async (req, res) => {
    const userId = req.params.id;

    // Ha user szerepű és nem a sajátját akarja módosítani → tiltás
    if (req.session.role === 'user' && req.session.userId != userId) {
        return res.status(403).json({ error: 'Nincs jogosultság más felhasználó módosítására.' });
    }

    // Engedélyezett mezők
    const { full_name, location, birthdate } = req.body;
    const fields = [];
    const values = [];

    if (full_name !== undefined) {
        fields.push('full_name = ?');
        values.push(full_name);
    }
    if (location !== undefined) {
        fields.push('location = ?');
        values.push(location);
    }
    if (birthdate !== undefined) {
        fields.push('birthdate = ?');
        values.push(birthdate);
    }

    if (fields.length === 0) {
        return res.status(400).json({ error: 'Nincs frissítendő mező.' });
    }

    try {
        const sql = `UPDATE User SET ${fields.join(', ')} WHERE user_id = ?`;
        values.push(userId);

        const result = await query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Felhasználó nem található.' });
        }

        const updatedUser = await getUserById(userId);
        res.json({ message: 'Felhasználó sikeresen frissítve.', user: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a frissítés során.' });
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
            const user = await getUserById(req.params.id);
            if (user) res.json(user);
            else res.status(404).json({ error: 'Felhasználó nem található.' });
        } catch (err) {
            res.status(500).json({ error: 'Hiba a lekérdezés során.' });
        }
    }
});

api.post('/users/change-password', isAuthenticated(), [
    body('oldPassword').notEmpty().withMessage('Régi jelszó kötelező.'),
    body('newPassword').isLength({ min: 8 }).withMessage('Az új jelszónak legalább 8 karakterből kell állnia!')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { oldPassword, newPassword } = req.body;
    const userId = req.session.userId;

    try {
        const [user] = await query('SELECT * FROM User WHERE user_id = ?', [userId]);

        if (!user) return res.status(404).json({ error: 'Felhasználó nem található.' });

        if (user.password !== oldPassword) {
            return res.status(401).json({ error: 'Hibás a régi jelszó!' });
        }

        await query('UPDATE User SET password = ? WHERE user_id = ?', [newPassword, userId]);

        //Visszajelzés a kliensnek
        res.json({ message: 'Sikeres módosítás!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Szerverhiba!' });
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

    const userProfile = await getUserById(user.user_id);

    // Session létrehozása
    req.session.userId = user.user_id;
    req.session.username = user.username;
    req.session.role = role.role_name;

    //res.json({ message: 'Sikeres bejelentkezés!', userId: user.user_id });

    res.json({ message: 'Sikeres bejelentkezés!', profile: userProfile });
});

//Logout endpoint
api.post('/logout', isAuthenticated(), (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Hiba a kijelentkezés során: ', err);
            return res.status(500).json({ error: 'Nem sikerült kijelentkezni!' });
        }

        res.clearCookie('connect.sid');
        res.json({ message: 'Sikeres kijelentkezés!' });
    });
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

        res.status(201).json({ message: 'Sikeres regisztráció!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Szerverhiba!' });
    }
});

// Jelszó visszaállítás kezdeményezése (email küldése)
api.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email megadása kötelező.' });
        }

        // Felhasználó lekérése email alapján
        const users = await query("SELECT user_id FROM User WHERE email = ?", [email]);
        if (users.length === 0) {
            // Biztonsági okból nem áruljuk el, ha nincs ilyen email
            return res.json({ message: 'Ha létezik fiók ezzel az email címmel, akkor küldtünk levelet.' });
        }
        const userId = users[0].user_id;

        // Generálunk egy egyedi tokent (példa: 32 byte hex)
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Lejárati idő (1 óra)
        const expirationAt = new Date(Date.now() + 60 * 60 * 1000);

        await query(`INSERT INTO PasswordResetToken (user_id, token, expiration_at) 
                     VALUES (?, ?, ?)`,
            [userId, resetToken, expirationAt])

        // Email küldése
        await sendPasswordResetEmail(email, resetToken);

        res.json({ message: 'Jelszó visszaállítási email elküldve.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hiba történt az email küldése közben.' });
    }
});

// Jelszó visszaállítás végrehajtása
api.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: "Hiányzó adatok" });
    }

    try {
        // 1. Token lekérdezése
        const [resetToken] = await query(
            `SELECT * FROM PasswordResetToken WHERE token = ?`,
            [token]
        );

        if (!resetToken) {
            return res.status(400).json({ message: "Érvénytelen token" });
        }

        // 2. Ellenőrzések
        if (resetToken.used) {
            return res.status(400).json({ message: "A token már felhasználásra került" });
        }

        if (new Date(resetToken.expiration_at) < new Date()) {
            return res.status(400).json({ message: "A token lejárt" });
        }

        // 3. Felhasználó jelszavának frissítése
        await query(
            `UPDATE User SET password = ? WHERE user_id = ?`,
            [newPassword, resetToken.user_id]
        );

        // 4. Token megjelölése felhasználtnak
        await query(
            `UPDATE PasswordResetToken SET used = TRUE WHERE id = ?`,
            [resetToken.id]
        );

        res.json({ message: "Jelszó sikeresen frissítve" });
    } catch (error) {
        console.error("Hiba a reset-password végpontban:", error);
        res.status(500).json({ message: "Szerverhiba" });
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