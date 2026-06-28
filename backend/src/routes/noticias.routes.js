const router = require('express').Router();
const ctrl = require('../controllers/noticias.controller');
const {
  verifyToken,
  requirePermission,
  optionalAuth,
} = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');
const { smartCache } = require('../middlewares/cache.middleware');
const { validate, validateParams } = require('../middlewares/validate');
const { idParamSchema, slugParamSchema } = require('../schemas/common');
const { createNoticiaSchema, updateNoticiaSchema } = require('../schemas/noticias');
const { uploadLimiter } = require('../middlewares/rateLimiter');

router.get('/', smartCache(300, 600), optionalAuth, ctrl.getAll);
router.get('/slug/:slug', validateParams(slugParamSchema), smartCache(300, 600), optionalAuth, ctrl.getBySlug);
router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.NOTICIAS_CREATE, PERMISSIONS.NOTICIAS_CREATE_OWN),
  uploadLimiter,
  validate(createNoticiaSchema),
  ctrl.create
);
router.put(
  '/:id',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.NOTICIAS_CREATE_OWN, PERMISSIONS.NOTICIAS_UPDATE),
  uploadLimiter,
  validate(updateNoticiaSchema),
  ctrl.update
);
router.post('/:id/publish', validateParams(idParamSchema), verifyToken, requirePermission(PERMISSIONS.NOTICIAS_PUBLISH), ctrl.publish);
router.delete('/:id', validateParams(idParamSchema), verifyToken, requirePermission(PERMISSIONS.NOTICIAS_DELETE), ctrl.remove);

module.exports = router;
