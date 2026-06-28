const router = require('express').Router();
const ctrl = require('../controllers/biblioteca.controller');
const {
  verifyToken,
  requirePermission,
  optionalAuth,
} = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');
const { smartCache, publicCache } = require('../middlewares/cache.middleware');
const { validate, validateParams } = require('../middlewares/validate');
const { idParamSchema, slugParamSchema } = require('../schemas/common');
const { createBibliotecaSchema, updateBibliotecaSchema, reviewBibliotecaSchema } = require('../schemas/biblioteca');
const { uploadLimiter } = require('../middlewares/rateLimiter');

router.get('/', smartCache(300, 600), optionalAuth, ctrl.getAll);
router.get('/portada', publicCache(300, 600), ctrl.getHomepage);
router.get('/slug/:slug', validateParams(slugParamSchema), smartCache(300, 600), optionalAuth, ctrl.getBySlug);
router.get('/serie/:serie', publicCache(300, 600), ctrl.getBySerie);
router.get('/:id', validateParams(idParamSchema), smartCache(300, 600), optionalAuth, ctrl.getById);
router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.BIBLIOTECA_UPLOAD_OWN),
  uploadLimiter,
  validate(createBibliotecaSchema),
  ctrl.create
);
router.put(
  '/:id',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.BIBLIOTECA_UPLOAD_OWN, PERMISSIONS.BIBLIOTECA_REVIEW),
  uploadLimiter,
  validate(updateBibliotecaSchema),
  ctrl.update
);
router.post(
  '/:id/resubmit',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.BIBLIOTECA_UPLOAD_OWN),
  ctrl.resubmit
);
router.post(
  '/:id/review',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.BIBLIOTECA_REVIEW),
  validate(reviewBibliotecaSchema),
  ctrl.review
);
router.delete(
  '/:id',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.BIBLIOTECA_DELETE),
  ctrl.remove
);

module.exports = router;
