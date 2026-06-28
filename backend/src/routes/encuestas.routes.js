const router = require('express').Router();
const ctrl = require('../controllers/encuestas.controller');
const {
  verifyToken,
  requirePermission,
  optionalAuth,
} = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');
const { publicCache, privateNoStore } = require('../middlewares/cache.middleware');
const { validate, validateParams } = require('../middlewares/validate');
const { idParamSchema, slugParamSchema } = require('../schemas/common');
const {
  createEncuestaSchema,
  updateEncuestaSchema,
  changeEstadoSchema,
  saveStructureSchema,
  submitResponseSchema,
} = require('../schemas/encuestas');
const { surveyResponseLimiter, surveyCreateLimiter } = require('../middlewares/rateLimiter');

// ─── Rutas públicas ───────────────────────────────────────
router.get('/publicas', publicCache(120, 300), ctrl.getPublicList);
router.get('/publica/:slug', validateParams(slugParamSchema), publicCache(120, 300), ctrl.getPublicSurvey);
router.post(
  '/publica/:slug/responder',
  validateParams(slugParamSchema),
  optionalAuth,
  surveyResponseLimiter,
  validate(submitResponseSchema),
  ctrl.submitPublicResponse
);

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
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.ENCUESTAS_READ),
  privateNoStore,
  ctrl.getById
);

router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.ENCUESTAS_CREATE),
  surveyCreateLimiter,
  validate(createEncuestaSchema),
  ctrl.create
);

router.put(
  '/:id',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.ENCUESTAS_UPDATE, PERMISSIONS.ENCUESTAS_CREATE),
  validate(updateEncuestaSchema),
  ctrl.update
);

router.put(
  '/:id/estructura',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.ENCUESTAS_UPDATE, PERMISSIONS.ENCUESTAS_CREATE),
  validate(saveStructureSchema),
  ctrl.saveStructure
);

router.patch(
  '/:id/estado',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.ENCUESTAS_PUBLISH, PERMISSIONS.ENCUESTAS_CLOSE),
  validate(changeEstadoSchema),
  ctrl.changeEstado
);

router.post(
  '/:id/duplicar',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.ENCUESTAS_DUPLICATE, PERMISSIONS.ENCUESTAS_CREATE),
  ctrl.duplicateEncuesta
);

router.delete(
  '/:id',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.ENCUESTAS_DELETE),
  ctrl.remove
);

router.get(
  '/:id/resultados',
  validateParams(idParamSchema),
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
