const router = require('express').Router();
const ctrl = require('../controllers/proyectos.controller');
const {
  verifyToken,
  requirePermission,
  optionalAuth,
} = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');

router.get('/', optionalAuth, ctrl.getAll);
router.get(
  '/:id',
  optionalAuth,
  ctrl.getById
);
router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.PROYECTOS_CREATE),
  ctrl.create
);
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
