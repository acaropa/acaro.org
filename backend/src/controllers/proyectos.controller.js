const svc = require('../services/proyectos.service');

// ─── PROYECTOS ────────────────────────────────────────────────────────────────

async function getAll(req, res, next) {
  try {
    const soloPublicos = !req.user;
    res.json(await svc.getAll(soloPublicos));
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const proyecto = await svc.getById(req.params.id);
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json(proyecto);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'nombre es requerido' });
    res.status(201).json(await svc.create(req.body));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const proyecto = await svc.update(req.params.id, req.body);
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json(proyecto);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const deleted = await svc.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.status(204).send();
  } catch (err) { next(err); }
}

// ─── TÉCNICOS EN PROYECTO ─────────────────────────────────────────────────────

async function assignTecnico(req, res, next) {
  try {
    const { tecnico_id, fecha_asignacion } = req.body;
    if (!tecnico_id || !fecha_asignacion) {
      return res.status(400).json({ error: 'tecnico_id y fecha_asignacion son requeridos' });
    }
    await svc.assignTecnico(req.params.id, tecnico_id, fecha_asignacion);
    res.status(201).json({ message: 'Técnico asignado' });
  } catch (err) { next(err); }
}

async function removeTecnico(req, res, next) {
  try {
    const deleted = await svc.removeTecnico(req.params.id, req.params.tecnicoId);
    if (!deleted) return res.status(404).json({ error: 'Asignación no encontrada' });
    res.status(204).send();
  } catch (err) { next(err); }
}

// ─── FASES ────────────────────────────────────────────────────────────────────

async function createFase(req, res, next) {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'nombre es requerido' });
    res.status(201).json(await svc.createFase(req.params.id, req.body));
  } catch (err) { next(err); }
}

async function updateFase(req, res, next) {
  try {
    const fase = await svc.updateFase(req.params.faseId, req.body);
    if (!fase) return res.status(404).json({ error: 'Fase no encontrada' });
    res.json(fase);
  } catch (err) { next(err); }
}

async function removeFase(req, res, next) {
  try {
    const deleted = await svc.removeFase(req.params.faseId);
    if (!deleted) return res.status(404).json({ error: 'Fase no encontrada' });
    res.status(204).send();
  } catch (err) { next(err); }
}

// ─── IMÁGENES ─────────────────────────────────────────────────────────────────

async function addImagen(req, res, next) {
  try {
    const { url, descripcion } = req.body;
    if (!url) return res.status(400).json({ error: 'url es requerido' });
    res.status(201).json(await svc.addImagen(req.params.faseId, url, descripcion));
  } catch (err) { next(err); }
}

async function removeImagen(req, res, next) {
  try {
    const deleted = await svc.removeImagen(req.params.imagenId);
    if (!deleted) return res.status(404).json({ error: 'Imagen no encontrada' });
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = {
  getAll, getById, create, update, remove,
  assignTecnico, removeTecnico,
  createFase, updateFase, removeFase,
  addImagen, removeImagen,
};
