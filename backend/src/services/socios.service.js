const db = require('../config/db');

async function getAll() {
  const [rows] = await db.query(
    `SELECT id, user_id, nombre, apellido, dni, telefono, email,
            direccion, estado, fecha_ingreso, created_at
     FROM socios
     ORDER BY apellido, nombre`
  );
  return rows;
}

async function getById(id) {
  const [rows] = await db.query(
    `SELECT id, user_id, nombre, apellido, dni, telefono, email,
            direccion, estado, fecha_ingreso, created_at
     FROM socios WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const { user_id = null, nombre, apellido, dni = null, telefono = null,
          email = null, direccion = null, fecha_ingreso } = data;

  const [result] = await db.query(
    `INSERT INTO socios (user_id, nombre, apellido, dni, telefono, email, direccion, fecha_ingreso)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, nombre, apellido, dni, telefono, email, direccion, fecha_ingreso]
  );
  return getById(result.insertId);
}

async function update(id, data) {
  const allowed = ['nombre', 'apellido', 'dni', 'telefono', 'email', 'direccion', 'estado', 'fecha_ingreso', 'user_id'];
  const fields = Object.keys(data).filter(k => allowed.includes(k));

  if (fields.length === 0) {
    const err = new Error('Sin campos válidos para actualizar');
    err.status = 400;
    throw err;
  }

  const values = fields.map(k => data[k]);
  const set = fields.map(k => `${k} = ?`).join(', ');

  await db.query(`UPDATE socios SET ${set} WHERE id = ?`, [...values, id]);
  return getById(id);
}

async function remove(id) {
  const [result] = await db.query('DELETE FROM socios WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { getAll, getById, create, update, remove };
