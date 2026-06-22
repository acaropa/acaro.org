const encuestas = require('../services/encuestas.service');
const { hasPermission, PERMISSIONS } = require('../config/permissions');

async function getPublicList(req, res, next) {
  try {
    res.json(await encuestas.getAll(false));
  } catch (err) { next(err); }
}

async function getAll(req, res, next) {
  try {
    const includeAll = hasPermission(req.user, PERMISSIONS.ENCUESTAS_READ);
    res.json(await encuestas.getAll(includeAll));
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const item = await encuestas.getFullById(Number(req.params.id));
    if (!item) return res.status(404).json({ error: 'Encuesta no encontrada' });
    res.json(item);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { titulo } = req.body || {};
    if (!titulo) return res.status(400).json({ error: 'El título es requerido' });
    res.status(201).json(await encuestas.create(req.body, req.user));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const current = await encuestas.getById(Number(req.params.id));
    if (!current) return res.status(404).json({ error: 'Encuesta no encontrada' });

    const canUpdateAll = hasPermission(req.user, PERMISSIONS.ENCUESTAS_UPDATE);
    if (!canUpdateAll && current.created_by_user_id !== req.user.id) {
      return res.status(403).json({ error: 'No puedes editar esta encuesta' });
    }

    const item = await encuestas.update(Number(req.params.id), req.body);
    if (!item) return res.status(404).json({ error: 'Encuesta no encontrada' });
    res.json(item);
  } catch (err) { next(err); }
}

async function changeEstado(req, res, next) {
  try {
    const { estado } = req.body || {};
    if (!estado) return res.status(400).json({ error: 'El estado es requerido' });

    const item = await encuestas.changeEstado(Number(req.params.id), estado, req.user.id);
    if (!item) return res.status(404).json({ error: 'Encuesta no encontrada' });
    res.json(item);
  } catch (err) { next(err); }
}

async function duplicateEncuesta(req, res, next) {
  try {
    const item = await encuestas.duplicate(Number(req.params.id), req.user);
    if (!item) return res.status(404).json({ error: 'Encuesta no encontrada' });
    res.status(201).json(item);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const deleted = await encuestas.remove(Number(req.params.id));
    if (!deleted) return res.status(404).json({ error: 'Encuesta no encontrada' });
    res.status(204).send();
  } catch (err) { next(err); }
}

async function saveStructure(req, res, next) {
  try {
    const id = Number(req.params.id);
    const current = await encuestas.getById(id);
    if (!current) return res.status(404).json({ error: 'Encuesta no encontrada' });

    const { secciones = [], preguntas = [] } = req.body || {};
    const seccionMap = await encuestas.saveSecciones(id, secciones);
    await encuestas.savePreguntas(id, preguntas, seccionMap);

    res.json(await encuestas.getFullById(id));
  } catch (err) { next(err); }
}

async function getResults(req, res, next) {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const responses = await encuestas.getResponses(Number(req.params.id), { fechaInicio, fechaFin });
    res.json(responses);
  } catch (err) { next(err); }
}

async function deleteResponse(req, res, next) {
  try {
    const deleted = await encuestas.deleteResponse(Number(req.params.responseId));
    if (!deleted) return res.status(404).json({ error: 'Respuesta no encontrada' });
    res.status(204).send();
  } catch (err) { next(err); }
}

async function getPublicSurvey(req, res, next) {
  try {
    const item = await encuestas.getPublicBySlug(req.params.slug);
    if (!item) return res.status(404).json({ error: 'Encuesta no encontrada o no disponible' });

    if (item.fecha_cierre && new Date(item.fecha_cierre) < new Date()) {
      return res.status(410).json({ error: 'Esta encuesta ya cerró' });
    }

    res.json(item);
  } catch (err) { next(err); }
}

async function submitPublicResponse(req, res, next) {
  try {
    const survey = await encuestas.getPublicBySlug(req.params.slug);
    if (!survey) return res.status(404).json({ error: 'Encuesta no encontrada' });
    if (survey.estado !== 'publicada') {
      return res.status(400).json({ error: 'Esta encuesta no acepta respuestas' });
    }
    if (survey.fecha_cierre && new Date(survey.fecha_cierre) < new Date()) {
      return res.status(410).json({ error: 'Esta encuesta ya cerró' });
    }
    if (survey.requiere_login && !req.user) {
      return res.status(401).json({ error: 'Debes iniciar sesión para responder esta encuesta' });
    }

    if (survey.visibilidad === 'enlace_privado') {
      const token = req.body.token_acceso;
      if (!token) return res.status(400).json({ error: 'Token de acceso requerido' });
      const valid = await encuestas.validateToken(survey.id, token);
      if (!valid) return res.status(403).json({ error: 'Token inválido, usado o expirado' });
    }

    const { respuestas, token_acceso } = req.body;
    if (!respuestas || !Array.isArray(respuestas) || !respuestas.length) {
      return res.status(400).json({ error: 'Las respuestas son requeridas' });
    }

    const ip = req.ip || req.connection?.remoteAddress;
    const result = await encuestas.submitResponse(survey.id, respuestas, {
      userId: req.user?.id,
      ip,
      origen: 'web',
      token: token_acceso,
    });

    const mensaje = survey.mensaje_confirmacion || 'Gracias por responder la encuesta.';
    res.status(201).json({ ...result, mensaje_confirmacion: mensaje });
  } catch (err) { next(err); }
}

module.exports = {
  getPublicList,
  getAll,
  getById,
  create,
  update,
  changeEstado,
  duplicateEncuesta,
  remove,
  saveStructure,
  getResults,
  deleteResponse,
  getPublicSurvey,
  submitPublicResponse,
};
