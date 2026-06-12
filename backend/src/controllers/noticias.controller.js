const noticias = require('../services/noticias.service');

async function getAll(req, res, next) {
  try {
    const includeInternal = req.user?.role === 'admin' || req.user?.role === 'supervisor';
    res.json(await noticias.getAll(includeInternal));
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { titulo, contenido } = req.body || {};
    if (!titulo || !contenido) {
      return res.status(400).json({ error: 'titulo y contenido son requeridos' });
    }
    res.status(201).json(await noticias.create(req.body, req.user.id));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const item = await noticias.update(req.params.id, req.body || {});
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

module.exports = { getAll, create, update, publish, remove };
