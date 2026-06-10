const db = require('../config/db');

async function getAll(includeInactive = false) {
  const [rows] = await db.query(
    `SELECT id, titulo, descripcion, autor, fecha, link, activo, created_at
     FROM biblioteca
     ${includeInactive ? '' : 'WHERE activo = TRUE'}
     ORDER BY fecha DESC`
  );
  return rows;
}

async function getById(id, includeInactive = false) {
  const [rows] = await db.query(
    `SELECT id, titulo, descripcion, autor, fecha, link, activo, created_at
     FROM biblioteca
     WHERE id = ? ${includeInactive ? '' : 'AND activo = TRUE'}`,
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const { titulo, descripcion = null, autor, fecha, link } = data;
  const [result] = await db.query(
    `INSERT INTO biblioteca (titulo, descripcion, autor, fecha, link)
     VALUES (?, ?, ?, ?, ?)`,
    [titulo, descripcion, autor, fecha, link]
  );
  return getById(result.insertId, true);
}

async function update(id, data) {
  const allowed = ['titulo', 'descripcion', 'autor', 'fecha', 'link', 'activo'];
  const fields = Object.keys(data).filter(k => allowed.includes(k));

  if (fields.length === 0) {
    const err = new Error('Sin campos válidos para actualizar');
    err.status = 400;
    throw err;
  }

  const set = fields.map(k => `${k} = ?`).join(', ');
  await db.query(`UPDATE biblioteca SET ${set} WHERE id = ?`, [...fields.map(k => data[k]), id]);
  return getById(id, true);
}

async function remove(id) {
  const [result] = await db.query('DELETE FROM biblioteca WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { getAll, getById, create, update, remove };
