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

router.get('/', smartCache(300, 600), optionalAuth, ctrl.getAll);
router.get('/slug/:slug', smartCache(300, 600), optionalAuth, ctrl.getBySlug);
router.get(
  '/:id',
  smartCache(300, 600),
  optionalAuth,
  ctrl.getById
);
router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.PROYECTOS_CREATE),
  ctrl.create
);

router.get('/:id/gestion', verifyToken, management.getAll);
router.post('/:id/gestion/archivos', verifyToken, management.createFile);
router.post('/:id/gestion/:kind', verifyToken, management.create);
router.put('/:id/gestion/:kind/:entityId', verifyToken, management.update);
router.delete('/:id/gestion/:kind/:entityId', verifyToken, management.remove);
router.post('/:id/gestion/:kind/:entityId/revision', verifyToken, management.review);
router.put(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.PROYECTOS_UPDATE_ASSIGNED, PERMISSIONS.PROYECTOS_UPDATE_ALL),
  ctrl.update
);
router.delete(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.PROYECTOS_DELETE),
  ctrl.remove
);

router.post(
  '/:id/tecnicos',
  verifyToken,
  requirePermission(PERMISSIONS.PROYECTOS_UPDATE_ASSIGNED, PERMISSIONS.PROYECTOS_UPDATE_ALL),
  ctrl.assignTecnico
);
router.delete(
  '/:id/tecnicos/:tecnicoId',
  verifyToken,
  requirePermission(PERMISSIONS.PROYECTOS_UPDATE_ASSIGNED, PERMISSIONS.PROYECTOS_UPDATE_ALL),
  ctrl.removeTecnico
);
router.post(
  '/:id/fases',
  verifyToken,
  requirePermission(PERMISSIONS.PROYECTOS_UPDATE_ASSIGNED, PERMISSIONS.PROYECTOS_UPDATE_ALL),
  ctrl.createFase
);
router.put(
  '/:id/fases/:faseId',
  verifyToken,
  requirePermission(PERMISSIONS.PROYECTOS_UPDATE_ASSIGNED, PERMISSIONS.PROYECTOS_UPDATE_ALL),
  ctrl.updateFase
);
router.delete(
  '/:id/fases/:faseId',
  verifyToken,
  requirePermission(PERMISSIONS.PROYECTOS_DELETE),
  ctrl.removeFase
);
router.post(
  '/:id/fases/:faseId/imagenes',
  verifyToken,
  requirePermission(PERMISSIONS.PROYECTOS_UPDATE_ASSIGNED, PERMISSIONS.PROYECTOS_UPDATE_ALL),
  ctrl.addImagen
);
router.delete(
  '/:id/fases/:faseId/imagenes/:imagenId',
  verifyToken,
  requirePermission(PERMISSIONS.PROYECTOS_DELETE),
  ctrl.removeImagen
);

module.exports = router;
