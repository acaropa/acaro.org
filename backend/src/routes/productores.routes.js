const router = require('express').Router();
const ctrl = require('../controllers/productores.controller');
const {
  verifyToken,
  requirePermission,
  optionalAuth,
} = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');

router.get('/', optionalAuth, ctrl.getAll);
router.get('/slug/:slug', optionalAuth, ctrl.getBySlug);
router.get('/:id', optionalAuth, ctrl.getById);
router.post('/', verifyToken, requirePermission(PERMISSIONS.PRODUCTORES_CREATE), ctrl.create);
router.put('/:id', verifyToken, requirePermission(PERMISSIONS.PRODUCTORES_UPDATE), ctrl.update);
router.delete('/:id', verifyToken, requirePermission(PERMISSIONS.PRODUCTORES_DELETE), ctrl.remove);

module.exports = router;
