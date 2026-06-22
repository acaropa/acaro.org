const router = require('express').Router();
const ctrl = require('../controllers/biblioteca.controller');
const {
  verifyToken,
  requirePermission,
  optionalAuth,
} = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');

router.get('/', optionalAuth, ctrl.getAll);
router.get('/slug/:slug', optionalAuth, ctrl.getBySlug);
router.get('/serie/:serie', ctrl.getBySerie);
router.get('/:id', optionalAuth, ctrl.getById);
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
