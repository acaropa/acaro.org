const db = require('../config/db');
const cache = require('../utils/memoryCache');

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
  SELECT b.id, b.titulo, b.descripcion, b.archivo_url, b.categoria,
         b.estado, b.visibilidad, b.creado_por, b.revisado_por,
         b.fecha_creacion, b.fecha_revision, b.observacion_revision,
         creator.email AS creado_por_email,
         reviewer.email AS revisado_por_email
  FROM biblioteca b
  JOIN users creator ON creator.id = b.creado_por
  LEFT JOIN users reviewer ON reviewer.id = b.revisado_por
`;

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
  return rows;
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
  return rows[0] || null;
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
  const [result] = await db.query(
    `INSERT INTO biblioteca
      (titulo, descripcion, archivo_url, categoria, estado, visibilidad,
       creado_por, revisado_por, fecha_revision, observacion_revision)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.titulo,
      data.descripcion || null,
      data.archivo_url,
      data.categoria,
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
  const allowed = ['titulo', 'descripcion', 'archivo_url', 'categoria', 'visibilidad'];
  const fields = Object.keys(data).filter(field => allowed.includes(field));
  if (fields.length === 0) {
    const err = new Error('Sin campos válidos para actualizar');
    err.status = 400;
    throw err;
  }

  await db.query(
    `UPDATE biblioteca SET ${fields.map(field => `${field} = ?`).join(', ')} WHERE id = ?`,
    [...fields.map(field => data[field]), id]
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

module.exports = {
  STATES,
  VISIBILITIES,
  getAll,
  getById,
  create,
  update,
  resubmit,
  review,
  remove,
  canSupervisorAccess,
};
