const db = require('../config/db');
const cache = require('../utils/memoryCache');
const { generateUniqueSlug } = require('../utils/slug');

const PUBLIC_CACHE_TTL_MS = 300 * 1000;
const PRIVATE_CACHE_TTL_MS = 30 * 1000;

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
         b.etiquetas, b.serie, b.orden_lectura, b.destacado, b.orden_portada,
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

function addResourceTypeCondition(conditions, values, type) {
  if (!type || type === 'Todos') return;
  const file = 'LOWER(COALESCE(b.archivo_url, ""))';
  if (type === 'pdf') {
    conditions.push(`${file} LIKE ?`);
    values.push('%.pdf%');
  } else if (type === 'video') {
    conditions.push(`(${file} LIKE ? OR ${file} LIKE ? OR ${file} LIKE ?)`);
    values.push('%.mp4%', '%.webm%', '%.mov%');
  } else if (type === 'doc') {
    conditions.push(`(${file} LIKE ? OR ${file} LIKE ? OR ${file} LIKE ? OR ${file} LIKE ? OR ${file} LIKE ? OR ${file} LIKE ?)`);
    values.push('%.doc%', '%.docx%', '%.odt%', '%.xls%', '%.xlsx%', '%.ppt%');
  } else if (type === 'link') {
    conditions.push(`NOT (${file} LIKE ? OR ${file} LIKE ? OR ${file} LIKE ? OR ${file} LIKE ? OR ${file} LIKE ? OR ${file} LIKE ? OR ${file} LIKE ? OR ${file} LIKE ? OR ${file} LIKE ?)`);
    values.push('%.pdf%', '%.mp4%', '%.webm%', '%.mov%', '%.doc%', '%.docx%', '%.odt%', '%.xls%', '%.xlsx%');
  }
}

function getOrderBy(sort, featuredFirst = false) {
  const prefix = featuredFirst
    ? 'b.destacado DESC, CASE WHEN b.orden_portada IS NULL THEN 1 ELSE 0 END ASC, b.orden_portada ASC, '
    : '';
  if (sort === 'az') return `${prefix}b.titulo ASC`;
  if (sort === 'oldest') return `${prefix}b.fecha_creacion ASC`;
  return `${prefix}b.fecha_creacion DESC`;
}

async function getAll({ user = null, status = null, scope = null, q = '', categoria = '', tipo = '', anio = '', orden = 'recent', limit = null, offset = null }) {
  const audience = user ? `${user.role}:${user.id}` : 'public';
  const key = `library:list:${audience}:${status || 'all'}:${scope || 'all'}:${q}:${categoria}:${tipo}:${anio}:${orden}:${limit || 'all'}:${offset || 0}`;
  return cache.getOrSet(
    key,
    () => queryAll({ user, status, scope, q, categoria, tipo, anio, orden, limit, offset }),
    user ? PRIVATE_CACHE_TTL_MS : PUBLIC_CACHE_TTL_MS
  );
}

async function queryAll({ user = null, status = null, scope = null, q = '', categoria = '', tipo = '', anio = '', orden = 'recent', limit = null, offset = null }) {
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

  if (q) {
    const term = `%${q.toLowerCase()}%`;
    conditions.push(`(
      LOWER(b.titulo) LIKE ?
      OR LOWER(COALESCE(b.descripcion, '')) LIKE ?
      OR LOWER(b.categoria) LIKE ?
      OR LOWER(COALESCE(b.serie, '')) LIKE ?
      OR LOWER(COALESCE(CAST(b.etiquetas AS CHAR), '')) LIKE ?
      OR LOWER(COALESCE(creator.full_name, creator.email, '')) LIKE ?
    )`);
    values.push(term, term, term, term, term, term);
  }

  if (categoria && categoria !== 'Todos') {
    conditions.push('b.categoria = ?');
    values.push(categoria);
  }

  addResourceTypeCondition(conditions, values, tipo);

  if (anio && anio !== 'Todos') {
    conditions.push('YEAR(b.fecha_creacion) = ?');
    values.push(Number(anio));
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limitClause = Number.isInteger(limit) && limit > 0
    ? ` LIMIT ${limit}${Number.isInteger(offset) && offset > 0 ? ` OFFSET ${offset}` : ''}`
    : '';
  const [rows] = await db.query(
    `${BASE_SELECT} ${where} ORDER BY ${getOrderBy(orden)}${limitClause}`,
    values
  );
  return parseDocumentRows(rows);
}

async function getHomepage({ limit = 12 } = {}) {
  return cache.getOrSet(
    `library:homepage:${limit}`,
    async () => {
      const [rows] = await db.query(
        `${BASE_SELECT}
         WHERE b.estado = 'aprobado' AND b.visibilidad = 'publica'
         ORDER BY ${getOrderBy('recent', true)}
         LIMIT ?`,
        [Number(limit) || 12]
      );
      return parseDocumentRows(rows);
    },
    PUBLIC_CACHE_TTL_MS
  );
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
       etiquetas, serie, orden_lectura, destacado, orden_portada,
       estado, visibilidad,
       creado_por, revisado_por, fecha_revision, observacion_revision)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      Boolean(data.destacado),
      data.orden_portada != null ? Number(data.orden_portada) : null,
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
  const allowed = ['titulo', 'descripcion', 'archivo_url', 'categoria', 'imagen_portada', 'visibilidad', 'etiquetas', 'serie', 'orden_lectura', 'destacado', 'orden_portada'];
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
  if (fields.includes('orden_portada') && values.orden_portada != null) {
    values.orden_portada = Number(values.orden_portada);
  }
  if (fields.includes('destacado')) {
    values.destacado = Boolean(values.destacado);
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
  getHomepage,
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
