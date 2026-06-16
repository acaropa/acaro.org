const service = require('../services/notasConceptuales.service');

const REQUIRED = [
  'asociacion', 'titulo', 'subtitulo', 'fecha', 'lugar', 'horario',
  'introduccion', 'objetivo', 'participantes_acaro', 'participantes_contraparte',
  'temas', 'metodologia', 'agenda', 'resultados', 'productos', 'aprobacion',
  'firmante_acaro', 'cargo_acaro', 'firmante_tecnico', 'cargo_tecnico',
  'realizado_por', 'fecha_documento',
];

function validate(body) {
  const missing = REQUIRED.filter(f => body[f] === undefined || body[f] === null || body[f] === '');
  return missing.length ? missing : null;
}

async function getAll(req, res, next) {
  try {
    const isAdmin = req.user.role === 'admin' || req.user.role === 'supervisor';
    res.json(await service.getAll(req.user.id, isAdmin));
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const note = await service.getById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Nota no encontrada' });
    const isOwner = note.creado_por === req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'supervisor';
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Acceso denegado' });
    res.json(note);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const missing = validate(req.body || {});
    if (missing) return res.status(400).json({ error: `Campos requeridos: ${missing.join(', ')}` });
    res.status(201).json(await service.create(req.body, req.user.id));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const note = await service.getById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Nota no encontrada' });
    const isOwner = note.creado_por === req.user.id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'supervisor';
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Acceso denegado' });
    const missing = validate(req.body || {});
    if (missing) return res.status(400).json({ error: `Campos requeridos: ${missing.join(', ')}` });
    res.json(await service.update(req.params.id, req.body));
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const note = await service.getById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Nota no encontrada' });
    const isAdmin = req.user.role === 'admin' || req.user.role === 'supervisor';
    if (note.creado_por !== req.user.id && !isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    await service.remove(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update, remove };
