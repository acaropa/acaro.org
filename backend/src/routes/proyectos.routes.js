const router = require('express').Router();
const ctrl = require('../controllers/proyectos.controller');
const management = require('../controllers/project-management.controller');
const {
  verifyToken,
  requirePermission,
  optionalAuth,
} = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');
const { smartCache } = require('../middlewares/cache.middleware');
const { validate, validateParams } = require('../middlewares/validate');
const { idParamSchema, slugParamSchema } = require('../schemas/common');
const {
  createProyectoSchema,
  updateProyectoSchema,
  createFaseSchema,
  updateFaseSchema,
  assignTecnicoSchema,
  addImagenSchema,
} = require('../schemas/proyectos');
const { uploadLimiter } = require('../middlewares/rateLimiter');

router.get('/', smartCache(300, 600), optionalAuth, ctrl.getAll);
router.get('/slug/:slug', validateParams(slugParamSchema), smartCache(300, 600), optionalAuth, ctrl.getBySlug);
router.get('/:id', validateParams(idParamSchema), smartCache(300, 600), optionalAuth, ctrl.getById);

router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.PROYECTOS_CREATE),
  uploadLimiter,
  validate(createProyectoSchema),
  ctrl.create
);

router.get('/:id/gestion', validateParams(idParamSchema), verifyToken, management.getAll);
router.post('/:id/gestion/archivos', validateParams(idParamSchema), verifyToken, uploadLimiter, management.createFile);
router.post('/:id/gestion/:kind', validateParams(idParamSchema), verifyToken, management.create);
router.put('/:id/gestion/:kind/:entityId', validateParams(idParamSchema), verifyToken, management.update);
router.delete('/:id/gestion/:kind/:entityId', validateParams(idParamSchema), verifyToken, management.remove);
router.post('/:id/gestion/:kind/:entityId/revision', validateParams(idParamSchema), verifyToken, management.review);

router.put(
  '/:id',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.PROYECTOS_UPDATE_ASSIGNED, PERMISSIONS.PROYECTOS_UPDATE_ALL),
  uploadLimiter,
  validate(updateProyectoSchema),
  ctrl.update
);
router.delete(
  '/:id',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.PROYECTOS_DELETE),
  ctrl.remove
);

router.post(
  '/:id/tecnicos',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.PROYECTOS_UPDATE_ASSIGNED, PERMISSIONS.PROYECTOS_UPDATE_ALL),
  validate(assignTecnicoSchema),
  ctrl.assignTecnico
);
router.delete(
  '/:id/tecnicos/:tecnicoId',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.PROYECTOS_UPDATE_ASSIGNED, PERMISSIONS.PROYECTOS_UPDATE_ALL),
  ctrl.removeTecnico
);

router.post(
  '/:id/fases',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.PROYECTOS_UPDATE_ASSIGNED, PERMISSIONS.PROYECTOS_UPDATE_ALL),
  validate(createFaseSchema),
  ctrl.createFase
);
router.put(
  '/:id/fases/:faseId',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.PROYECTOS_UPDATE_ASSIGNED, PERMISSIONS.PROYECTOS_UPDATE_ALL),
  validate(updateFaseSchema),
  ctrl.updateFase
);
router.delete(
  '/:id/fases/:faseId',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.PROYECTOS_DELETE),
  ctrl.removeFase
);
router.post(
  '/:id/fases/:faseId/imagenes',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.PROYECTOS_UPDATE_ASSIGNED, PERMISSIONS.PROYECTOS_UPDATE_ALL),
  validate(addImagenSchema),
  ctrl.addImagen
);
router.delete(
  '/:id/fases/:faseId/imagenes/:imagenId',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.PROYECTOS_DELETE),
  ctrl.removeImagen
);

module.exports = router;
