const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

async function findUserByEmail(email) {
  const [rows] = await db.query(
    'SELECT id, email, password_hash, role, activo FROM users WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

async function createUser(email, password, role = 'visitante') {
  const existing = await findUserByEmail(email);
  if (existing) {
    const err = new Error('El email ya está registrado');
    err.status = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
    [email, password_hash, role]
  );
  return { id: result.insertId, email, role };
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

module.exports = { findUserByEmail, createUser, verifyPassword, generateToken };
