const noticias = require('../services/noticias.service');
const { hasPermission, PERMISSIONS } = require('../config/permissions');
const { saveBase64Upload, IMAGE_EXTENSIONS } = require('../utils/uploads');

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const TECNICO_EDITABLE_STATES = ['borrador', 'pendiente'];

async function uploadCoverImage(data) {
  if (!data.imagen_base64 || !data.imagen_nombre) return undefined;
  const uploaded = await saveBase64Upload({
    base64: data.imagen_base64,
    fileName: data.imagen_nombre,
    subdir: 'noticias',
    maxBytes: MAX_IMAGE_BYTES,
    allowedExtensions: IMAGE_EXTENSIONS,
  });
  return uploaded.url;
}

async function uploadSecondaryImages(data) {
  if (!data.imagenes_base64 || !Array.isArray(data.imagenes_base64)) return undefined;
  const urls = [];
  for (const file of data.imagenes_base64) {
    if (!file.base64 || !file.fileName) continue;
    const uploaded = await saveBase64Upload({
      base64: file.base64,
      fileName: file.fileName,
      subdir: 'noticias',
      maxBytes: MAX_IMAGE_BYTES,
      allowedExtensions: IMAGE_EXTENSIONS,
    });
    urls.push(uploaded.url);
  }
  return urls;
}

async function getAll(req, res, next) {
  try {
    const includeInternal = req.user?.role === 'admin' || req.user?.role === 'supervisor';
    res.json(await noticias.getAll(includeInternal, req.user || null));
  } catch (err) { next(err); }
}

async function getBySlug(req, res, next) {
  try {
    const includeInternal = req.user?.role === 'admin' || req.user?.role === 'supervisor';
    const item = await noticias.getBySlug(req.params.slug, includeInternal);
    if (!item) return res.status(404).json({ error: 'Noticia no encontrada' });
    res.json(item);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { titulo, contenido } = req.body || {};
    if (!titulo || !contenido) {
      return res.status(400).json({ error: 'titulo y contenido son requeridos' });
    }
    const uploaded = await uploadCoverImage(req.body);
    const imagen_portada = uploaded || req.body.imagen_portada || null;

    const secondaryUploaded = await uploadSecondaryImages(req.body);
    let imagenes = null;
    let reqImagenes = req.body.imagenes;
    if (typeof reqImagenes === 'string') {
      try { reqImagenes = JSON.parse(reqImagenes); } catch (e) { reqImagenes = null; }
    }
    const existingUrls = Array.isArray(reqImagenes) ? reqImagenes : [];
    if (secondaryUploaded) {
      imagenes = [...existingUrls, ...secondaryUploaded];
    } else {
      imagenes = existingUrls.length > 0 ? existingUrls : null;
    }

    res.status(201).json(await noticias.create({ ...req.body, imagen_portada, imagenes }, req.user));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const current = await noticias.getById(req.params.id);
    if (!current) return res.status(404).json({ error: 'Noticia no encontrada' });

    const canUpdateAny = hasPermission(req.user, PERMISSIONS.NOTICIAS_UPDATE);
    if (!canUpdateAny) {
      const isOwner = current.creado_por === req.user.id;
      if (!isOwner || !TECNICO_EDITABLE_STATES.includes(current.estado)) {
        return res.status(403).json({ error: 'No puedes editar esta noticia en su estado actual' });
      }
    }

    const body = { ...req.body };
    if (!canUpdateAny) {
      delete body.estado;
      delete body.visibilidad;
    }

    const imagen_portada = await uploadCoverImage(body);
    if (imagen_portada) body.imagen_portada = imagen_portada;

    const secondaryUploaded = await uploadSecondaryImages(body);
    let existingUrls = [];
    if (body.imagenes) {
      existingUrls = typeof body.imagenes === 'string' ? JSON.parse(body.imagenes) : body.imagenes;
    }
    if (!Array.isArray(existingUrls)) {
      existingUrls = [];
    }

    if (secondaryUploaded) {
      body.imagenes = [...existingUrls, ...secondaryUploaded];
    } else if ('imagenes' in body) {
      body.imagenes = existingUrls;
    }

    const item = await noticias.update(req.params.id, body);
    if (!item) return res.status(404).json({ error: 'Noticia no encontrada' });
    res.json(item);
  } catch (err) { next(err); }
}

async function publish(req, res, next) {
  try {
    const item = await noticias.publish(req.params.id, req.user.id);
    if (!item) return res.status(404).json({ error: 'Noticia no encontrada' });
    res.json(item);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const deleted = await noticias.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Noticia no encontrada' });
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { getAll, getBySlug, create, update, publish, remove };
