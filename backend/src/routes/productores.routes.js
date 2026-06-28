const router = require('express').Router();
const ctrl = require('../controllers/productores.controller');
const {
  verifyToken,
  requirePermission,
  optionalAuth,
} = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');
const { smartCache } = require('../middlewares/cache.middleware');
const { validate, validateParams } = require('../middlewares/validate');
const { idParamSchema, slugParamSchema } = require('../schemas/common');
const { createProductorSchema, updateProductorSchema } = require('../schemas/productores');
const { uploadLimiter } = require('../middlewares/rateLimiter');

router.get('/', smartCache(600, 1200), optionalAuth, ctrl.getAll);
router.get('/slug/:slug', validateParams(slugParamSchema), smartCache(600, 1200), optionalAuth, ctrl.getBySlug);
router.get('/:id', validateParams(idParamSchema), smartCache(600, 1200), optionalAuth, ctrl.getById);
router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.PRODUCTORES_CREATE),
  uploadLimiter,
  validate(createProductorSchema),
  ctrl.create
);
router.put(
  '/:id',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.PRODUCTORES_UPDATE),
  uploadLimiter,
  validate(updateProductorSchema),
  ctrl.update
);
router.delete(
  '/:id',
  validateParams(idParamSchema),
  verifyToken,
  requirePermission(PERMISSIONS.PRODUCTORES_DELETE),
  ctrl.remove
);

module.exports = router;
