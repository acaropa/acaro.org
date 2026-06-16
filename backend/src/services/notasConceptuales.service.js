const db = require('../config/db');

async function getAll(userId, isAdmin) {
  const where = isAdmin ? '' : 'WHERE creado_por = ?';
  const values = isAdmin ? [] : [userId];
  const [rows] = await db.query(
    `SELECT nc.*, u.email AS creado_por_email, u.full_name AS creado_por_nombre
     FROM notas_conceptuales nc
     JOIN users u ON u.id = nc.creado_por
     ${where}
     ORDER BY nc.created_at DESC`,
    values
  );
  return rows.map(parseAgenda);
}

async function getById(id) {
  const [rows] = await db.query(
    `SELECT nc.*, u.email AS creado_por_email, u.full_name AS creado_por_nombre
     FROM notas_conceptuales nc
     JOIN users u ON u.id = nc.creado_por
     WHERE nc.id = ?`,
    [id]
  );
  return rows[0] ? parseAgenda(rows[0]) : null;
}

async function create(data, userId) {
  const fields = buildFields(data);
  const [result] = await db.query(
    `INSERT INTO notas_conceptuales
       (asociacion, titulo, subtitulo, fecha, lugar, horario,
        introduccion, objetivo, participantes_acaro, participantes_contraparte,
        temas, metodologia, agenda, resultados, productos, aprobacion,
        firmante_acaro, cargo_acaro, firmante_tecnico, cargo_tecnico,
        realizado_por, fecha_documento, creado_por)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [...fields, userId]
  );
  return getById(result.insertId);
}

async function update(id, data) {
  const fields = buildFields(data);
  await db.query(
    `UPDATE notas_conceptuales SET
       asociacion = ?, titulo = ?, subtitulo = ?, fecha = ?, lugar = ?, horario = ?,
       introduccion = ?, objetivo = ?, participantes_acaro = ?, participantes_contraparte = ?,
       temas = ?, metodologia = ?, agenda = ?, resultados = ?, productos = ?, aprobacion = ?,
       firmante_acaro = ?, cargo_acaro = ?, firmante_tecnico = ?, cargo_tecnico = ?,
       realizado_por = ?, fecha_documento = ?
     WHERE id = ?`,
    [...fields, id]
  );
  return getById(id);
}

async function remove(id) {
  await db.query('DELETE FROM notas_conceptuales WHERE id = ?', [id]);
}

function buildFields(data) {
  return [
    data.asociacion,
    data.titulo,
    data.subtitulo,
    data.fecha,
    data.lugar,
    data.horario,
    data.introduccion,
    data.objetivo,
    data.participantes_acaro,
    data.participantes_contraparte,
    data.temas,
    data.metodologia,
    JSON.stringify(data.agenda || []),
    data.resultados,
    data.productos,
    data.aprobacion,
    data.firmante_acaro,
    data.cargo_acaro,
    data.firmante_tecnico,
    data.cargo_tecnico,
    data.realizado_por,
    data.fecha_documento,
  ];
}

function parseAgenda(row) {
  if (row && typeof row.agenda === 'string') {
    try { row.agenda = JSON.parse(row.agenda); } catch { row.agenda = []; }
  }
  return row;
}

module.exports = { getAll, getById, create, update, remove };
