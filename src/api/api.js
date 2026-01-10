const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const api = express.Router();

const sendPasswordResetEmail = require('./forget_pw.js');
const { query } = require('./db');
const sendGenericEmail = require('./sendGenericEmail');

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

async function getUserById(userId) {
    const [user] = await query('SELECT user_id, username, full_name, email, location, birthdate FROM User WHERE user_id = ?', [userId]);
    return user || null;
}

//Boardgame végpontok
// Társasjátékok lekérése szűrőkkel
api.get('/boardgames', async (req, res) => {
    try {
        // Ha be van jelentkezve a felhasználó, eltároljuk az ID-t
        const userId = req.session?.userId || null;

        // Szűrés wishlist-re csak bejelentkezett usernek
        if (req.query.isInWishlist !== undefined && !userId) {
            return res.status(400).json({
                error: 'Az isInWishlist paraméter csak bejelentkezes után használható.'
            });
        }

        // Szűrés owned-ra csak bejelentkezett usernek
        if (req.query.isOwned !== undefined && !userId) {
            return res.status(400).json({
                error: 'Az isOwned paraméter csak bejelentkezes után használható.'
            });
        }

        // Szűrőfeltételeket itt gyűjtjük
        let conditions = [];
        let params = [];

        // Kategória szerinti szűrés
        if (req.query.category) {
            conditions.push('category = ?');
            params.push(req.query.category);
        }

        // Keresés név alapján
        if (req.query.search) {
            conditions.push('name LIKE ?');
            params.push('%' + req.query.search + '%');
        }

        // Minimum játékosszám
        if (req.query.minPlayers) {
            conditions.push('player_count >= ?');
            params.push(req.query.minPlayers);
        }

        // Maximum játékosszám
        if (req.query.maxPlayers) {
            conditions.push('player_count <= ?');
            params.push(req.query.maxPlayers);
        }

        // Korhatár szűrés
        if (req.query.ageLimit) {
            conditions.push('age_limit <= ?');
            params.push(req.query.ageLimit);
        }

        // Leírás szűrés
        if (req.query.description) {
            conditions.push('description LIKE ?');
            params.push('%' + req.query.description + '%');
        }

        // Alap lekérdezés a BoardGame táblából
        let sql = 'SELECT * FROM BoardGame';

        // Ha van feltétel, hozzáfűzzük a WHERE részt
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        // Lekérdezzük az adatokat
        const games = await query(sql, params);

        // Ha nincs bejelentkezett felhasználó, minden játék wishlist és owned státusza false lesz
        if (!userId) {
            for (const g of games) {
                g.is_in_wishlist = false;
                g.is_owned = false;
            }
            return res.json(games);
        }

        // Lekérdezzük a bejelentkezett user wishlistjét
        const wishlistRows = await query('SELECT boardgame_id FROM Wishlist WHERE user_id = ?', [userId]);
        const wishlistIds = wishlistRows.map(row => row.boardgame_id);

        // Lekérdezzük a bejelentkezett user meglévő játékait
        const ownedRows = await query('SELECT boardgame_id FROM UserBoardGame WHERE user_id = ?', [userId]);
        const ownedIds = ownedRows.map(row => row.boardgame_id);

        // Az is_in_wishlist és az is_owned mezőt minden játékhoz beállítjuk
        for (const g of games) {
            g.is_in_wishlist = wishlistIds.includes(g.boardgame_id);
            g.is_owned = ownedIds.includes(g.boardgame_id);
        }

        let filteredGames = games;

        // Ha a felhasználó kérte, hogy csak a wishlist-es vagy nem wishlist-es játékokat lássa
        if (req.query.isInWishlist !== undefined) {
            const filterValue = req.query.isInWishlist === 'true';
            filteredGames = filteredGames.filter(g => g.is_in_wishlist === filterValue);
        }

        // Ha a felhasználó kérte, hogy csak a meglévő vagy a hiányzó játékokat lássa
        if (req.query.isOwned !== undefined) {
            const filterValue = req.query.isOwned === 'true';
            filteredGames = filteredGames.filter(g => g.is_owned === filterValue);
        }

        return res.json(filteredGames);

    } catch (err) {
        console.error('Hiba a társasjátékok lekérdezésekor:', err);
        res.status(500).json({ error: 'Szerverhiba a társasjátékok lekérdezése közben.' });
    }
});

api.get('/boardgames/:id', async (req, res) => {
    try {
        const [game] = await query('SELECT * FROM BoardGame WHERE boardgame_id = ?', [req.params.id]);

        if (!game) {
            return res.status(404).json({ error: 'Játék nem található.' });
        }

        // Ellenőrzés, hogy a bejelentkezett felhasználónál a kívánságlistán van-e és megvan-e neki
        let isInWishlist = false;
        let isOwned = false;

        if (req.session && req.session.userId) {
            const userId = req.session.userId;

            const wishlistCheck = await query(
                'SELECT 1 FROM Wishlist WHERE user_id = ? AND boardgame_id = ?',
                [userId, req.params.id]
            );
            isInWishlist = wishlistCheck.length > 0;

            const isOwnedCheck = await query(
                'SELECT 1 FROM UserBoardGame WHERE user_id = ? AND boardgame_id = ?',
                [userId, req.params.id]
            );
            isOwned = isOwnedCheck.length > 0;
        }

        // Hozzáadjuk a mezőket a válaszhoz
        game.is_in_wishlist = isInWishlist;
        game.is_owned = isOwned;

        res.json(game);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a lekérdezés során.' });
    }
});

api.post('/boardgames', isAuthenticated('admin'), async (req, res) => {
    const { name, age_limit, player_count, category, playing_time_in_minutes, publisher, video_url, tags, description } = req.body;
    try {
        const result = await query(`INSERT INTO BoardGame (name, age_limit, player_count, category, playing_time_in_minutes, publisher, video_url, tags, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, age_limit, player_count, category, playing_time_in_minutes, publisher, video_url, tags, description]);
        res.status(201).json({ id: Number(result.insertId) }); //a MariaDB "bigint" típust nem tudja a JS nem tudja kezelni, ezért számmá kell alakítani
    } catch (err) {
        res.status(500).json({ error: 'Hiba a játék létrehozásakor.' });
    }
});

api.patch('/boardgames/:id', isAuthenticated('admin'), async (req, res) => {
    const gameId = req.params.id;
    const {
        name,
        age_limit,
        player_count,
        category,
        playing_time_in_minutes,
        publisher,
        video_url,
        tags,
        description
    } = req.body;

    // Engedélyezett mezők listája
    const fields = [];
    const values = [];

    if (name !== undefined) {
        fields.push('name = ?');
        values.push(name);
    }
    if (age_limit !== undefined) {
        fields.push('age_limit = ?');
        values.push(age_limit);
    }
    if (player_count !== undefined) {
        fields.push('player_count = ?');
        values.push(player_count);
    }
    if (category !== undefined) {
        fields.push('category = ?');
        values.push(category);
    }
    if (playing_time_in_minutes !== undefined) {
        fields.push('playing_time_in_minutes = ?');
        values.push(playing_time_in_minutes);
    }
    if (publisher !== undefined) {
        fields.push('publisher = ?');
        values.push(publisher);
    }
    if (video_url !== undefined) {
        fields.push('video_url = ?');
        values.push(video_url);
    }
    if (tags !== undefined) {
        fields.push('tags = ?');
        values.push(tags);
    }
    if (description !== undefined) {
        fields.push('description = ?');
        values.push(description);
    }

    // Ha nincs frissítendő mező
    if (fields.length === 0) {
        return res.status(400).json({ error: 'Nincs módosítandó mező.' });
    }

    try {
        const sql = `UPDATE BoardGame SET ${fields.join(', ')} WHERE boardgame_id = ?`;
        values.push(gameId);

        const result = await query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Játék nem található.' });
        }

        // Frissített játék lekérése és visszaküldése
        const [updatedGame] = await query('SELECT * FROM BoardGame WHERE boardgame_id = ?', [gameId]);
        res.json({ message: 'Játék sikeresen módosítva.', boardgame: updatedGame });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a játék frissítése során.' });
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

// BoardGameImage kezelés
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // tároljuk memóriában, nem fájlban
const maxUploadableFileCount = 10;

api.post('/boardgames/:id/images', isAuthenticated('admin'), upload.array('images', maxUploadableFileCount), async (req, res) => {
    const boardgameId = req.params.id;

    try {
        // Ellenőrzés: létezik-e a játék
        const [game] = await query('SELECT boardgame_id FROM BoardGame WHERE boardgame_id = ?', [boardgameId]);
        if (!game) {
            return res.status(404).json({ error: 'A megadott társasjáték nem található.' });
        }

        // Ellenőrzés: érkezett-e fájl
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Legalább egy képfájlt fel kell tölteni.' });
        }

        // Minden fájlt feldolgozunk és mentünk
        const insertedIds = [];

        for (const file of req.files) {
            // Fájlnév újrakódolása Latin1 → UTF-8
            const fileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
            const mimeType = file.mimetype;

            const result = await query(
                `INSERT INTO BoardGameImage (boardgame_id, data, file_name, mime_type)
     VALUES (?, ?, ?, ?)`,
                [boardgameId, file.buffer, fileName, mimeType] // buffer közvetlenül
            );

            insertedIds.push(Number(result.insertId));
        }

        res.status(201).json({
            message: `Sikeresen feltöltve ${insertedIds.length} kép.`,
            image_ids: insertedIds
        });

    } catch (err) {
        console.error('Hiba a képfeltöltés során:', err);
        res.status(500).json({ error: 'Szerverhiba a képfeltöltés közben.' });
    }
});

api.get('/boardgames/:id/images', async (req, res) => {
    const boardgameId = req.params.id;

    try {
        // Ellenőrzés: létezik-e a társasjáték
        const [game] = await query('SELECT boardgame_id FROM BoardGame WHERE boardgame_id = ?', [boardgameId]);
        if (!game) {
            return res.status(404).json({ error: 'A megadott társasjáték nem található.' });
        }

        // Lekérdezzük az összes kép metaadatait (nem a teljes base64-et!)
        const images = await query(
            `SELECT image_id, file_name, mime_type 
             FROM BoardGameImage 
             WHERE boardgame_id = ?`,
            [boardgameId]
        );

        if (images.length === 0) {
            return res.status(404).json({ error: 'Ehhez a társasjátékhoz még nincs feltöltött kép.' });
        }

        // Kiegészítjük az URL-ekkel
        const result = images.map(img => ({
            image_id: img.image_id,
            file_name: img.file_name,
            mime_type: img.mime_type,
            url: `/api/boardgames/${boardgameId}/images/${img.image_id}`
        }));

        res.json(result);

    } catch (err) {
        console.error('Hiba a képek lekérdezésekor:', err);
        res.status(500).json({ error: 'Szerverhiba a képek lekérdezése közben.' });
    }
});

api.get('/boardgames/:boardgameId/images/:imageId', async (req, res) => {
    const { boardgameId, imageId } = req.params;

    try {
        const [image] = await query(
            `SELECT data, file_name, mime_type 
             FROM BoardGameImage 
             WHERE boardgame_id = ? AND image_id = ?`,
            [boardgameId, imageId]
        );

        if (!image) {
            return res.status(404).json({ error: 'A kép nem található.' });
        }

        // Beállítjuk a válasz fejlécét és kiküldjük a képet
        res.setHeader('Content-Type', image.mime_type);
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(image.file_name)}"`);
        res.send(image.data); // buffer közvetlenül

    } catch (err) {
        console.error('Hiba a kép lekérdezése során:', err);
        res.status(500).json({ error: 'Szerverhiba a kép lekérdezése közben.' });
    }
});

api.delete('/boardgames/:boardgameId/images/:imageId', isAuthenticated('admin'), async (req, res) => {
    const { boardgameId, imageId } = req.params;

    try {
        // Ellenőrizzük, hogy létezik-e a kép a megadott játékhoz
        const [image] = await query(
            `SELECT image_id FROM BoardGameImage 
             WHERE boardgame_id = ? AND image_id = ?`,
            [boardgameId, imageId]
        );

        if (!image) {
            return res.status(404).json({ error: 'A megadott kép nem található a társasjátékhoz.' });
        }

        // Kép törlése
        await query(
            `DELETE FROM BoardGameImage 
             WHERE boardgame_id = ? AND image_id = ?`,
            [boardgameId, imageId]
        );

        res.json({ message: 'A kép sikeresen törölve lett.' });

    } catch (err) {
        console.error('Hiba a kép törlése közben:', err);
        res.status(500).json({ error: 'Szerverhiba a kép törlése közben.' });
    }
});

// Összes kategória lekérése
api.get('/categories', async (req, res) => {
    try {
        // DISTINCT → egyedi kategóriák
        // ORDER BY → ABC szerinti rendezés
        const rows = await query(
            'SELECT DISTINCT category FROM BoardGame WHERE category IS NOT NULL AND category <> "" ORDER BY category'
        );

        // Csak a kategória értékeket küldjük vissza tömbben
        const categories = rows.map(row => row.category);

        res.json(categories);

    } catch (err) {
        console.error('Hiba a kategóriák lekérdezésekor:', err);
        res.status(500).json({ error: 'Szerverhiba a kategóriák lekérdezése közben.' });
    }
});


// Társasjáték hozzáadása a kívánságlistához
api.post('/wishlist/:boardgameId', isAuthenticated('user'), async (req, res) => {
    try {
        const userId = req.session.userId;
        const boardgameId = req.params.boardgameId;

        // Ellenőrizzük, hogy létezik-e a játék
        const [game] = await query('SELECT boardgame_id FROM BoardGame WHERE boardgame_id = ?', [boardgameId]);
        if (!game) {
            return res.status(404).json({ error: 'A megadott társasjáték nem található.' });
        }

        // Ellenőrizzük, hogy már szerepel-e a kívánságlistán
        const existing = await query(
            'SELECT 1 FROM Wishlist WHERE user_id = ? AND boardgame_id = ?',
            [userId, boardgameId]
        );

        if (existing.length > 0) {
            return res.status(200).json({ message: 'Ez a játék már szerepel a kívánságlistán.' });
        }

        // Hozzáadás a kívánságlistához
        await query(
            'INSERT INTO Wishlist (user_id, boardgame_id) VALUES (?, ?)',
            [userId, boardgameId]
        );

        res.status(201).json({ message: 'A játék felvéve a kívánságlistára.' });
    } catch (err) {
        console.error('Hiba a kívánságlistához adás során:', err);
        res.status(500).json({ error: 'Szerverhiba a kívánságlistához adás közben.' });
    }
});

// Társasjáték eltávolítása a kívánságlistáról
api.delete('/wishlist/:boardgameId', isAuthenticated('user'), async (req, res) => {
    try {
        const userId = req.session.userId;
        const boardgameId = req.params.boardgameId;

        // Ellenőrizzük, hogy van-e ilyen bejegyzés
        const existing = await query(
            'SELECT 1 FROM Wishlist WHERE user_id = ? AND boardgame_id = ?',
            [userId, boardgameId]
        );

        if (existing.length === 0) {
            return res.status(200).json({ message: 'Ez a játék nem szerepel a kívánságlistán.' });
        }

        // Töröljük a bejegyzést
        await query(
            'DELETE FROM Wishlist WHERE user_id = ? AND boardgame_id = ?',
            [userId, boardgameId]
        );

        res.status(200).json({ message: 'A játék eltávolítva a kívánságlistáról.' });
    } catch (err) {
        console.error('Hiba a kívánságlistáról törlés során:', err);
        res.status(500).json({ error: 'Szerverhiba a kívánságlistáról törlés közben.' });
    }
});

// Társasjáték hozzáadása a felhasználó meglévő játékaihoz
api.post('/owned/:boardgameId', isAuthenticated('user'), async (req, res) => {
    try {
        const userId = req.session.userId;
        const boardgameId = req.params.boardgameId;

        // Ellenőrizzük, hogy létezik-e a játék
        const [game] = await query('SELECT boardgame_id FROM BoardGame WHERE boardgame_id = ?', [boardgameId]);
        if (!game) {
            return res.status(404).json({ error: 'A megadott társasjáték nem található.' });
        }

        // Ellenőrizzük, hogy már szerepel-e a user listájában
        const existing = await query(
            'SELECT 1 FROM UserBoardGame WHERE user_id = ? AND boardgame_id = ?',
            [userId, boardgameId]
        );

        if (existing.length > 0) {
            return res.status(200).json({ message: 'Ez a játék már szerepel a felhasználó meglévő játékai között.' });
        }

        // Hozzáadás a táblához
        await query(
            'INSERT INTO UserBoardGame (user_id, boardgame_id) VALUES (?, ?)',
            [userId, boardgameId]
        );

        res.status(201).json({ message: 'A játék hozzáadva a meglévő játékokhoz.' });
    } catch (err) {
        console.error('Hiba a meglévő játékokhoz adás során:', err);
        res.status(500).json({ error: 'Szerverhiba a meglévő játékokhoz adás közben.' });
    }
});

// Társasjáték eltávolítása a felhasználó meglévő játékai közül
api.delete('/owned/:boardgameId', isAuthenticated('user'), async (req, res) => {
    try {
        const userId = req.session.userId;
        const boardgameId = req.params.boardgameId;

        // Ellenőrizzük, hogy van-e ilyen bejegyzés
        const existing = await query(
            'SELECT 1 FROM UserBoardGame WHERE user_id = ? AND boardgame_id = ?',
            [userId, boardgameId]
        );

        if (existing.length === 0) {
            return res.status(200).json({ message: 'Ez a játék nem szerepel a felhasználó meglévő játékai között.' });
        }

        // Töröljük a bejegyzést
        await query(
            'DELETE FROM UserBoardGame WHERE user_id = ? AND boardgame_id = ?',
            [userId, boardgameId]
        );

        res.status(200).json({ message: 'A játék eltávolítva a meglévő játékok közül.' });
    } catch (err) {
        console.error('Hiba a meglévő játék törlése során:', err);
        res.status(500).json({ error: 'Szerverhiba a meglévő játék törlése közben.' });
    }
});

//User végpontok
api.get('/users', isAuthenticated('admin'), async (req, res) => {
    try {
        const users = await query('SELECT u.user_id, username, full_name, email, location, birthdate, role_name as role FROM User u JOIN UserRole ur ON u.user_id = ur.user_id');
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

api.get('/profile', isAuthenticated('user'), async (req, res) => {
    try {
        // Mindig a session-ben lévő felhasználó profilját kérjük le
        const userId = req.session.userId;
        const user = await getUserById(userId);

        user["role"] = req.session.role;

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'Felhasználó nem található.' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Hiba a lekérdezés során.' });
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

//Felhasználó törlése (admin), de saját magát TILOS törölnie
api.delete('/users/:id', isAuthenticated('admin'), async (req, res) => {
    const userIdToDelete = req.params.id;
    const loggedInUserId = req.session.userId;

    try {
        //Saját magát ne törölhesse az admin
        if (parseInt(userIdToDelete) === parseInt(loggedInUserId)) {
            return res.status(403).json({
                error: 'Az admin nem törölheti saját magát.'
            });
        }

        //Létezik-e a felhasználó?
        const existing = await query(
            'SELECT user_id FROM User WHERE user_id = ?',
            [userIdToDelete]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Felhasználó nem található.' });
        }

        //Felhasználó törlése
        await query('DELETE FROM User WHERE user_id = ?', [userIdToDelete]);

        res.json({ message: 'Felhasználó sikeresen törölve.' });

    } catch (err) {
        console.error('Hiba a törlés során:', err);
        res.status(500).json({ error: 'Szerverhiba a törlés közben.' });
    }
});

// Felhasználó szerepének módosítása (admin), de saját szerepét NEM módosíthatja
api.patch('/users/:id/role', isAuthenticated('admin'), async (req, res) => {
    const userIdToModify = req.params.id;
    const loggedInAdminId = req.session.userId;
    const { role } = req.body;

    // Csak user / admin lehet
    if (!role || !['user', 'admin'].includes(role)) {
        return res.status(400).json({
            error: 'Érvénytelen szerep. Megengedett: user, admin.'
        });
    }

    try {
        //Admin ne módosíthassa a SAJÁT szerepét
        if (parseInt(userIdToModify) === parseInt(loggedInAdminId)) {
            return res.status(403).json({
                error: 'Az admin nem módosíthatja a saját szerepét.'
            });
        }

        //Létezik-e a felhasználó?
        const existing = await query(
            'SELECT user_id FROM User WHERE user_id = ?',
            [userIdToModify]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Felhasználó nem található.' });
        }

        // Szerep frissítése
        const result = await query(
            'UPDATE UserRole SET role_name = ? WHERE user_id = ?',
            [role, userIdToModify]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({
                error: 'Nem sikerült módosítani a szerepet.'
            });
        }

        res.json({
            message: 'Szerep sikeresen módosítva.',
            userId: userIdToModify,
            newRole: role
        });

    } catch (err) {
        console.error('Hiba a szerepmódosítás során:', err);
        res.status(500).json({ error: 'Szerverhiba a szerepmódosítás közben.' });
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
    req.session.lastname = user.full_name.split(' ').at(-1); //feldarabolja a teljes nevet és visszaadja az utolsót
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

        // 📧 SIKERES REGISZTRÁCIÓS EMAIL (nem blokkoló)
        try {
            const subject = 'Sikeres regisztráció – TársasApp';
            const html = `
                <h2>Kedves ${full_name}!</h2>
                <p>Sikeresen regisztráltál a <strong>TársasApp</strong> rendszerébe 🎉</p>
                <p>Felhasználóneved: <strong>${username}</strong></p>
                <p>Most már be tudsz jelentkezni és elkezdheted a társasjátékok böngészését.</p>
                <br>
                <p>Üdvözlettel,<br><strong>TársasApp csapata</strong></p>
            `;

            await sendGenericEmail(email, subject, html);
        } catch (mailErr) {
            console.error('Regisztrációs email küldése sikertelen:', mailErr);
            // NEM dobunk hibát
        }

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

// Email küldése regisztrált felhasználónak
api.post('/send-email', isAuthenticated('user'), async (req, res) => {
    const { email, subject, html } = req.body;

    // Kötelező inputok ellenőrzése
    if (!email || !subject || !html) {
        return res.status(400).json({
            error: 'Email, tárgy és HTML tartalom megadása kötelező.'
        });
    }

    try {
        // Ellenőrizzük, hogy létezik-e a felhasználó
        const users = await query(
            'SELECT user_id FROM User WHERE email = ?',
            [email]
        );

        // Ha nem létezik → NEM áruljuk el
        if (users.length === 0) {
            return res.json({
                message: 'Ha az email cím regisztrálva van, az üzenet elküldésre került.'
            });
        }

        // Email küldése
        await sendGenericEmail(email, subject, html);

        res.json({
            message: 'Ha az email cím regisztrálva van, az üzenet elküldésre került.'
        });

    } catch (err) {
        console.error('Hiba az email küldése során:', err);
        res.status(500).json({
            error: 'Szerverhiba az email küldése közben.'
        });
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