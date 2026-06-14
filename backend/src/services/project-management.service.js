const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const db = require('../config/db');
const cache = require('../utils/memoryCache');

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads', 'proyectos');

const ENTITY_CONFIG = {
  tareas: {
    table: 'proyecto_tareas',
    fields: ['fase_id', 'titulo', 'descripcion', 'responsable_id', 'prioridad', 'estado', 'fecha_inicio', 'fecha_limite', 'porcentaje_avance'],
    required: ['titulo'],
    create: user => ({ creado_por: user.id, actualizado_por: user.id }),
    update: user => ({ actualizado_por: user.id }),
    archive: user => ({ estado: 'cancelada', actualizado_por: user.id }),
    ownerFields: ['creado_por', 'responsable_id'],
  },
  riesgos: {
    table: 'proyecto_riesgos',
    fields: ['fase_id', 'tipo', 'titulo', 'descripcion', 'probabilidad', 'impacto', 'estado', 'plan_respuesta', 'responsable_id'],
    required: ['titulo'],
    create: user => ({ reportado_por: user.id }),
    archive: user => ({ estado: 'descartado', cerrado_por: user.id, fecha_cierre: new Date() }),
    ownerFields: ['reportado_por', 'responsable_id'],
  },
  decisiones: {
    table: 'proyecto_decisiones',
    fields: ['fase_id', 'titulo', 'decision_tomada', 'motivo', 'impacto_tiempo', 'impacto_costo', 'impacto_alcance', 'estado', 'fecha_decision'],
    required: ['titulo', 'decision_tomada'],
    create: user => ({ tomada_por: user.id }),
    archive: user => ({ estado: 'anulada', aprobada_por: user.id }),
  },
  reuniones: {
    table: 'proyecto_reuniones',
    fields: ['fase_id', 'titulo', 'fecha_reunion', 'lugar', 'participantes', 'temas', 'acuerdos', 'proximos_pasos'],
    required: ['titulo', 'fecha_reunion'],
    create: user => ({ creada_por: user.id }),
    hardDelete: true,
    ownerFields: ['creada_por'],
  },
  finanzas: {
    table: 'proyecto_finanzas',
    fields: ['fase_id', 'tipo', 'concepto', 'descripcion', 'monto', 'moneda', 'fecha_movimiento', 'documento_archivo_id', 'estado', 'observacion_revision'],
    required: ['concepto', 'fecha_movimiento'],
    create: user => ({ registrado_por: user.id }),
    archive: user => ({ estado: 'archivado', validado_por: user.id, fecha_validacion: new Date() }),
    ownerFields: ['registrado_por'],
  },
  avances: {
    table: 'proyecto_avances',
    fields: ['fase_id', 'titulo', 'descripcion', 'porcentaje_avance'],
    required: ['descripcion'],
    create: user => ({ creado_por: user.id, estado: 'pendiente_revision' }),
    archive: () => ({ estado: 'archivado' }),
    ownerFields: ['creado_por'],
  },
  archivos: {
    table: 'proyecto_archivos',
    fields: ['titulo', 'descripcion', 'fase_id', 'tipo', 'visibilidad'],
    required: ['titulo'],
    archive: () => ({ estado: 'archivado' }),
    ownerFields: ['subido_por'],
  },
};

function cleanData(data, fields) {
  return Object.fromEntries(fields
    .filter(field => Object.prototype.hasOwnProperty.call(data, field))
    .map(field => [field, data[field] === '' ? null : data[field]]));
}

function validateRequired(data, required) {
  const missing = required.filter(field => data[field] === undefined || data[field] === null || String(data[field]).trim() === '');
  if (missing.length) {
    const err = new Error(`Campos requeridos: ${missing.join(', ')}`);
    err.status = 400;
    throw err;
  }
}

async function audit(user, projectId, module, action, entityId, previous, next, reqMeta = {}) {
  const phaseId = next?.fase_id || previous?.fase_id || null;
  await db.query(
    `INSERT INTO auditoria
      (user_id, modulo, accion, entidad_id, proyecto_id, fase_id, descripcion, valor_anterior, valor_nuevo, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.id, module, action, entityId, projectId, phaseId,
      `${action} en ${module}`,
      previous ? JSON.stringify(previous) : null,
      next ? JSON.stringify(next) : null,
      reqMeta.ip || null,
      reqMeta.userAgent || null,
    ]
  );
}

async function list(table, projectId, where = '', order = 'created_at DESC') {
  const [rows] = await db.query(
    `SELECT * FROM ${table} WHERE proyecto_id = ? ${where} ORDER BY ${order}`,
    [projectId]
  );
  return rows;
}

async function getManagement(projectId) {
  const [
    fases, tareas, avances, archivos, riesgos, decisiones, reuniones, finanzas, auditoria,
  ] = await Promise.all([
    list('proyecto_fases', projectId, '', 'orden ASC, created_at ASC'),
    list('proyecto_tareas', projectId),
    list('proyecto_avances', projectId, "AND estado <> 'archivado'"),
    list('proyecto_archivos', projectId, "AND estado <> 'archivado'"),
    list('proyecto_riesgos', projectId),
    list('proyecto_decisiones', projectId),
    list('proyecto_reuniones', projectId),
    list('proyecto_finanzas', projectId, "AND estado <> 'archivado'"),
    db.query(
      `SELECT a.*, u.email AS usuario_email
       FROM auditoria a LEFT JOIN users u ON u.id = a.user_id
       WHERE a.proyecto_id = ? ORDER BY a.created_at DESC LIMIT 80`,
      [projectId]
    ).then(([rows]) => rows),
  ]);

  const financeSummary = { presupuesto: 0, compromiso: 0, gasto: 0, ingreso: 0, ajuste: 0, saldo_estimado: 0 };
  for (const item of finanzas) {
    if (!['rechazado', 'archivado'].includes(item.estado)) {
      financeSummary[item.tipo] += Number(item.monto);
    }
  }
  financeSummary.saldo_estimado =
    financeSummary.presupuesto + financeSummary.ingreso + financeSummary.ajuste -
    financeSummary.compromiso - financeSummary.gasto;

  const completedTasks = tareas.filter(item => item.estado === 'completada').length;
  const overdueTasks = tareas.filter(item =>
    item.fecha_limite && new Date(item.fecha_limite) < new Date() &&
    !['completada', 'cancelada'].includes(item.estado)
  ).length;
  const openRisks = riesgos.filter(item => ['abierto', 'en_mitigacion'].includes(item.estado)).length;
  const pendingReviews =
    avances.filter(item => item.estado === 'pendiente_revision').length +
    archivos.filter(item => item.estado === 'pendiente_revision').length;
  let health = 'verde';
  const alerts = [];
  if (overdueTasks || openRisks >= 3 || pendingReviews > 5) health = 'amarillo';
  if (overdueTasks >= 2 && riesgos.some(item => item.tipo === 'problema' && ['abierto', 'en_mitigacion'].includes(item.estado))) health = 'rojo';
  if (overdueTasks) alerts.push(`${overdueTasks} tarea(s) vencida(s).`);
  if (openRisks) alerts.push(`${openRisks} riesgo(s) o problema(s) abiertos.`);
  if (pendingReviews) alerts.push(`${pendingReviews} elemento(s) pendientes de revision.`);
  if (!alerts.length) alerts.push('El proyecto no presenta alertas criticas.');

  return {
    fases, tareas, avances, archivos, riesgos, decisiones, reuniones, finanzas, auditoria,
    financeSummary,
    report: {
      completedTasks,
      taskProgress: tareas.length ? Math.round((completedTasks / tareas.length) * 100) : 0,
      overdueTasks,
      openRisks,
      pendingReviews,
      health,
      alerts,
    },
  };
}

async function createEntity(kind, projectId, data, user, reqMeta) {
  const config = ENTITY_CONFIG[kind];
  if (!config) {
    const err = new Error('Modulo no valido');
    err.status = 404;
    throw err;
  }
  const values = { proyecto_id: Number(projectId), ...cleanData(data, config.fields), ...(config.create?.(user) || {}) };
  validateRequired(values, config.required);
  const columns = Object.keys(values);
  const [result] = await db.query(
    `INSERT INTO ${config.table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
    columns.map(column => values[column])
  );
  await audit(user, Number(projectId), config.table, 'crear', result.insertId, null, values, reqMeta);
  cache.invalidatePrefix('projects:');
  const [rows] = await db.query(`SELECT * FROM ${config.table} WHERE id = ?`, [result.insertId]);
  return rows[0];
}

async function updateEntity(kind, projectId, entityId, data, user, reqMeta, manageAll = false) {
  const config = ENTITY_CONFIG[kind];
  if (!config) {
    const err = new Error('Modulo no valido');
    err.status = 404;
    throw err;
  }
  const [rows] = await db.query(
    `SELECT * FROM ${config.table} WHERE id = ? AND proyecto_id = ?`,
    [entityId, projectId]
  );
  if (!rows[0]) return null;
  if (!manageAll && config.ownerFields && !config.ownerFields.some(field => Number(rows[0][field]) === Number(user.id))) {
    const err = new Error('Solo puedes editar registros creados o asignados a tu usuario');
    err.status = 403;
    throw err;
  }
  const values = { ...cleanData(data, config.fields), ...(config.update?.(user) || {}) };
  if (!Object.keys(values).length) {
    const err = new Error('Sin campos validos para actualizar');
    err.status = 400;
    throw err;
  }
  const columns = Object.keys(values);
  await db.query(
    `UPDATE ${config.table} SET ${columns.map(column => `${column} = ?`).join(', ')} WHERE id = ?`,
    [...columns.map(column => values[column]), entityId]
  );
  await audit(user, Number(projectId), config.table, 'actualizar', Number(entityId), rows[0], values, reqMeta);
  const [updated] = await db.query(`SELECT * FROM ${config.table} WHERE id = ?`, [entityId]);
  return updated[0];
}

async function removeEntity(kind, projectId, entityId, user, reqMeta) {
  const config = ENTITY_CONFIG[kind];
  if (!config) {
    const err = new Error('Modulo no valido');
    err.status = 404;
    throw err;
  }
  const [rows] = await db.query(
    `SELECT * FROM ${config.table} WHERE id = ? AND proyecto_id = ?`,
    [entityId, projectId]
  );
  if (!rows[0]) return false;
  if (config.hardDelete) {
    await db.query(`DELETE FROM ${config.table} WHERE id = ?`, [entityId]);
  } else {
    const values = config.archive(user);
    const columns = Object.keys(values);
    await db.query(
      `UPDATE ${config.table} SET ${columns.map(column => `${column} = ?`).join(', ')} WHERE id = ?`,
      [...columns.map(column => values[column]), entityId]
    );
  }
  await audit(user, Number(projectId), config.table, 'archivar', Number(entityId), rows[0], null, reqMeta);
  return true;
}

async function createFile(projectId, data, user, reqMeta) {
  const match = String(data.file_base64 || '').match(/^data:([^;]+);base64,(.+)$/);
  if (!match || !data.file_name) {
    const err = new Error('Archivo y nombre son requeridos');
    err.status = 400;
    throw err;
  }
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > 8 * 1024 * 1024) {
    const err = new Error('El archivo supera el limite de 8 MB');
    err.status = 413;
    throw err;
  }
  const extension = path.extname(data.file_name).slice(0, 20).toLowerCase();
  const allowedExtensions = new Set([
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv',
    '.jpg', '.jpeg', '.png', '.webp',
  ]);
  if (!allowedExtensions.has(extension)) {
    const err = new Error('Tipo de archivo no permitido');
    err.status = 400;
    throw err;
  }
  const savedName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;
  const projectDir = path.join(UPLOAD_ROOT, String(projectId));
  await fs.mkdir(projectDir, { recursive: true });
  await fs.writeFile(path.join(projectDir, savedName), buffer, { flag: 'wx' });
  const values = [
    projectId, data.fase_id || null, data.titulo || data.file_name, data.descripcion || null,
    data.tipo || 'documento', `/uploads/proyectos/${projectId}/${savedName}`,
    data.file_name, savedName, extension.slice(1), match[1], buffer.length,
    data.visibilidad || 'interna', user.id,
  ];
  const [result] = await db.query(
    `INSERT INTO proyecto_archivos
      (proyecto_id, fase_id, titulo, descripcion, tipo, archivo_url, nombre_original,
       nombre_guardado, extension, mime_type, size_bytes, visibilidad, subido_por)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    values
  );
  await audit(user, Number(projectId), 'proyecto_archivos', 'subir', result.insertId, null, {
    fase_id: data.fase_id || null,
    titulo: data.titulo || data.file_name,
    tipo: data.tipo || 'documento',
  }, reqMeta);
  const [rows] = await db.query('SELECT * FROM proyecto_archivos WHERE id = ?', [result.insertId]);
  return rows[0];
}

async function review(projectId, kind, entityId, action, observation, user, reqMeta) {
  if (!['archivos', 'avances'].includes(kind)) {
    const err = new Error('Modulo de revision no valido');
    err.status = 404;
    throw err;
  }
  const table = kind === 'archivos' ? 'proyecto_archivos' : 'proyecto_avances';
  const states = { aprobar: 'aprobado', rechazar: 'rechazado', correccion: 'requiere_correccion' };
  if (!states[action]) {
    const err = new Error('Accion de revision no valida');
    err.status = 400;
    throw err;
  }
  const [rows] = await db.query(`SELECT * FROM ${table} WHERE id = ? AND proyecto_id = ?`, [entityId, projectId]);
  if (!rows[0]) return null;
  await db.query(
    `UPDATE ${table} SET estado = ?, revisado_por = ?, fecha_revision = NOW(), observacion_revision = ? WHERE id = ?`,
    [states[action], user.id, observation || null, entityId]
  );
  await audit(user, Number(projectId), table, action, Number(entityId), rows[0], { estado: states[action], observation }, reqMeta);
  const [updated] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [entityId]);
  return updated[0];
}

module.exports = {
  getManagement,
  createEntity,
  updateEntity,
  removeEntity,
  createFile,
  review,
  audit,
};
