const router = require('express').Router();
const ctrl = require('../controllers/encuestas.controller');
const {
  verifyToken,
  requirePermission,
  optionalAuth,
} = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');
const { publicCache, privateNoStore } = require('../middlewares/cache.middleware');

// ─── Rutas públicas ───────────────────────────────────────
router.get('/publicas', publicCache(120, 300), ctrl.getPublicList);
router.get('/publica/:slug', publicCache(120, 300), ctrl.getPublicSurvey);
router.post('/publica/:slug/responder', optionalAuth, ctrl.submitPublicResponse);

// ─── Rutas admin (protegidas) ─────────────────────────────
router.get(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.ENCUESTAS_READ),
  privateNoStore,
  ctrl.getAll
);

router.get(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.ENCUESTAS_READ),
  privateNoStore,
  ctrl.getById
);

router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.ENCUESTAS_CREATE),
  ctrl.create
);

router.put(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.ENCUESTAS_UPDATE, PERMISSIONS.ENCUESTAS_CREATE),
  ctrl.update
);

router.put(
  '/:id/estructura',
  verifyToken,
  requirePermission(PERMISSIONS.ENCUESTAS_UPDATE, PERMISSIONS.ENCUESTAS_CREATE),
  ctrl.saveStructure
);

router.patch(
  '/:id/estado',
  verifyToken,
  requirePermission(PERMISSIONS.ENCUESTAS_PUBLISH, PERMISSIONS.ENCUESTAS_CLOSE),
  ctrl.changeEstado
);

router.post(
  '/:id/duplicar',
  verifyToken,
  requirePermission(PERMISSIONS.ENCUESTAS_DUPLICATE, PERMISSIONS.ENCUESTAS_CREATE),
  ctrl.duplicateEncuesta
);

router.delete(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.ENCUESTAS_DELETE),
  ctrl.remove
);

router.get(
  '/:id/resultados',
  verifyToken,
  requirePermission(PERMISSIONS.ENCUESTAS_RESULTS_READ),
  ctrl.getResults
);

router.delete(
  '/respuestas/:responseId',
  verifyToken,
  requirePermission(PERMISSIONS.ENCUESTAS_RESULTS_DELETE),
  ctrl.deleteResponse
);

module.exports = router;
