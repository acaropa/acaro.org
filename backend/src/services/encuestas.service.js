const db = require('../config/db');
const cache = require('../utils/memoryCache');
const { generateUniqueSlug } = require('../utils/slug');
const crypto = require('crypto');

function invalidateCache() {
  cache.invalidatePrefix('enc:');
}

// ─── ENCUESTAS ────────────────────────────────────────────

async function getAll(includeAll = false) {
  const cacheKey = `enc:list:${includeAll ? 'all' : 'published'}`;
  return cache.getOrSet(cacheKey, () => queryAll(includeAll), includeAll ? 10_000 : 60_000);
}

async function queryAll(includeAll = false) {
  const where = includeAll ? '' : "WHERE e.estado = 'publicada'";
  const [rows] = await db.query(
    `SELECT e.id, e.titulo, e.slug, e.descripcion, e.estado, e.visibilidad,
            e.logo_url, e.fecha_inicio, e.fecha_cierre,
            e.requiere_login, e.permitir_multiples_respuestas,
            e.created_by_user_id, e.reviewed_by_user_id, e.published_by_user_id,
            e.created_at, e.updated_at,
            creator.full_name AS creado_por_nombre, creator.email AS creado_por_email,
            (SELECT COUNT(*) FROM encuesta_preguntas p WHERE p.encuesta_id = e.id) AS question_count,
            (SELECT COUNT(*) FROM encuesta_respuestas r WHERE r.encuesta_id = e.id AND r.estado = 'enviada') AS response_count
     FROM encuestas e
     JOIN users creator ON creator.id = e.created_by_user_id
     ${where}
     ORDER BY e.created_at DESC`
  );
  return rows;
}

async function getById(id) {
  return cache.getOrSet(`enc:item:${id}`, () => queryById(id), 15_000);
}

async function queryById(id) {
  const [rows] = await db.query(
    `SELECT e.*,
            creator.full_name AS creado_por_nombre, creator.email AS creado_por_email,
            reviewer.full_name AS revisado_por_nombre,
            publisher.full_name AS publicado_por_nombre
     FROM encuestas e
     JOIN users creator ON creator.id = e.created_by_user_id
     LEFT JOIN users reviewer ON reviewer.id = e.reviewed_by_user_id
     LEFT JOIN users publisher ON publisher.id = e.published_by_user_id
     WHERE e.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function getFullById(id) {
  const encuesta = await getById(id);
  if (!encuesta) return null;

  const [secciones] = await db.query(
    'SELECT * FROM encuesta_secciones WHERE encuesta_id = ? ORDER BY posicion', [id]
  );
  const [preguntas] = await db.query(
    'SELECT * FROM encuesta_preguntas WHERE encuesta_id = ? ORDER BY posicion', [id]
  );
  const preguntaIds = preguntas.map(p => p.id);
  let opciones = [];
  if (preguntaIds.length) {
    const [opcs] = await db.query(
      `SELECT * FROM encuesta_opciones WHERE pregunta_id IN (${preguntaIds.map(() => '?').join(',')}) ORDER BY posicion`,
      preguntaIds
    );
    opciones = opcs;
  }

  const preguntasConOpciones = preguntas.map(p => ({
    ...p,
    opciones: opciones.filter(o => o.pregunta_id === p.id),
  }));

  return {
    ...encuesta,
    secciones,
    preguntas: preguntasConOpciones,
  };
}

async function getPublicBySlug(slug) {
  return cache.getOrSet(
    `enc:slug:${slug}`,
    () => queryPublicBySlug(slug),
    60_000
  );
}

async function queryPublicBySlug(slug) {
  const [rows] = await db.query(
    `SELECT * FROM encuestas WHERE slug = ? AND estado = 'publicada'`, [slug]
  );
  const encuesta = rows[0];
  if (!encuesta) return null;

  const [secciones] = await db.query(
    'SELECT * FROM encuesta_secciones WHERE encuesta_id = ? ORDER BY posicion', [encuesta.id]
  );
  const [preguntas] = await db.query(
    'SELECT * FROM encuesta_preguntas WHERE encuesta_id = ? ORDER BY posicion', [encuesta.id]
  );
  const preguntaIds = preguntas.map(p => p.id);
  let opciones = [];
  if (preguntaIds.length) {
    const [opcs] = await db.query(
      `SELECT * FROM encuesta_opciones WHERE pregunta_id IN (${preguntaIds.map(() => '?').join(',')}) ORDER BY posicion`,
      preguntaIds
    );
    opciones = opcs;
  }

  return {
    ...encuesta,
    secciones,
    preguntas: preguntas.map(p => ({
      ...p,
      opciones: opciones.filter(o => o.pregunta_id === p.id),
    })),
  };
}

async function create(data, actor) {
  const slug = await generateUniqueSlug('encuestas', data.titulo);
  const [result] = await db.query(
    `INSERT INTO encuestas
       (titulo, slug, descripcion, estado, visibilidad, logo_url,
        created_by_user_id, fecha_inicio, fecha_cierre,
        requiere_login, permitir_multiples_respuestas,
        mensaje_confirmacion, configuracion_json)
     VALUES (?, ?, ?, 'borrador', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.titulo,
      slug,
      data.descripcion || null,
      data.visibilidad || 'publica',
      data.logo_url || null,
      actor.id,
      data.fecha_inicio || null,
      data.fecha_cierre || null,
      data.requiere_login ? 1 : 0,
      data.permitir_multiples_respuestas ? 1 : 0,
      data.mensaje_confirmacion || null,
      data.configuracion_json ? JSON.stringify(data.configuracion_json) : null,
    ]
  );
  invalidateCache();
  return getById(result.insertId);
}

async function update(id, data) {
  const allowed = [
    'titulo', 'descripcion', 'visibilidad', 'logo_url',
    'fecha_inicio', 'fecha_cierre', 'requiere_login',
    'permitir_multiples_respuestas', 'mensaje_confirmacion', 'configuracion_json',
  ];
  const fields = Object.keys(data).filter(f => allowed.includes(f));
  if (!fields.length) {
    const err = new Error('Sin campos válidos para actualizar');
    err.status = 400;
    throw err;
  }

  const values = { ...data };
  if (fields.includes('titulo')) {
    values.slug = await generateUniqueSlug('encuestas', data.titulo, id);
    fields.push('slug');
  }
  if (fields.includes('configuracion_json') && typeof values.configuracion_json === 'object') {
    values.configuracion_json = JSON.stringify(values.configuracion_json);
  }

  await db.query(
    `UPDATE encuestas SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`,
    [...fields.map(f => values[f] ?? null), id]
  );
  invalidateCache();
  return getById(id);
}

async function changeEstado(id, nuevoEstado, userId) {
  const validTransitions = {
    borrador: ['pendiente_revision', 'publicada'],
    pendiente_revision: ['borrador', 'publicada'],
    publicada: ['cerrada'],
    cerrada: ['archivada', 'publicada'],
    archivada: ['borrador'],
  };
  const encuesta = await getById(id);
  if (!encuesta) return null;

  const allowed = validTransitions[encuesta.estado] || [];
  if (!allowed.includes(nuevoEstado)) {
    const err = new Error(`No se puede cambiar de '${encuesta.estado}' a '${nuevoEstado}'`);
    err.status = 400;
    throw err;
  }

  const updates = { estado: nuevoEstado };
  if (nuevoEstado === 'publicada') {
    updates.published_by_user_id = userId;
  }
  if (nuevoEstado === 'pendiente_revision') {
    updates.reviewed_by_user_id = null;
  }

  const setClauses = Object.keys(updates).map(k => `${k} = ?`);
  await db.query(
    `UPDATE encuestas SET ${setClauses.join(', ')} WHERE id = ?`,
    [...Object.values(updates), id]
  );
  invalidateCache();
  return getById(id);
}

async function duplicate(id, actor) {
  const original = await getFullById(id);
  if (!original) return null;

  const newSlug = await generateUniqueSlug('encuestas', `${original.titulo} (copia)`);
  const [result] = await db.query(
    `INSERT INTO encuestas
       (titulo, slug, descripcion, estado, visibilidad, logo_url,
        created_by_user_id, requiere_login, permitir_multiples_respuestas,
        mensaje_confirmacion, configuracion_json)
     VALUES (?, ?, ?, 'borrador', ?, ?, ?, ?, ?, ?, ?)`,
    [
      `${original.titulo} (copia)`,
      newSlug,
      original.descripcion,
      original.visibilidad,
      original.logo_url,
      actor.id,
      original.requiere_login,
      original.permitir_multiples_respuestas,
      original.mensaje_confirmacion,
      original.configuracion_json,
    ]
  );
  const newId = result.insertId;

  const seccionMap = {};
  for (const sec of original.secciones) {
    const [secResult] = await db.query(
      `INSERT INTO encuesta_secciones (encuesta_id, titulo, descripcion, posicion)
       VALUES (?, ?, ?, ?)`,
      [newId, sec.titulo, sec.descripcion, sec.posicion]
    );
    seccionMap[sec.id] = secResult.insertId;
  }

  for (const preg of original.preguntas) {
    const newSecId = preg.seccion_id ? seccionMap[preg.seccion_id] || null : null;
    const [pregResult] = await db.query(
      `INSERT INTO encuesta_preguntas
         (encuesta_id, seccion_id, codigo_pregunta, texto_pregunta, tipo_pregunta,
          posicion, texto_ayuda, reglas_validacion, es_obligatoria)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId, newSecId, preg.codigo_pregunta, preg.texto_pregunta,
        preg.tipo_pregunta, preg.posicion, preg.texto_ayuda,
        preg.reglas_validacion ? JSON.stringify(preg.reglas_validacion) : null,
        preg.es_obligatoria,
      ]
    );
    const newPregId = pregResult.insertId;

    for (const opc of preg.opciones) {
      await db.query(
        `INSERT INTO encuesta_opciones
           (pregunta_id, valor_opcion, etiqueta_opcion, posicion, permite_texto_libre)
         VALUES (?, ?, ?, ?, ?)`,
        [newPregId, opc.valor_opcion, opc.etiqueta_opcion, opc.posicion, opc.permite_texto_libre]
      );
    }
  }

  invalidateCache();
  return getById(newId);
}

async function remove(id) {
  const [result] = await db.query('DELETE FROM encuestas WHERE id = ?', [id]);
  if (result.affectedRows > 0) invalidateCache();
  return result.affectedRows > 0;
}

// ─── SECCIONES Y PREGUNTAS (editor) ──────────────────────

async function saveSecciones(encuestaId, secciones) {
  const [existing] = await db.query(
    'SELECT id FROM encuesta_secciones WHERE encuesta_id = ?', [encuestaId]
  );
  const existingIds = new Set(existing.map(s => s.id));
  const submittedIds = new Set(secciones.filter(s => s.id).map(s => s.id));

  for (const oldId of existingIds) {
    if (!submittedIds.has(oldId)) {
      await db.query('DELETE FROM encuesta_secciones WHERE id = ?', [oldId]);
    }
  }

  const seccionMap = {};
  for (let i = 0; i < secciones.length; i++) {
    const sec = secciones[i];
    if (sec.id && existingIds.has(sec.id)) {
      await db.query(
        'UPDATE encuesta_secciones SET titulo = ?, descripcion = ?, posicion = ? WHERE id = ?',
        [sec.titulo, sec.descripcion || null, i + 1, sec.id]
      );
      seccionMap[sec._tempId || sec.id] = sec.id;
    } else {
      const [result] = await db.query(
        'INSERT INTO encuesta_secciones (encuesta_id, titulo, descripcion, posicion) VALUES (?, ?, ?, ?)',
        [encuestaId, sec.titulo, sec.descripcion || null, i + 1]
      );
      seccionMap[sec._tempId || sec.id] = result.insertId;
    }
  }
  return seccionMap;
}

async function savePreguntas(encuestaId, preguntas, seccionMap) {
  const [existing] = await db.query(
    'SELECT id FROM encuesta_preguntas WHERE encuesta_id = ?', [encuestaId]
  );
  const existingIds = new Set(existing.map(p => p.id));
  const submittedIds = new Set(preguntas.filter(p => p.id && typeof p.id === 'number').map(p => p.id));

  for (const oldId of existingIds) {
    if (!submittedIds.has(oldId)) {
      await db.query('DELETE FROM encuesta_opciones WHERE pregunta_id = ?', [oldId]);
      await db.query('DELETE FROM encuesta_preguntas WHERE id = ?', [oldId]);
    }
  }

  for (let i = 0; i < preguntas.length; i++) {
    const preg = preguntas[i];
    const secId = preg.seccion_id ? (seccionMap[preg.seccion_id] || preg.seccion_id) : null;
    const codigo = preg.codigo_pregunta || `P${String(i + 1).padStart(2, '0')}`;
    const reglas = preg.reglas_validacion
      ? (typeof preg.reglas_validacion === 'string' ? preg.reglas_validacion : JSON.stringify(preg.reglas_validacion))
      : null;

    let pregId;
    if (preg.id && existingIds.has(preg.id)) {
      await db.query(
        `UPDATE encuesta_preguntas
         SET seccion_id = ?, codigo_pregunta = ?, texto_pregunta = ?, tipo_pregunta = ?,
             posicion = ?, texto_ayuda = ?, reglas_validacion = ?, es_obligatoria = ?
         WHERE id = ?`,
        [secId, codigo, preg.texto_pregunta, preg.tipo_pregunta,
         i + 1, preg.texto_ayuda || null, reglas, preg.es_obligatoria ? 1 : 0, preg.id]
      );
      pregId = preg.id;
    } else {
      const [result] = await db.query(
        `INSERT INTO encuesta_preguntas
           (encuesta_id, seccion_id, codigo_pregunta, texto_pregunta, tipo_pregunta,
            posicion, texto_ayuda, reglas_validacion, es_obligatoria)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [encuestaId, secId, codigo, preg.texto_pregunta, preg.tipo_pregunta,
         i + 1, preg.texto_ayuda || null, reglas, preg.es_obligatoria ? 1 : 0]
      );
      pregId = result.insertId;
    }

    await saveOpciones(pregId, preg.tipo_pregunta, preg.opciones || []);
  }
  invalidateCache();
}

async function saveOpciones(preguntaId, tipoPregunta, opciones) {
  await db.query('DELETE FROM encuesta_opciones WHERE pregunta_id = ?', [preguntaId]);

  if (tipoPregunta !== 'opcion_unica' && tipoPregunta !== 'opcion_multiple') return;

  for (let i = 0; i < opciones.length; i++) {
    const opc = opciones[i];
    await db.query(
      `INSERT INTO encuesta_opciones
         (pregunta_id, valor_opcion, etiqueta_opcion, posicion, permite_texto_libre)
       VALUES (?, ?, ?, ?, ?)`,
      [preguntaId, opc.valor_opcion, opc.etiqueta_opcion, i + 1, opc.permite_texto_libre ? 1 : 0]
    );
  }
}

// ─── RESPUESTAS PUBLICAS ─────────────────────────────────

function hashIp(ip) {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip).digest('hex');
}

async function submitResponse(encuestaId, respuestas, { userId, ip, origen, token } = {}) {
  const [result] = await db.query(
    `INSERT INTO encuesta_respuestas
       (encuesta_id, user_id, estado, ip_hash, origen, token_acceso, datos_crudos, fecha_inicio, fecha_envio)
     VALUES (?, ?, 'enviada', ?, ?, ?, ?, NOW(), NOW())`,
    [
      encuestaId,
      userId || null,
      hashIp(ip),
      origen || 'web',
      token || null,
      JSON.stringify(respuestas),
    ]
  );
  const respuestaId = result.insertId;

  for (const r of respuestas) {
    const [detResult] = await db.query(
      `INSERT INTO encuesta_respuestas_detalle
         (respuesta_encuesta_id, pregunta_id, respuesta_texto, respuesta_numero, respuesta_booleano, respuesta_fecha)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        respuestaId,
        r.pregunta_id,
        r.respuesta_texto ?? null,
        r.respuesta_numero ?? null,
        r.respuesta_booleano ?? null,
        r.respuesta_fecha ?? null,
      ]
    );

    if (r.opciones_seleccionadas && r.opciones_seleccionadas.length) {
      for (const opc of r.opciones_seleccionadas) {
        await db.query(
          `INSERT INTO encuesta_respuestas_opciones (respuesta_detalle_id, opcion_id, texto_libre)
           VALUES (?, ?, ?)`,
          [detResult.insertId, opc.opcion_id, opc.texto_libre || null]
        );
      }
    }
  }

  if (token) {
    await db.query(
      "UPDATE encuesta_tokens SET usado = 1 WHERE token = ? AND encuesta_id = ?",
      [token, encuestaId]
    );
  }

  invalidateCache();
  return { id: respuestaId };
}

// ─── RESULTADOS (admin) ──────────────────────────────────

async function getResponses(encuestaId, filters = {}) {
  let where = 'WHERE r.encuesta_id = ?';
  const values = [encuestaId];

  if (filters.fechaInicio) {
    where += ' AND r.created_at >= ?';
    values.push(`${filters.fechaInicio} 00:00:00`);
  }
  if (filters.fechaFin) {
    where += ' AND r.created_at <= ?';
    values.push(`${filters.fechaFin} 23:59:59`);
  }

  const [rows] = await db.query(
    `SELECT r.id, r.encuesta_id, r.user_id, r.estado, r.origen, r.created_at AS fecha_respuesta,
            u.full_name AS respondente_nombre, u.email AS respondente_email
     FROM encuesta_respuestas r
     LEFT JOIN users u ON u.id = r.user_id
     ${where}
     ORDER BY r.created_at DESC`,
    values
  );

  const responseIds = rows.map(r => r.id);
  if (!responseIds.length) return rows;

  const [detalles] = await db.query(
    `SELECT d.id, d.respuesta_encuesta_id, d.pregunta_id,
            d.respuesta_texto, d.respuesta_numero, d.respuesta_booleano, d.respuesta_fecha
     FROM encuesta_respuestas_detalle d
     WHERE d.respuesta_encuesta_id IN (${responseIds.map(() => '?').join(',')})`,
    responseIds
  );

  const detalleIds = detalles.map(d => d.id);
  let selecciones = [];
  if (detalleIds.length) {
    const [sels] = await db.query(
      `SELECT s.id, s.respuesta_detalle_id, s.opcion_id, s.texto_libre
       FROM encuesta_respuestas_opciones s
       WHERE s.respuesta_detalle_id IN (${detalleIds.map(() => '?').join(',')})`,
      detalleIds
    );
    selecciones = sels;
  }

  return rows.map(r => ({
    ...r,
    respuestas_detalle: detalles
      .filter(d => d.respuesta_encuesta_id === r.id)
      .map(d => ({
        ...d,
        respuestas_opciones_seleccionadas: selecciones.filter(s => s.respuesta_detalle_id === d.id),
      })),
  }));
}

async function deleteResponse(responseId) {
  const [result] = await db.query('DELETE FROM encuesta_respuestas WHERE id = ?', [responseId]);
  if (result.affectedRows > 0) invalidateCache();
  return result.affectedRows > 0;
}

// ─── TOKENS ──────────────────────────────────────────────

async function validateToken(encuestaId, token) {
  const [rows] = await db.query(
    `SELECT * FROM encuesta_tokens
     WHERE encuesta_id = ? AND token = ? AND usado = 0
       AND (expires_at IS NULL OR expires_at > NOW())`,
    [encuestaId, token]
  );
  return rows[0] || null;
}

module.exports = {
  getAll,
  getById,
  getFullById,
  getPublicBySlug,
  create,
  update,
  changeEstado,
  duplicate,
  remove,
  saveSecciones,
  savePreguntas,
  submitResponse,
  getResponses,
  deleteResponse,
  validateToken,
};
