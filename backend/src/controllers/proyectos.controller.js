const svc = require('../services/proyectos.service');
const projectManagement = require('../services/project-management.service');
const { hasPermission, PERMISSIONS } = require('../config/permissions');
const { saveBase64Upload, IMAGE_EXTENSIONS } = require('../utils/uploads');

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

async function uploadCoverImage(data) {
  if (!data.imagen_base64 || !data.imagen_nombre) return undefined;
  const uploaded = await saveBase64Upload({
    base64: data.imagen_base64,
    fileName: data.imagen_nombre,
    subdir: 'proyectos-portada',
    maxBytes: MAX_IMAGE_BYTES,
    allowedExtensions: IMAGE_EXTENSIONS,
  });
  return uploaded.url;
}

async function canAccessProject(user, project) {
  if (!user) return project.tipo === 'publico' && project.estado !== 'cancelado';
  if (hasPermission(user, PERMISSIONS.PROYECTOS_READ_PRIVATE)) return true;
  if (user.role === 'supervisor') return project.supervisor_id === user.id;
  if (user.role === 'tecnico') {
    return project.tecnicos.some(tecnico => tecnico.user_id === user.id);
  }
  return project.tipo === 'publico' && project.estado !== 'cancelado';
}

function canUpdateProject(user, project) {
  if (hasPermission(user, PERMISSIONS.PROYECTOS_UPDATE_ALL)) return true;
  return user.role === 'supervisor' && project.supervisor_id === user.id;
}

// ─── PROYECTOS ────────────────────────────────────────────────────────────────

async function getAll(req, res, next) {
  try {
    res.json(await svc.getAll(req.user));
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const proyecto = await svc.getById(req.params.id);
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
    if (!(await canAccessProject(req.user, proyecto))) {
      return res.status(403).json({ error: 'No tienes permiso para ver este proyecto' });
    }
    res.json(proyecto);
  } catch (err) { next(err); }
}

async function getBySlug(req, res, next) {
  try {
    const proyecto = await svc.getBySlug(req.params.slug);
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
    if (!(await canAccessProject(req.user, proyecto))) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    proyecto.evidencias = await svc.getPublicArchivos(proyecto.id);
    res.json(proyecto);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'nombre es requerido' });
    const imagen_portada = await uploadCoverImage(req.body);
    const data = {
      ...req.body,
      imagen_portada,
      supervisor_id: req.user.role === 'supervisor' ? req.user.id : req.body.supervisor_id,
    };
    res.status(201).json(await svc.create(data));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const current = await svc.getById(req.params.id);
    if (!current) return res.status(404).json({ error: 'Proyecto no encontrado' });
    if (!canUpdateProject(req.user, current)) {
      return res.status(403).json({ error: 'Solo puedes editar proyectos asignados' });
    }
    const body = { ...req.body };
    const imagen_portada = await uploadCoverImage(body);
    if (imagen_portada) body.imagen_portada = imagen_portada;
    const proyecto = await svc.update(req.params.id, body);
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
    const project = await svc.getById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
    if (!canUpdateProject(req.user, project)) {
      return res.status(403).json({ error: 'Solo puedes gestionar proyectos asignados' });
    }
    const { tecnico_id, fecha_asignacion } = req.body;
    if (!tecnico_id || !fecha_asignacion) {
      return res.status(400).json({ error: 'tecnico_id y fecha_asignacion son requeridos' });
    }
    if (
      req.user.role === 'supervisor' &&
      !(await svc.isTecnicoAssignedToSupervisor(tecnico_id, req.user.id))
    ) {
      return res.status(403).json({ error: 'El técnico no está asignado a este supervisor' });
    }
    await svc.assignTecnico(req.params.id, tecnico_id, fecha_asignacion);
    res.status(201).json({ message: 'Técnico asignado' });
  } catch (err) { next(err); }
}

async function removeTecnico(req, res, next) {
  try {
    const project = await svc.getById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
    if (!canUpdateProject(req.user, project)) {
      return res.status(403).json({ error: 'Solo puedes gestionar proyectos asignados' });
    }
    const deleted = await svc.removeTecnico(req.params.id, req.params.tecnicoId);
    if (!deleted) return res.status(404).json({ error: 'Asignación no encontrada' });
    res.status(204).send();
  } catch (err) { next(err); }
}

// ─── FASES ────────────────────────────────────────────────────────────────────

async function createFase(req, res, next) {
  try {
    const project = await svc.getById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
    if (!canUpdateProject(req.user, project)) {
      return res.status(403).json({ error: 'Solo puedes gestionar proyectos asignados' });
    }
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'nombre es requerido' });
    const fase = await svc.createFase(req.params.id, req.body);
    await projectManagement.audit(
      req.user, Number(req.params.id), 'proyecto_fases', 'crear', fase.id,
      null, { ...fase, fase_id: fase.id },
      { ip: req.ip, userAgent: req.get('user-agent') }
    );
    res.status(201).json(fase);
  } catch (err) { next(err); }
}

async function updateFase(req, res, next) {
  try {
    const project = await svc.getById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
    if (!canUpdateProject(req.user, project)) {
      return res.status(403).json({ error: 'Solo puedes gestionar proyectos asignados' });
    }
    if (!(await svc.phaseBelongsToProject(req.params.faseId, req.params.id))) {
      return res.status(404).json({ error: 'Fase no encontrada en este proyecto' });
    }
    const previous = project.fases.find(item => Number(item.id) === Number(req.params.faseId));
    const fase = await svc.updateFase(req.params.faseId, req.body);
    if (!fase) return res.status(404).json({ error: 'Fase no encontrada' });
    await projectManagement.audit(
      req.user, Number(req.params.id), 'proyecto_fases', 'actualizar', fase.id,
      previous ? { ...previous, fase_id: previous.id } : null,
      { ...fase, fase_id: fase.id },
      { ip: req.ip, userAgent: req.get('user-agent') }
    );
    res.json(fase);
  } catch (err) { next(err); }
}

async function removeFase(req, res, next) {
  try {
    if (!(await svc.phaseBelongsToProject(req.params.faseId, req.params.id))) {
      return res.status(404).json({ error: 'Fase no encontrada en este proyecto' });
    }
    const deleted = await svc.removeFase(req.params.faseId);
    if (!deleted) return res.status(404).json({ error: 'Fase no encontrada' });
    res.status(204).send();
  } catch (err) { next(err); }
}

// ─── IMÁGENES ─────────────────────────────────────────────────────────────────

async function addImagen(req, res, next) {
  try {
    const project = await svc.getById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
    if (!canUpdateProject(req.user, project)) {
      return res.status(403).json({ error: 'Solo puedes gestionar proyectos asignados' });
    }
    if (!(await svc.phaseBelongsToProject(req.params.faseId, req.params.id))) {
      return res.status(404).json({ error: 'Fase no encontrada en este proyecto' });
    }
    const { url, descripcion } = req.body;
    if (!url) return res.status(400).json({ error: 'url es requerido' });
    res.status(201).json(await svc.addImagen(req.params.faseId, url, descripcion));
  } catch (err) { next(err); }
}

async function removeImagen(req, res, next) {
  try {
    if (!(await svc.phaseBelongsToProject(req.params.faseId, req.params.id))) {
      return res.status(404).json({ error: 'Fase no encontrada en este proyecto' });
    }
    if (!(await svc.imageBelongsToPhase(req.params.imagenId, req.params.faseId))) {
      return res.status(404).json({ error: 'Imagen no encontrada en esta fase' });
    }
    const deleted = await svc.removeImagen(req.params.imagenId);
    if (!deleted) return res.status(404).json({ error: 'Imagen no encontrada' });
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = {
  getAll, getById, getBySlug, create, update, remove,
  assignTecnico, removeTecnico,
  createFase, updateFase, removeFase,
  addImagen, removeImagen,
};
