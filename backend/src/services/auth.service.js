const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { permissionsForRole } = require('../config/permissions');

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const DUMMY_PASSWORD_HASH = '$2b$10$9QJ9pEKwklKJMvVm2C6uyez1L7eWUJrVnLJyKBUHHwZ4XEZ1Pb9tW';

async function findUserByEmail(email) {
  const [rows] = await db.query(
    `SELECT id, email, password_hash, role, activo,
            failed_login_attempts, locked_until,
            (locked_until IS NOT NULL AND locked_until > CURRENT_TIMESTAMP) AS login_locked
     FROM users
     WHERE email = ?`,
    [email]
  );
  return rows[0] || null;
}

async function createUser(email, password, role = 'visitante') {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    const err = new Error('El email ya está registrado');
    err.status = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
    [normalizedEmail, password_hash, role]
  );
  return { id: result.insertId, email: normalizedEmail, role };
}

async function findUserById(id) {
  const [rows] = await db.query(
    'SELECT id, email, role, activo, created_at, updated_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

async function verifyUnknownUserPassword(password) {
  await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
}

function isLoginLocked(user) {
  return Boolean(user?.login_locked);
}

async function clearExpiredLoginLock(user) {
  if (!user?.locked_until || user.login_locked) return;
  await db.query(
    `UPDATE users
     SET failed_login_attempts = 0, locked_until = NULL, last_failed_login = NULL
     WHERE id = ? AND locked_until <= CURRENT_TIMESTAMP`,
    [user.id]
  );
  user.failed_login_attempts = 0;
  user.locked_until = null;
  user.last_failed_login = null;
  user.login_locked = 0;
}

async function recordFailedLogin(userId) {
  await db.query(
    `UPDATE users
     SET failed_login_attempts = failed_login_attempts + 1,
         last_failed_login = CURRENT_TIMESTAMP,
         locked_until = CASE
           WHEN failed_login_attempts + 1 >= ? THEN DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? MINUTE)
           ELSE locked_until
         END
     WHERE id = ?`,
    [MAX_FAILED_ATTEMPTS, LOCK_MINUTES, userId]
  );
}

async function resetLoginSecurity(userId) {
  await db.query(
    `UPDATE users
     SET failed_login_attempts = 0,
         locked_until = NULL,
         last_failed_login = NULL,
         last_login_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [userId]
  );
}

function generateAccessToken(user, sessionId) {
  return jwt.sign(
    { id: user.id, sid: sessionId, type: 'access' },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
      algorithm: 'HS256',
      issuer: 'acaro-api',
      audience: 'acaro-web',
    }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    activo: Boolean(user.activo),
    permissions: permissionsForRole(user.role),
  };
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  verifyPassword,
  verifyUnknownUserPassword,
  isLoginLocked,
  clearExpiredLoginLock,
  recordFailedLogin,
  resetLoginSecurity,
  generateAccessToken,
  publicUser,
};
