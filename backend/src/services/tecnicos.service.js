const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function getAll(user = null) {
  let where = '';
  const values = [];
  if (user?.role === 'supervisor') {
    where = 'WHERE st.supervisor_id = ?';
    values.push(user.id);
  } else if (user?.role === 'tecnico') {
    where = 'WHERE u.id = ?';
    values.push(user.id);
  }
  const [rows] = await db.query(
    `SELECT t.id, t.nombre, t.apellido, t.especialidad, t.telefono, t.disponible,
            t.created_at, u.email, st.supervisor_id, su.email AS supervisor_email
     FROM tecnicos t
     JOIN users u ON u.id = t.user_id
     LEFT JOIN supervisor_tecnicos st ON st.tecnico_id = t.id
     LEFT JOIN users su ON su.id = st.supervisor_id
     ${where}
     ORDER BY t.apellido, t.nombre`
    , values
  );
  return rows;
}

async function getById(id) {
  const [rows] = await db.query(
    `SELECT t.id, t.nombre, t.apellido, t.especialidad, t.telefono, t.disponible,
            t.created_at, u.id AS user_id, u.email, u.activo
     FROM tecnicos t
     JOIN users u ON u.id = t.user_id
     WHERE t.id = ?`,
    [id]
  );
  return rows[0] || null;
}

// Crea user (role=tecnico) + perfil tecnico en una transacción
async function create(data) {
  const { email, password, nombre, apellido, especialidad = null, telefono = null } = data;
  const normalizedEmail = email.trim().toLowerCase();

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      const err = new Error('El email ya está registrado');
      err.status = 409;
      throw err;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [userResult] = await conn.query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [normalizedEmail, password_hash, 'tecnico']
    );
    const user_id = userResult.insertId;

    const [tecResult] = await conn.query(
      'INSERT INTO tecnicos (user_id, nombre, apellido, especialidad, telefono) VALUES (?, ?, ?, ?, ?)',
      [user_id, nombre, apellido, especialidad, telefono]
    );

    await conn.commit();
    return getById(tecResult.insertId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function update(id, data) {
  const allowed = ['nombre', 'apellido', 'especialidad', 'telefono', 'disponible'];
  const fields = Object.keys(data).filter(k => allowed.includes(k));

  if (fields.length === 0) {
    const err = new Error('Sin campos válidos para actualizar');
    err.status = 400;
    throw err;
  }

  const values = fields.map(k => data[k]);
  const set = fields.map(k => `${k} = ?`).join(', ');

  await db.query(`UPDATE tecnicos SET ${set} WHERE id = ?`, [...values, id]);
  return getById(id);
}

// Elimina tecnico y su user asociado (CASCADE en la tabla lo maneja)
async function remove(id) {
  const tecnico = await getById(id);
  if (!tecnico) return false;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM tecnicos WHERE id = ?', [id]);
    await conn.query('DELETE FROM users WHERE id = ?', [tecnico.user_id]);
    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function assignSupervisor(tecnicoId, supervisorId) {
  const [supervisors] = await db.query(
    "SELECT id FROM users WHERE id = ? AND role = 'supervisor' AND activo = TRUE",
    [supervisorId]
  );
  if (supervisors.length === 0) {
    const err = new Error('El supervisor indicado no existe o no está activo');
    err.status = 400;
    throw err;
  }
  await db.query(
    `INSERT INTO supervisor_tecnicos (supervisor_id, tecnico_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE supervisor_id = VALUES(supervisor_id), assigned_at = CURRENT_TIMESTAMP`,
    [supervisorId, tecnicoId]
  );
  return getById(tecnicoId);
}

module.exports = { getAll, getById, create, update, remove, assignSupervisor };
