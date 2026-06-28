const biblioteca = require('../services/biblioteca.service');
const { hasPermission, PERMISSIONS } = require('../config/permissions');
const { saveBase64Upload, DOCUMENT_EXTENSIONS, IMAGE_EXTENSIONS } = require('../utils/uploads');

const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;
const MAX_COVER_BYTES = 4 * 1024 * 1024;

async function resolveFileUpload(body) {
  if (!body.archivo_base64 || !body.archivo_nombre) return undefined;
  const uploaded = await saveBase64Upload({
    base64: body.archivo_base64,
    fileName: body.archivo_nombre,
    subdir: 'biblioteca',
    maxBytes: MAX_DOCUMENT_BYTES,
    allowedExtensions: DOCUMENT_EXTENSIONS,
  });
  return uploaded.url;
}

async function resolveCoverUpload(body) {
  if (!body.portada_base64 || !body.portada_nombre) return undefined;
  const uploaded = await saveBase64Upload({
    base64: body.portada_base64,
    fileName: body.portada_nombre,
    subdir: 'biblioteca-portada',
    maxBytes: MAX_COVER_BYTES,
    allowedExtensions: IMAGE_EXTENSIONS,
  });
  return uploaded.url;
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateDocument(data = {}, partial = false, trustedFileUrl = false) {
  const required = ['titulo', 'archivo_url', 'categoria', 'visibilidad'];
  for (const field of required) {
    if ((!partial || field in data) && (typeof data[field] !== 'string' || !data[field].trim())) {
      return `${field} es requerido`;
    }
  }

  if ('archivo_url' in data && !trustedFileUrl) {
    try {
      const url = new URL(data.archivo_url);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    } catch {
      return 'archivo_url debe ser una URL http o https válida';
    }
  }

  if ('visibilidad' in data && !biblioteca.VISIBILITIES.includes(data.visibilidad)) {
    return 'visibilidad inválida';
  }
  if ('etiquetas' in data && data.etiquetas !== null) {
    if (!Array.isArray(data.etiquetas) || data.etiquetas.some(t => typeof t !== 'string')) {
      return 'etiquetas debe ser un arreglo de textos';
    }
  }
  if ('serie' in data && data.serie !== null && typeof data.serie !== 'string') {
    return 'serie debe ser texto';
  }
  if ('orden_lectura' in data && data.orden_lectura !== null) {
    const n = Number(data.orden_lectura);
    if (!Number.isInteger(n) || n < 1) return 'orden_lectura debe ser un entero positivo';
  }
  if ('orden_portada' in data && data.orden_portada !== null) {
    const n = Number(data.orden_portada);
    if (!Number.isInteger(n) || n < 1) return 'orden_portada debe ser un entero positivo';
  }
  if ('destacado' in data && typeof data.destacado !== 'boolean') {
    return 'destacado debe ser booleano';
  }
  if ('descripcion' in data && data.descripcion !== null && typeof data.descripcion !== 'string') {
    return 'descripcion debe ser texto';
  }
  if ('imagen_portada' in data && data.imagen_portada !== null && typeof data.imagen_portada !== 'string') {
    return 'imagen_portada debe ser texto';
  }
  return null;
}

async function canReadDocument(user, document) {
  if (document.estado === 'aprobado' && document.visibilidad === 'publica') return true;
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'supervisor') {
    return biblioteca.canSupervisorAccess(document.id, user.id);
  }
  if (document.creado_por === user.id) return true;
  return document.estado === 'aprobado' && hasPermission(user, PERMISSIONS.BIBLIOTECA_READ_INTERNAL);
}

async function getAll(req, res, next) {
  try {
    const status = req.query.status || null;
    if (status && !biblioteca.STATES.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    res.json(await biblioteca.getAll({
      user: req.user,
      status,
      scope: req.query.scope || null,
      q: String(req.query.q || '').trim(),
      categoria: String(req.query.categoria || '').trim(),
      tipo: String(req.query.tipo || '').trim(),
      anio: String(req.query.anio || '').trim(),
      orden: String(req.query.orden || 'recent').trim(),
      limit: req.query.limit ? Number(req.query.limit) : null,
      offset: req.query.offset ? Number(req.query.offset) : null,
    }));
  } catch (err) { next(err); }
}

async function getHomepage(req, res, next) {
  try {
    res.json(await biblioteca.getHomepage({
      limit: req.query.limit ? Number(req.query.limit) : 12,
    }));
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Identificador inválido' });
    const document = await biblioteca.getById(id);
    if (!document || !(await canReadDocument(req.user, document))) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    res.json(document);
  } catch (err) { next(err); }
}

async function getBySlug(req, res, next) {
  try {
    const document = await biblioteca.getBySlug(req.params.slug);
    if (!document || !(await canReadDocument(req.user, document))) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    res.json(document);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const body = { ...(req.body || {}) };
    const uploadedUrl = await resolveFileUpload(body);
    if (uploadedUrl) body.archivo_url = uploadedUrl;
    const uploadedCoverUrl = await resolveCoverUpload(body);
    body.imagen_portada = uploadedCoverUrl || body.imagen_portada || null;
    const error = validateDocument(body, false, Boolean(uploadedUrl));
    if (error) return res.status(400).json({ error });
    res.status(201).json(await biblioteca.create({
      ...body,
      titulo: body.titulo.trim(),
      descripcion: body.descripcion?.trim() || null,
      archivo_url: body.archivo_url.trim(),
      categoria: body.categoria.trim(),
      imagen_portada: body.imagen_portada?.trim() || null,
      etiquetas: Array.isArray(body.etiquetas) ? body.etiquetas.map(t => t.trim()).filter(Boolean) : null,
      serie: body.serie?.trim() || null,
      orden_lectura: body.orden_lectura != null ? Number(body.orden_lectura) : null,
      destacado: Boolean(body.destacado),
      orden_portada: body.orden_portada != null ? Number(body.orden_portada) : null,
    }, req.user));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Identificador inválido' });
    const document = await biblioteca.getById(id);
    if (!document) return res.status(404).json({ error: 'Documento no encontrado' });
    if (req.user.role === 'supervisor' && !(await biblioteca.canSupervisorAccess(id, req.user.id))) {
      return res.status(403).json({ error: 'El documento no pertenece a un técnico asignado' });
    }

    const ownsEditableDocument =
      document.creado_por === req.user.id &&
      ['borrador', 'pendiente_revision', 'requiere_correccion'].includes(document.estado);
    const canReview = hasPermission(req.user, PERMISSIONS.BIBLIOTECA_REVIEW);
    if (!ownsEditableDocument && !canReview) {
      return res.status(403).json({ error: 'No puedes editar este documento en su estado actual' });
    }

    const body = { ...(req.body || {}) };
    const uploadedUrl = await resolveFileUpload(body);
    if (uploadedUrl) body.archivo_url = uploadedUrl;
    const uploadedCoverUrl = await resolveCoverUpload(body);
    if (uploadedCoverUrl) body.imagen_portada = uploadedCoverUrl;
    if (typeof body.imagen_portada === 'string') body.imagen_portada = body.imagen_portada.trim() || null;

    const error = validateDocument(body, true, Boolean(uploadedUrl));
    if (error) return res.status(400).json({ error });
    res.json(await biblioteca.update(id, body));
  } catch (err) { next(err); }
}

async function resubmit(req, res, next) {
  try {
    const document = await biblioteca.getById(req.params.id);
    if (!document) return res.status(404).json({ error: 'Documento no encontrado' });
    if (
      req.user.role === 'supervisor' &&
      !(await biblioteca.canSupervisorAccess(document.id, req.user.id))
    ) {
      return res.status(403).json({ error: 'El documento no pertenece a un técnico asignado' });
    }
    if (document.creado_por !== req.user.id) {
      return res.status(403).json({ error: 'Solo el autor puede reenviar este documento' });
    }
    if (!['borrador', 'pendiente_revision', 'requiere_correccion'].includes(document.estado)) {
      return res.status(409).json({ error: 'El documento no puede reenviarse en su estado actual' });
    }
    res.json(await biblioteca.resubmit(document.id));
  } catch (err) { next(err); }
}

async function review(req, res, next) {
  try {
    const actions = {
      approve: ['aprobado', PERMISSIONS.BIBLIOTECA_APPROVE],
      reject: ['rechazado', PERMISSIONS.BIBLIOTECA_REJECT],
      request_changes: ['requiere_correccion', PERMISSIONS.BIBLIOTECA_REQUEST_CHANGES],
      archive: ['archivado', PERMISSIONS.BIBLIOTECA_ARCHIVE],
      unarchive: ['aprobado', PERMISSIONS.BIBLIOTECA_APPROVE],
    };
    const selected = actions[req.body?.action];
    if (!selected) return res.status(400).json({ error: 'Acción de revisión inválida' });
    if (!hasPermission(req.user, selected[1])) {
      return res.status(403).json({ error: 'No tienes permiso para esta revisión' });
    }

    const document = await biblioteca.getById(req.params.id);
    if (!document) return res.status(404).json({ error: 'Documento no encontrado' });
    if (
      req.user.role === 'supervisor' &&
      !(await biblioteca.canSupervisorAccess(document.id, req.user.id))
    ) {
      return res.status(403).json({ error: 'El documento no pertenece a un técnico asignado' });
    }
    let allowedStates = [];
    if (req.body.action === 'archive') allowedStates = ['aprobado', 'rechazado'];
    else if (req.body.action === 'unarchive') allowedStates = ['archivado'];
    else allowedStates = ['pendiente_revision', 'requiere_correccion'];
    if (!allowedStates.includes(document.estado)) {
      return res.status(409).json({ error: 'El documento no admite esta transición' });
    }
    if (
      ['reject', 'request_changes'].includes(req.body.action) &&
      !req.body.observation?.trim()
    ) {
      return res.status(400).json({ error: 'La observación de revisión es requerida' });
    }

    res.json(await biblioteca.review(document.id, {
      state: selected[0],
      reviewerId: req.user.id,
      observation: req.body.observation?.trim() || null,
    }));
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const deleted = await biblioteca.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Documento no encontrado' });
    res.status(204).send();
  } catch (err) { next(err); }
}

async function getBySerie(req, res, next) {
  try {
    const serie = req.params.serie;
    if (!serie) return res.status(400).json({ error: 'Serie es requerida' });
    res.json(await biblioteca.getBySerie(decodeURIComponent(serie)));
  } catch (err) { next(err); }
}

module.exports = { getAll, getHomepage, getById, getBySlug, getBySerie, create, update, resubmit, review, remove };
