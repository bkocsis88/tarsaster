const bcrypt = require('bcrypt');
const db = require('./api/db');

const SALT_ROUNDS = 12;

async function hashPasswords() {
  try {
    // Lekérjük az összes felhasználót
    const users = await db.query(
      'SELECT user_id, password FROM user'
    );

    for (const user of users) {
      // Ha már bcrypt hash, kihagyjuk
      if (
        typeof user.password === 'string' &&
        user.password.startsWith('$2')
      ) {
        console.log(`🔐 User ${user.user_id} jelszava már hash-elve van`);
        continue;
      }

      // Hash-elés
      const hashedPassword = await bcrypt.hash(
        user.password,
        SALT_ROUNDS
      );

      // Frissítés DB-ben
      await db.query(
        'UPDATE user SET password = ? WHERE user_id = ?',
        [hashedPassword, user.user_id]
      );

      console.log(`🔐 User ${user.user_id} jelszava hash-elve`);
    }

    console.log('✅ Jelszó migráció kész');
    process.exit(0);
  } catch (err) {
    console.error('❌ Hiba a jelszó migráció során:', err);
    process.exit(1);
  }
}

hashPasswords();
