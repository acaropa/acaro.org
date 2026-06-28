const router = require('express').Router();
const ctrl = require('../controllers/biblioteca.controller');
const {
  verifyToken,
  requirePermission,
  optionalAuth,
} = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');
const { smartCache, publicCache } = require('../middlewares/cache.middleware');

router.get('/', smartCache(300, 600), optionalAuth, ctrl.getAll);
router.get('/portada', publicCache(300, 600), ctrl.getHomepage);
router.get('/slug/:slug', smartCache(300, 600), optionalAuth, ctrl.getBySlug);
router.get('/serie/:serie', publicCache(300, 600), ctrl.getBySerie);
router.get('/:id', smartCache(300, 600), optionalAuth, ctrl.getById);
router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.BIBLIOTECA_UPLOAD_OWN),
  ctrl.create
);
router.put(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.BIBLIOTECA_UPLOAD_OWN, PERMISSIONS.BIBLIOTECA_REVIEW),
  ctrl.update
);
router.post(
  '/:id/resubmit',
  verifyToken,
  requirePermission(PERMISSIONS.BIBLIOTECA_UPLOAD_OWN),
  ctrl.resubmit
);
router.post(
  '/:id/review',
  verifyToken,
  requirePermission(PERMISSIONS.BIBLIOTECA_REVIEW),
  ctrl.review
);
router.delete(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.BIBLIOTECA_DELETE),
  ctrl.remove
);

module.exports = router;
