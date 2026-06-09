const db = require('../config/db');

// ─── PROYECTOS ────────────────────────────────────────────────────────────────

// soloPublicos=true cuando lo llama la landing sin sesión
async function getAll(soloPublicos = false) {
  const where = soloPublicos ? "WHERE p.tipo = 'publico' AND p.estado != 'cancelado'" : '';
  const [rows] = await db.query(
    `SELECT p.id, p.nombre, p.descripcion, p.tipo, p.clasificacion,
            p.estado, p.fecha_inicio, p.fecha_fin, p.created_at,
            u.email AS responsable_email
     FROM proyectos p
     LEFT JOIN users u ON u.id = p.responsable_id
     ${where}
     ORDER BY p.created_at DESC`
  );
  return rows;
}

async function getById(id) {
  const [proyectos] = await db.query(
    `SELECT p.id, p.nombre, p.descripcion, p.tipo, p.clasificacion,
            p.estado, p.fecha_inicio, p.fecha_fin, p.responsable_id, p.created_at,
            u.email AS responsable_email
     FROM proyectos p
     LEFT JOIN users u ON u.id = p.responsable_id
     WHERE p.id = ?`,
    [id]
  );
  if (!proyectos[0]) return null;
  const proyecto = proyectos[0];

  const [tecnicos] = await db.query(
    `SELECT t.id, t.nombre, t.apellido, t.especialidad, pt.fecha_asignacion
     FROM tecnicos t
     JOIN proyecto_tecnicos pt ON pt.tecnico_id = t.id
     WHERE pt.proyecto_id = ?`,
    [id]
  );

  const [fases] = await db.query(
    `SELECT id, nombre, descripcion, orden, estado, fecha_inicio, fecha_fin
     FROM proyecto_fases
     WHERE proyecto_id = ?
     ORDER BY orden`,
    [id]
  );

  if (fases.length > 0) {
    const faseIds = fases.map(f => f.id);
    const [imagenes] = await db.query(
      `SELECT id, fase_id, url, descripcion FROM fase_imagenes WHERE fase_id IN (?)`,
      [faseIds]
    );
    for (const fase of fases) {
      fase.imagenes = imagenes.filter(img => img.fase_id === fase.id);
    }
  } else {
    fases.forEach(f => (f.imagenes = []));
  }

  proyecto.tecnicos = tecnicos;
  proyecto.fases = fases;
  return proyecto;
}

async function create(data) {
  const {
    nombre, descripcion = null, tipo = 'publico', clasificacion = null,
    estado = 'pendiente', fecha_inicio = null, fecha_fin = null, responsable_id = null,
  } = data;

  const [result] = await db.query(
    `INSERT INTO proyectos (nombre, descripcion, tipo, clasificacion, estado, fecha_inicio, fecha_fin, responsable_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombre, descripcion, tipo, clasificacion, estado, fecha_inicio, fecha_fin, responsable_id]
  );
  return getById(result.insertId);
}

async function update(id, data) {
  const allowed = ['nombre', 'descripcion', 'tipo', 'clasificacion', 'estado', 'fecha_inicio', 'fecha_fin', 'responsable_id'];
  const fields = Object.keys(data).filter(k => allowed.includes(k));

  if (fields.length === 0) {
    const err = new Error('Sin campos válidos para actualizar');
    err.status = 400;
    throw err;
  }

  const set = fields.map(k => `${k} = ?`).join(', ');
  await db.query(`UPDATE proyectos SET ${set} WHERE id = ?`, [...fields.map(k => data[k]), id]);
  return getById(id);
}

async function remove(id) {
  const [result] = await db.query('DELETE FROM proyectos WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

// ─── TÉCNICOS EN PROYECTO ─────────────────────────────────────────────────────

async function assignTecnico(proyectoId, tecnicoId, fecha_asignacion) {
  await db.query(
    `INSERT INTO proyecto_tecnicos (proyecto_id, tecnico_id, fecha_asignacion)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE fecha_asignacion = VALUES(fecha_asignacion)`,
    [proyectoId, tecnicoId, fecha_asignacion]
  );
}

async function removeTecnico(proyectoId, tecnicoId) {
  const [result] = await db.query(
    'DELETE FROM proyecto_tecnicos WHERE proyecto_id = ? AND tecnico_id = ?',
    [proyectoId, tecnicoId]
  );
  return result.affectedRows > 0;
}

// ─── FASES ────────────────────────────────────────────────────────────────────

async function createFase(proyectoId, data) {
  const { nombre, descripcion = null, orden = 1, estado = 'pendiente', fecha_inicio = null, fecha_fin = null } = data;

  const [result] = await db.query(
    `INSERT INTO proyecto_fases (proyecto_id, nombre, descripcion, orden, estado, fecha_inicio, fecha_fin)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [proyectoId, nombre, descripcion, orden, estado, fecha_inicio, fecha_fin]
  );

  const [rows] = await db.query('SELECT * FROM proyecto_fases WHERE id = ?', [result.insertId]);
  return rows[0];
}

async function updateFase(faseId, data) {
  const allowed = ['nombre', 'descripcion', 'orden', 'estado', 'fecha_inicio', 'fecha_fin'];
  const fields = Object.keys(data).filter(k => allowed.includes(k));

  if (fields.length === 0) {
    const err = new Error('Sin campos válidos para actualizar');
    err.status = 400;
    throw err;
  }

  const set = fields.map(k => `${k} = ?`).join(', ');
  await db.query(`UPDATE proyecto_fases SET ${set} WHERE id = ?`, [...fields.map(k => data[k]), faseId]);

  const [rows] = await db.query('SELECT * FROM proyecto_fases WHERE id = ?', [faseId]);
  return rows[0] || null;
}

async function removeFase(faseId) {
  const [result] = await db.query('DELETE FROM proyecto_fases WHERE id = ?', [faseId]);
  return result.affectedRows > 0;
}

// ─── IMÁGENES ─────────────────────────────────────────────────────────────────

async function addImagen(faseId, url, descripcion = null) {
  const [result] = await db.query(
    'INSERT INTO fase_imagenes (fase_id, url, descripcion) VALUES (?, ?, ?)',
    [faseId, url, descripcion]
  );
  const [rows] = await db.query('SELECT * FROM fase_imagenes WHERE id = ?', [result.insertId]);
  return rows[0];
}

async function removeImagen(imagenId) {
  const [result] = await db.query('DELETE FROM fase_imagenes WHERE id = ?', [imagenId]);
  return result.affectedRows > 0;
}

module.exports = {
  getAll, getById, create, update, remove,
  assignTecnico, removeTecnico,
  createFase, updateFase, removeFase,
  addImagen, removeImagen,
};
