const productores = require('../services/productores.service');
const { saveBase64Upload, IMAGE_EXTENSIONS } = require('../utils/uploads');

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseYears(value) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const years = Number(value);
  return Number.isFinite(years) && years >= 0 ? Math.round(years) : null;
}

async function uploadImage(data) {
  if (!data.imagen_base64 || !data.imagen_nombre) return undefined;
  const uploaded = await saveBase64Upload({
    base64: data.imagen_base64,
    fileName: data.imagen_nombre,
    subdir: 'productores',
    maxBytes: MAX_IMAGE_BYTES,
    allowedExtensions: IMAGE_EXTENSIONS,
  });
  return uploaded.url;
}

function canViewInternal(user) {
  return Boolean(user && user.role !== 'visitante');
}

async function getAll(req, res, next) {
  try {
    res.json(await productores.getAll(req.user || null));
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Identificador inválido' });
    const item = await productores.getById(id);
    if (!item) return res.status(404).json({ error: 'Productor no encontrado' });
    if (!item.activo && !canViewInternal(req.user)) {
      return res.status(404).json({ error: 'Productor no encontrado' });
    }
    res.json(item);
  } catch (err) { next(err); }
}

async function getBySlug(req, res, next) {
  try {
    const item = await productores.getBySlug(req.params.slug);
    if (!item) return res.status(404).json({ error: 'Productor no encontrado' });
    if (!item.activo && !canViewInternal(req.user)) {
      return res.status(404).json({ error: 'Productor no encontrado' });
    }
    res.json(item);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { nombre } = req.body || {};
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'nombre es requerido' });
    }

    const body = { ...req.body };
    const uploaded = await uploadImage(body);
    const imagen_url = uploaded || body.imagen_url || null;

    res.status(201).json(await productores.create({
      nombre: body.nombre.trim(),
      descripcion: body.descripcion?.trim() || null,
      imagen_url: imagen_url?.trim() || null,
      comunidad: body.comunidad?.trim() || null,
      rol: body.rol?.trim() || null,
      anios_experiencia: parseYears(body.anios_experiencia) ?? null,
      activo: body.activo ?? true,
      destacado: body.destacado ?? false,
    }, req.user));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Identificador inválido' });
    const current = await productores.getById(id);
    if (!current) return res.status(404).json({ error: 'Productor no encontrado' });

    const body = { ...req.body };
    const uploaded = await uploadImage(body);
    if (uploaded) body.imagen_url = uploaded;

    const payload = {};
    if (typeof body.nombre === 'string') payload.nombre = body.nombre.trim();
    if ('descripcion' in body) payload.descripcion = body.descripcion?.trim() || null;
    if ('imagen_url' in body) payload.imagen_url = body.imagen_url?.trim() || null;
    if ('comunidad' in body) payload.comunidad = body.comunidad?.trim() || null;
    if ('rol' in body) payload.rol = body.rol?.trim() || null;
    if ('anios_experiencia' in body) payload.anios_experiencia = parseYears(body.anios_experiencia);
    if ('activo' in body) payload.activo = Boolean(body.activo);
    if ('destacado' in body) payload.destacado = Boolean(body.destacado);

    res.json(await productores.update(id, payload));
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Identificador inválido' });
    const deleted = await productores.remove(id);
    if (!deleted) return res.status(404).json({ error: 'Productor no encontrado' });
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, getBySlug, create, update, remove };
