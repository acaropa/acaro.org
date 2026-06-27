const router = require('express').Router();
const ctrl = require('../controllers/noticias.controller');
const {
  verifyToken,
  requirePermission,
  optionalAuth,
} = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');
const { smartCache } = require('../middlewares/cache.middleware');

router.get('/', smartCache(300, 600), optionalAuth, ctrl.getAll);
router.get('/slug/:slug', smartCache(300, 600), optionalAuth, ctrl.getBySlug);
router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.NOTICIAS_CREATE, PERMISSIONS.NOTICIAS_CREATE_OWN),
  ctrl.create
);
router.put(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.NOTICIAS_CREATE_OWN, PERMISSIONS.NOTICIAS_UPDATE),
  ctrl.update
);
router.post('/:id/publish', verifyToken, requirePermission(PERMISSIONS.NOTICIAS_PUBLISH), ctrl.publish);
router.delete('/:id', verifyToken, requirePermission(PERMISSIONS.NOTICIAS_DELETE), ctrl.remove);

module.exports = router;
