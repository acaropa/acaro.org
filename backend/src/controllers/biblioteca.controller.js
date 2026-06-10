const biblioteca = require('../services/biblioteca.service');

function canManage(req) {
  return req.user?.role === 'admin' || req.user?.role === 'supervisor';
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateDocument(data = {}, partial = false) {
  const required = ['titulo', 'autor', 'fecha', 'link'];

  for (const field of required) {
    if ((!partial || field in data) && (typeof data[field] !== 'string' || !data[field].trim())) {
      return `${field} es requerido`;
    }
  }

  if ('fecha' in data) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.fecha)) {
      return 'fecha debe tener el formato YYYY-MM-DD';
    }
    const parsed = new Date(`${data.fecha}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== data.fecha) {
      return 'fecha no es una fecha válida';
    }
  }

  if ('link' in data) {
    try {
      const url = new URL(data.link);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    } catch {
      return 'link debe ser una URL http o https válida';
    }
  }

  if ('activo' in data && typeof data.activo !== 'boolean') {
    return 'activo debe ser un valor booleano';
  }

  if ('descripcion' in data && data.descripcion !== null && typeof data.descripcion !== 'string') {
    return 'descripcion debe ser texto';
  }

  return null;
}

async function getAll(req, res, next) {
  try {
    res.json(await biblioteca.getAll(canManage(req)));
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Identificador inválido' });

    const doc = await biblioteca.getById(id, canManage(req));
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });
    res.json(doc);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const body = req.body || {};
    const error = validateDocument(body);
    if (error) return res.status(400).json({ error });

    const data = {
      ...body,
      titulo: body.titulo.trim(),
      autor: body.autor.trim(),
      link: body.link.trim(),
      descripcion: body.descripcion?.trim() || null,
    };
    res.status(201).json(await biblioteca.create(data));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Identificador inválido' });

    const body = req.body || {};
    const error = validateDocument(body, true);
    if (error) return res.status(400).json({ error });

    const data = { ...body };
    for (const field of ['titulo', 'autor', 'fecha', 'link']) {
      if (typeof data[field] === 'string') data[field] = data[field].trim();
    }
    if ('descripcion' in data) data.descripcion = data.descripcion?.trim() || null;

    const doc = await biblioteca.update(id, data);
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });
    res.json(doc);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Identificador inválido' });

    const deleted = await biblioteca.remove(id);
    if (!deleted) return res.status(404).json({ error: 'Documento no encontrado' });
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update, remove };
