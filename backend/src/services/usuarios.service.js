const bcrypt = require('bcryptjs');
const db = require('../config/db');
const cache = require('../utils/memoryCache');

const VALID_ROLES = ['admin', 'supervisor', 'tecnico', 'visitante'];

function invalidateContentCaches() {
  cache.invalidatePrefix('projects:');
  cache.invalidatePrefix('library:');
  cache.invalidatePrefix('news:');
}

async function getAll() {
  const [rows] = await db.query(
    `SELECT id, email, role, activo, created_at, updated_at
     FROM users
     ORDER BY created_at DESC`
  );
  return rows;
}

async function getById(id) {
  const [rows] = await db.query(
    `SELECT id, email, role, activo, created_at, updated_at
     FROM users WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function create({ email, password, role }) {
  if (!VALID_ROLES.includes(role)) {
    const err = new Error('Rol inválido');
    err.status = 400;
    throw err;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
    [normalizedEmail, passwordHash, role]
  );
  invalidateContentCaches();
  return getById(result.insertId);
}

async function update(id, data) {
  const allowed = ['email', 'activo'];
  const fields = Object.keys(data).filter(field => allowed.includes(field));
  if (fields.length === 0) {
    const err = new Error('Sin campos válidos para actualizar');
    err.status = 400;
    throw err;
  }

  await db.query(
    `UPDATE users SET ${fields.map(field => `${field} = ?`).join(', ')} WHERE id = ?`,
    [...fields.map(field => data[field]), id]
  );
  invalidateContentCaches();
  return getById(id);
}

async function assignRole(id, role) {
  if (!VALID_ROLES.includes(role)) {
    const err = new Error('Rol inválido');
    err.status = 400;
    throw err;
  }
  await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
  invalidateContentCaches();
  return getById(id);
}

module.exports = { VALID_ROLES, getAll, getById, create, update, assignRole };
