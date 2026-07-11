const router = require('express').Router();
const ctrl = require('../controllers/mapa.controller');
const {
  verifyToken,
  requirePermission,
  optionalAuth,
} = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');
const { validate, validateParams } = require('../middlewares/validate');
const { idParamSchema } = require('../schemas/common');
const { createActorSchema, updateActorSchema } = require('../schemas/mapa');

// Public endpoints
router.get('/cadena-valor', ctrl.getMapData);
router.get('/provincias', ctrl.getProvincias);
router.get('/provincias/:provincia/distritos', ctrl.getDistritosByProvincia);

// Private/Admin endpoints (require token and community management permissions)
router.get(
  '/actores',
  verifyToken,
  requirePermission(PERMISSIONS.PRODUCTORES_CREATE),
  ctrl.getActores
);

router.post(
  '/actores',
  verifyToken,
  requirePermission(PERMISSIONS.PRODUCTORES_CREATE),
  validate(createActorSchema),
  ctrl.createActor
);

router.put(
  '/actores/:id',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.PRODUCTORES_UPDATE),
  validate(updateActorSchema),
  ctrl.updateActor
);

router.delete(
  '/actores/:id',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.PRODUCTORES_DELETE),
  ctrl.softDeleteActor
);

module.exports = router;
