const db = require('../config/db');
const cache = require('../utils/memoryCache');
const { generateUniqueSlug } = require('../utils/slug');

const PUBLIC_CACHE_TTL_MS = 60 * 1000;
const PRIVATE_CACHE_TTL_MS = 15 * 1000;

function invalidateLibraryCache() {
  cache.invalidatePrefix('library:');
}

const STATES = [
  'borrador',
  'pendiente_revision',
  'requiere_correccion',
  'aprobado',
  'rechazado',
  'archivado',
];

const VISIBILITIES = ['publica', 'interna'];

const BASE_SELECT = `
  SELECT b.id, b.titulo, b.slug, b.descripcion, b.archivo_url, b.categoria, b.imagen_portada,
         b.etiquetas, b.serie, b.orden_lectura,
         b.estado, b.visibilidad, b.creado_por, b.revisado_por,
         b.fecha_creacion, b.fecha_revision, b.observacion_revision,
         creator.email AS creado_por_email, creator.full_name AS creado_por_nombre,
         reviewer.email AS revisado_por_email, reviewer.full_name AS revisado_por_nombre
  FROM biblioteca b
  JOIN users creator ON creator.id = b.creado_por
  LEFT JOIN users reviewer ON reviewer.id = b.revisado_por
`;

function parseDocumentRows(rows) {
  return rows.map(row => {
    if (typeof row.etiquetas === 'string') {
      try {
        row.etiquetas = JSON.parse(row.etiquetas);
      } catch {
        row.etiquetas = null;
      }
    }
    return row;
  });
}

async function getAll({ user = null, status = null, scope = null }) {
  const audience = user ? `${user.role}:${user.id}` : 'public';
  const key = `library:list:${audience}:${status || 'all'}:${scope || 'all'}`;
  return cache.getOrSet(
    key,
    () => queryAll({ user, status, scope }),
    user ? PRIVATE_CACHE_TTL_MS : PUBLIC_CACHE_TTL_MS
  );
}

async function queryAll({ user = null, status = null, scope = null }) {
  const conditions = [];
  const values = [];

  if (!user || user.role === 'visitante') {
    conditions.push("b.estado = 'aprobado'", "b.visibilidad = 'publica'");
  } else if (user.role === 'tecnico') {
    if (scope === 'mine') {
      conditions.push('b.creado_por = ?');
      values.push(user.id);
    } else {
      conditions.push("((b.estado = 'aprobado') OR b.creado_por = ?)");
      values.push(user.id);
    }
  } else if (user.role === 'supervisor') {
    if (scope === 'mine') {
      conditions.push('b.creado_por = ?');
      values.push(user.id);
    } else {
      conditions.push(`(
        b.creado_por = ?
        OR EXISTS (
          SELECT 1
          FROM supervisor_tecnicos st
          JOIN tecnicos t ON t.id = st.tecnico_id
          WHERE st.supervisor_id = ? AND t.user_id = b.creado_por
        )
      )`);
      values.push(user.id, user.id);
    }
  } else if (scope === 'mine') {
    conditions.push('b.creado_por = ?');
    values.push(user.id);
  }

  if (status) {
    conditions.push('b.estado = ?');
    values.push(status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await db.query(
    `${BASE_SELECT} ${where} ORDER BY b.fecha_creacion DESC`,
    values
  );
  return parseDocumentRows(rows);
}

async function canSupervisorAccess(documentId, supervisorId) {
  const [rows] = await db.query(
    `SELECT 1
     FROM biblioteca b
     WHERE b.id = ?
       AND (
         b.creado_por = ?
         OR EXISTS (
           SELECT 1
           FROM supervisor_tecnicos st
           JOIN tecnicos t ON t.id = st.tecnico_id
           WHERE st.supervisor_id = ? AND t.user_id = b.creado_por
         )
       )`,
    [documentId, supervisorId, supervisorId]
  );
  return rows.length > 0;
}

async function getById(id) {
  return cache.getOrSet(
    `library:item:${id}`,
    () => queryById(id),
    PRIVATE_CACHE_TTL_MS
  );
}

async function queryById(id) {
  const [rows] = await db.query(`${BASE_SELECT} WHERE b.id = ?`, [id]);
  return parseDocumentRows(rows)[0] || null;
}

async function getBySlug(slug) {
  return cache.getOrSet(
    `library:slug:${slug}`,
    () => queryBySlug(slug),
    PRIVATE_CACHE_TTL_MS
  );
}

async function queryBySlug(slug) {
  const [rows] = await db.query(`${BASE_SELECT} WHERE b.slug = ?`, [slug]);
  return parseDocumentRows(rows)[0] || null;
}

async function create(data, actor) {
  const initialState =
    actor.role === 'tecnico'
      ? 'pendiente_revision'
      : data.estado && STATES.includes(data.estado)
        ? data.estado
        : 'aprobado';

  const reviewer = initialState === 'aprobado' ? actor.id : null;
  const reviewDate = initialState === 'aprobado' ? new Date() : null;
  const slug = await generateUniqueSlug('biblioteca', data.titulo);
  const [result] = await db.query(
    `INSERT INTO biblioteca
      (titulo, slug, descripcion, archivo_url, categoria, imagen_portada,
       etiquetas, serie, orden_lectura,
       estado, visibilidad,
       creado_por, revisado_por, fecha_revision, observacion_revision)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.titulo,
      slug,
      data.descripcion || null,
      data.archivo_url,
      data.categoria,
      data.imagen_portada || null,
      data.etiquetas ? JSON.stringify(data.etiquetas) : null,
      data.serie || null,
      data.orden_lectura != null ? Number(data.orden_lectura) : null,
      initialState,
      data.visibilidad,
      actor.id,
      reviewer,
      reviewDate,
      data.observacion_revision || null,
    ]
  );
  invalidateLibraryCache();
  return getById(result.insertId);
}

async function update(id, data) {
  const allowed = ['titulo', 'descripcion', 'archivo_url', 'categoria', 'imagen_portada', 'visibilidad', 'etiquetas', 'serie', 'orden_lectura'];
  const fields = Object.keys(data).filter(field => allowed.includes(field));
  if (fields.length === 0) {
    const err = new Error('Sin campos válidos para actualizar');
    err.status = 400;
    throw err;
  }

  const values = { ...data };
  if (fields.includes('titulo')) {
    values.slug = await generateUniqueSlug('biblioteca', data.titulo, id);
    fields.push('slug');
  }
  if (fields.includes('etiquetas') && values.etiquetas) {
    values.etiquetas = JSON.stringify(values.etiquetas);
  }
  if (fields.includes('orden_lectura') && values.orden_lectura != null) {
    values.orden_lectura = Number(values.orden_lectura);
  }

  await db.query(
    `UPDATE biblioteca SET ${fields.map(field => `${field} = ?`).join(', ')} WHERE id = ?`,
    [...fields.map(field => values[field]), id]
  );
  invalidateLibraryCache();
  return getById(id);
}

async function resubmit(id) {
  await db.query(
    `UPDATE biblioteca
     SET estado = 'pendiente_revision', revisado_por = NULL,
         fecha_revision = NULL, observacion_revision = NULL
     WHERE id = ?`,
    [id]
  );
  invalidateLibraryCache();
  return getById(id);
}

async function review(id, { state, reviewerId, observation }) {
  await db.query(
    `UPDATE biblioteca
     SET estado = ?, revisado_por = ?, fecha_revision = CURRENT_TIMESTAMP,
         observacion_revision = ?
     WHERE id = ?`,
    [state, reviewerId, observation || null, id]
  );
  invalidateLibraryCache();
  return getById(id);
}

async function remove(id) {
  const [result] = await db.query('DELETE FROM biblioteca WHERE id = ?', [id]);
  if (result.affectedRows > 0) invalidateLibraryCache();
  return result.affectedRows > 0;
}

async function getBySerie(serie) {
  if (!serie) return [];
  const [rows] = await db.query(
    `${BASE_SELECT} WHERE b.serie = ? AND b.estado = 'aprobado' AND b.visibilidad = 'publica' ORDER BY b.orden_lectura ASC, b.fecha_creacion ASC`,
    [serie]
  );
  return parseDocumentRows(rows);
}

module.exports = {
  STATES,
  VISIBILITIES,
  getAll,
  getById,
  getBySlug,
  create,
  update,
  resubmit,
  review,
  remove,
  canSupervisorAccess,
  getBySerie,
};
