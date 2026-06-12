const db = require('../config/db');

async function getAll(includeInternal = false) {
  const [rows] = await db.query(
    `SELECT n.id, n.titulo, n.resumen, n.contenido, n.estado, n.visibilidad,
            n.creado_por, n.publicado_por, n.fecha_creacion, n.fecha_publicacion,
            creator.email AS creado_por_email
     FROM noticias n
     JOIN users creator ON creator.id = n.creado_por
     ${includeInternal ? '' : "WHERE n.estado = 'publicada' AND n.visibilidad = 'publica'"}
     ORDER BY COALESCE(n.fecha_publicacion, n.fecha_creacion) DESC`
  );
  return rows;
}

async function getById(id) {
  const [rows] = await db.query('SELECT * FROM noticias WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create(data, userId) {
  const [result] = await db.query(
    `INSERT INTO noticias (titulo, resumen, contenido, visibilidad, creado_por)
     VALUES (?, ?, ?, ?, ?)`,
    [data.titulo, data.resumen || null, data.contenido, data.visibilidad || 'publica', userId]
  );
  return getById(result.insertId);
}

async function update(id, data) {
  const allowed = ['titulo', 'resumen', 'contenido', 'visibilidad'];
  const fields = Object.keys(data).filter(field => allowed.includes(field));
  if (!fields.length) {
    const err = new Error('Sin campos válidos para actualizar');
    err.status = 400;
    throw err;
  }
  await db.query(
    `UPDATE noticias SET ${fields.map(field => `${field} = ?`).join(', ')} WHERE id = ?`,
    [...fields.map(field => data[field]), id]
  );
  return getById(id);
}

async function publish(id, userId) {
  await db.query(
    `UPDATE noticias
     SET estado = 'publicada', publicado_por = ?, fecha_publicacion = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [userId, id]
  );
  return getById(id);
}

async function remove(id) {
  const [result] = await db.query('DELETE FROM noticias WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { getAll, getById, create, update, publish, remove };
