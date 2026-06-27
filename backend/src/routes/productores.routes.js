const router = require('express').Router();
const ctrl = require('../controllers/productores.controller');
const {
  verifyToken,
  requirePermission,
  optionalAuth,
} = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');
const { smartCache } = require('../middlewares/cache.middleware');

router.get('/', smartCache(600, 1200), optionalAuth, ctrl.getAll);
router.get('/slug/:slug', smartCache(600, 1200), optionalAuth, ctrl.getBySlug);
router.get('/:id', smartCache(600, 1200), optionalAuth, ctrl.getById);
router.post('/', verifyToken, requirePermission(PERMISSIONS.PRODUCTORES_CREATE), ctrl.create);
router.put('/:id', verifyToken, requirePermission(PERMISSIONS.PRODUCTORES_UPDATE), ctrl.update);
router.delete('/:id', verifyToken, requirePermission(PERMISSIONS.PRODUCTORES_DELETE), ctrl.remove);

module.exports = router;
