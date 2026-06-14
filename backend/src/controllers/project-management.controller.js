const projects = require('../services/proyectos.service');
const management = require('../services/project-management.service');
const { hasPermission, PERMISSIONS } = require('../config/permissions');

async function loadProject(req, res) {
  const project = await projects.getById(req.params.id);
  if (!project) {
    res.status(404).json({ error: 'Proyecto no encontrado' });
    return null;
  }
  const privateRead = hasPermission(req.user, PERMISSIONS.PROYECTOS_READ_PRIVATE);
  const assigned =
    (req.user.role === 'supervisor' && project.supervisor_id === req.user.id) ||
    (req.user.role === 'tecnico' && project.tecnicos.some(item => item.user_id === req.user.id));
  if (!privateRead && !assigned) {
    res.status(403).json({ error: 'No tienes acceso a este proyecto' });
    return null;
  }
  return project;
}

function canManage(req, project) {
  return hasPermission(req.user, PERMISSIONS.PROYECTOS_UPDATE_ALL) ||
    (hasPermission(req.user, PERMISSIONS.PROYECTOS_UPDATE_ASSIGNED) && project.supervisor_id === req.user.id);
}

function canOperate(req, project) {
  return canManage(req, project) ||
    (hasPermission(req.user, PERMISSIONS.PROYECTOS_OPERATE_ASSIGNED) &&
      project.tecnicos.some(item => item.user_id === req.user.id));
}

function meta(req) {
  return { ip: req.ip, userAgent: req.get('user-agent') };
}

async function getAll(req, res, next) {
  try {
    const project = await loadProject(req, res);
    if (!project) return;
    res.json({ project, ...(await management.getManagement(req.params.id)) });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const project = await loadProject(req, res);
    if (!project) return;
    const manageOnly = ['decisiones'].includes(req.params.kind);
    if ((manageOnly && !canManage(req, project)) || (!manageOnly && !canOperate(req, project))) {
      return res.status(403).json({ error: 'No tienes permiso para registrar este elemento' });
    }
    const body = { ...req.body };
    if (!canManage(req, project) && req.params.kind === 'finanzas') body.estado = 'pendiente';
    res.status(201).json(await management.createEntity(req.params.kind, req.params.id, body, req.user, meta(req)));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const project = await loadProject(req, res);
    if (!project) return;
    if (!canOperate(req, project)) return res.status(403).json({ error: 'No tienes permiso para editar' });
    if (req.params.kind === 'decisiones' && !canManage(req, project)) {
      return res.status(403).json({ error: 'Solo administradores o supervisores pueden editar decisiones' });
    }
    const body = { ...req.body };
    if (!canManage(req, project) && req.params.kind === 'finanzas') delete body.estado;
    const result = await management.updateEntity(
      req.params.kind, req.params.id, req.params.entityId, body, req.user, meta(req), canManage(req, project)
    );
    if (!result) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(result);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const project = await loadProject(req, res);
    if (!project) return;
    if (!canManage(req, project)) return res.status(403).json({ error: 'Solo administradores o supervisores pueden archivar' });
    const removed = await management.removeEntity(req.params.kind, req.params.id, req.params.entityId, req.user, meta(req));
    if (!removed) return res.status(404).json({ error: 'Registro no encontrado' });
    res.status(204).send();
  } catch (err) { next(err); }
}

async function createFile(req, res, next) {
  try {
    const project = await loadProject(req, res);
    if (!project) return;
    if (!canOperate(req, project)) return res.status(403).json({ error: 'No tienes permiso para subir archivos' });
    res.status(201).json(await management.createFile(req.params.id, req.body, req.user, meta(req)));
  } catch (err) { next(err); }
}

async function review(req, res, next) {
  try {
    const project = await loadProject(req, res);
    if (!project) return;
    const assignedReviewer = hasPermission(req.user, PERMISSIONS.PROYECTOS_REVIEW_ASSIGNED) &&
      project.supervisor_id === req.user.id;
    if (!hasPermission(req.user, PERMISSIONS.PROYECTOS_UPDATE_ALL) && !assignedReviewer) {
      return res.status(403).json({ error: 'No tienes permiso para revisar' });
    }
    const result = await management.review(
      req.params.id, req.params.kind, req.params.entityId,
      req.body.action, req.body.observation, req.user, meta(req)
    );
    if (!result) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(result);
  } catch (err) { next(err); }
}

module.exports = { getAll, create, update, remove, createFile, review };
