const db = require('../config/db');
const cache = require('../utils/memoryCache');
const { generateUniqueSlug } = require('../utils/slug');

const NON_PUBLISH_STATES = ['borrador', 'pendiente', 'archivada'];

function invalidateNewsCache() {
  cache.invalidatePrefix('news:');
}

async function getAll(includeInternal = false, user = null) {
  const audience = includeInternal ? 'internal' : user ? `own:${user.id}` : 'public';
  return cache.getOrSet(
    `news:list:${audience}`,
    () => queryAll(includeInternal, user),
    includeInternal || user ? 15 * 1000 : 60 * 1000
  );
}

async function queryAll(includeInternal = false, user = null) {
  let where = "WHERE n.estado = 'publicada' AND n.visibilidad = 'publica'";
  const values = [];
  if (includeInternal) {
    where = '';
  } else if (user) {
    where = "WHERE (n.estado = 'publicada' AND n.visibilidad = 'publica') OR n.creado_por = ?";
    values.push(user.id);
  }

  const [rows] = await db.query(
    `SELECT n.id, n.titulo, n.slug, n.resumen, n.contenido, n.categoria, n.imagen_portada,
            n.estado, n.visibilidad,
            n.creado_por, n.publicado_por, n.fecha_creacion, n.fecha_publicacion,
            creator.email AS creado_por_email, creator.full_name AS creado_por_nombre,
            publisher.email AS publicado_por_email, publisher.full_name AS publicado_por_nombre
     FROM noticias n
     JOIN users creator ON creator.id = n.creado_por
     LEFT JOIN users publisher ON publisher.id = n.publicado_por
     ${where}
     ORDER BY COALESCE(n.fecha_publicacion, n.fecha_creacion) DESC`,
    values
  );
  return rows;
}

async function getById(id) {
  return cache.getOrSet(
    `news:item:${id}`,
    () => queryById(id),
    15 * 1000
  );
}

async function queryById(id) {
  const [rows] = await db.query('SELECT * FROM noticias WHERE id = ?', [id]);
  return rows[0] || null;
}

async function getBySlug(slug, includeInternal = false) {
  return cache.getOrSet(
    `news:slug:${slug}:${includeInternal ? 'internal' : 'public'}`,
    () => queryBySlug(slug, includeInternal),
    includeInternal ? 15 * 1000 : 60 * 1000
  );
}

async function queryBySlug(slug, includeInternal = false) {
  const [rows] = await db.query(
    `SELECT n.id, n.titulo, n.slug, n.resumen, n.contenido, n.categoria, n.imagen_portada,
            n.estado, n.visibilidad,
            n.creado_por, n.publicado_por, n.fecha_creacion, n.fecha_publicacion,
            creator.email AS creado_por_email, creator.full_name AS creado_por_nombre,
            publisher.email AS publicado_por_email, publisher.full_name AS publicado_por_nombre
     FROM noticias n
     JOIN users creator ON creator.id = n.creado_por
     LEFT JOIN users publisher ON publisher.id = n.publicado_por
     WHERE n.slug = ?
     ${includeInternal ? '' : "AND n.estado = 'publicada' AND n.visibilidad = 'publica'"}`,
    [slug]
  );
  return rows[0] || null;
}

async function create(data, actor) {
  const slug = await generateUniqueSlug('noticias', data.titulo);
  const estado = actor.role === 'tecnico' ? 'pendiente' : 'borrador';
  const [result] = await db.query(
    `INSERT INTO noticias (titulo, slug, resumen, contenido, categoria, imagen_portada, estado, visibilidad, creado_por)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.titulo,
      slug,
      data.resumen || null,
      data.contenido,
      data.categoria || 'General',
      data.imagen_portada || null,
      estado,
      data.visibilidad || 'publica',
      actor.id,
    ]
  );
  invalidateNewsCache();
  return getById(result.insertId);
}

async function update(id, data) {
  const allowed = ['titulo', 'resumen', 'contenido', 'categoria', 'visibilidad', 'imagen_portada', 'estado'];
  const fields = Object.keys(data).filter(field => allowed.includes(field));
  if (!fields.length) {
    const err = new Error('Sin campos válidos para actualizar');
    err.status = 400;
    throw err;
  }

  if (fields.includes('estado') && !NON_PUBLISH_STATES.includes(data.estado)) {
    const err = new Error('Estado inválido. Usa el endpoint de publicación para publicar.');
    err.status = 400;
    throw err;
  }

  const values = { ...data };
  if (fields.includes('titulo')) {
    values.slug = await generateUniqueSlug('noticias', data.titulo, id);
    fields.push('slug');
  }

  await db.query(
    `UPDATE noticias SET ${fields.map(field => `${field} = ?`).join(', ')} WHERE id = ?`,
    [...fields.map(field => values[field]), id]
  );
  invalidateNewsCache();
  return getById(id);
}

async function publish(id, userId) {
  await db.query(
    `UPDATE noticias
     SET estado = 'publicada', publicado_por = ?, fecha_publicacion = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [userId, id]
  );
  invalidateNewsCache();
  return getById(id);
}

async function remove(id) {
  const [result] = await db.query('DELETE FROM noticias WHERE id = ?', [id]);
  if (result.affectedRows > 0) invalidateNewsCache();
  return result.affectedRows > 0;
}

module.exports = { getAll, getById, getBySlug, create, update, publish, remove, NON_PUBLISH_STATES };
