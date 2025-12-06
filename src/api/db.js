const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'dbuser',
    password: 'bIwDEiL43kqb',
    database: 'board_game',
    connectionLimit: 5,
    dateStrings: true
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

module.exports = { query };