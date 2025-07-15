//MariaDB-hez kapcsolat létesítéséhez szükséges modulok betöltése
const express = require("express");
const mariadb = require("mariadb");
const router = express.Router();

//adatbázis kapcsolat létrehozás
const pool = mariadb.createPool({
  host: 'pma.tarsasapp.hu',
  port: 3307,
  user: 'dbuser',
  password: 'bIwDEiL43kqb',
  database: 'tarsasapp',
  connectionLimit: 5
});

// API végpont: GET /db/teszt - lekérdezés a teszt táblából, minden egyes lekérdezéshez kell egy végpont
router.get("/teszt", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM teszt");
    res.json(rows);
  } catch (err) {
    console.error("DB hiba:", err);
    res.status(500).json({ error: "Adatbázis hiba" });
  } finally {
    if (conn) conn.release();
  }
});

//  rekord beszúrása, minden táblához külön


module.exports = router;

