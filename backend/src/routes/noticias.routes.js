const router = require('express').Router();
const ctrl = require('../controllers/noticias.controller');
const {
  verifyToken,
  requirePermission,
  optionalAuth,
} = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');

router.get('/', optionalAuth, ctrl.getAll);
router.post('/', verifyToken, requirePermission(PERMISSIONS.NOTICIAS_CREATE), ctrl.create);
router.put('/:id', verifyToken, requirePermission(PERMISSIONS.NOTICIAS_UPDATE), ctrl.update);
router.post('/:id/publish', verifyToken, requirePermission(PERMISSIONS.NOTICIAS_PUBLISH), ctrl.publish);
router.delete('/:id', verifyToken, requirePermission(PERMISSIONS.NOTICIAS_DELETE), ctrl.remove);

module.exports = router;
