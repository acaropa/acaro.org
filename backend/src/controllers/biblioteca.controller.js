const biblioteca = require('../services/biblioteca.service');

async function getAll(req, res, next) {
  try {
    res.json(await biblioteca.getAll());
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const doc = await biblioteca.getById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });
    res.json(doc);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { titulo, autor, fecha, link } = req.body;
    if (!titulo || !autor || !fecha || !link) {
      return res.status(400).json({ error: 'titulo, autor, fecha y link son requeridos' });
    }
    res.status(201).json(await biblioteca.create(req.body));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const doc = await biblioteca.update(req.params.id, req.body);
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });
    res.json(doc);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const deleted = await biblioteca.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Documento no encontrado' });
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update, remove };
