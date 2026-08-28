const db = require('../config/db');
const cache = require('../utils/memoryCache');
const { generateUniqueSlug } = require('../utils/slug');

const PUBLIC_CACHE_TTL_MS = 600 * 1000;
const PRIVATE_CACHE_TTL_MS = 30 * 1000;

function invalidateProducerCache() {
  cache.invalidatePrefix('producers:');
}

const BASE_SELECT = `
  SELECT p.id, p.nombre, p.slug, p.descripcion, p.frase_corta, p.imagen_url, p.imagenes, p.comunidad, p.rol,
         p.anios_experiencia, p.distrito_id, p.activo, p.destacado, p.creado_por, p.created_at, p.updated_at,
         d.provincia AS provincia, d.distrito AS distrito,
         creator.email AS creado_por_email, creator.full_name AS creado_por_nombre
  FROM productores p
  JOIN users creator ON creator.id = p.creado_por
  LEFT JOIN distritos_panama d ON d.id = p.distrito_id
`;

async function getAll(user = null) {
  const audience = user ? `${user.role}:${user.id}` : 'public';
  return cache.getOrSet(
    `producers:list:${audience}`,
    () => queryAll(user),
    user ? PRIVATE_CACHE_TTL_MS : PUBLIC_CACHE_TTL_MS
  );
}

async function queryAll(user = null) {
  const isInternal = Boolean(user && user.role !== 'visitante');
  const where = isInternal ? '' : 'WHERE p.activo = TRUE';
  const [rows] = await db.query(
    `${BASE_SELECT} ${where} ORDER BY p.destacado DESC, p.created_at DESC`
  );
  return rows;
}

async function getById(id) {
  return cache.getOrSet(
    `producers:item:${id}`,
    () => queryById(id),
    PRIVATE_CACHE_TTL_MS
  );
}

async function queryById(id) {
  const [rows] = await db.query(`${BASE_SELECT} WHERE p.id = ?`, [id]);
  return rows[0] || null;
}

async function getBySlug(slug) {
  return cache.getOrSet(
    `producers:slug:${slug}`,
    () => queryBySlug(slug),
    PRIVATE_CACHE_TTL_MS
  );
}

async function queryBySlug(slug) {
  const [rows] = await db.query(`${BASE_SELECT} WHERE p.slug = ?`, [slug]);
  return rows[0] || null;
}

async function create(data, actor) {
  const slug = await generateUniqueSlug('productores', data.nombre);
  const [result] = await db.query(
    `INSERT INTO productores
      (nombre, slug, descripcion, frase_corta, imagen_url, imagenes, comunidad, rol, anios_experiencia, distrito_id, activo, destacado, creado_por)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.nombre,
      slug,
      data.descripcion || null,
      data.frase_corta || null,
      data.imagen_url || null,
      data.imagenes?.length ? JSON.stringify(data.imagenes) : null,
      data.comunidad || null,
      data.rol || null,
      data.anios_experiencia ?? null,
      data.distrito_id ?? null,
      data.activo ?? true,
      data.destacado ?? false,
      actor.id,
    ]
  );
  invalidateProducerCache();
  return getById(result.insertId);
}

async function update(id, data) {
  const allowed = [
    'nombre', 'descripcion', 'frase_corta', 'imagen_url', 'imagenes', 'comunidad', 'rol',
    'anios_experiencia', 'distrito_id', 'activo', 'destacado',
  ];
  const fields = Object.keys(data).filter(field => allowed.includes(field));
  if (!fields.length) {
    const err = new Error('Sin campos válidos para actualizar');
    err.status = 400;
    throw err;
  }

  const values = { ...data };
  if (fields.includes('imagenes')) {
    values.imagenes = Array.isArray(data.imagenes) && data.imagenes.length
      ? JSON.stringify(data.imagenes)
      : null;
  }
  if (fields.includes('nombre')) {
    values.slug = await generateUniqueSlug('productores', data.nombre, id);
    fields.push('slug');
  }

  await db.query(
    `UPDATE productores SET ${fields.map(field => `${field} = ?`).join(', ')} WHERE id = ?`,
    [...fields.map(field => values[field]), id]
  );
  invalidateProducerCache();
  return getById(id);
}

async function remove(id) {
  const [result] = await db.query('DELETE FROM productores WHERE id = ?', [id]);
  if (result.affectedRows > 0) invalidateProducerCache();
  return result.affectedRows > 0;
}

module.exports = { getAll, getById, getBySlug, create, update, remove };
