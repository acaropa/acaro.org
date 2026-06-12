const router = require('express').Router();
const ctrl = require('../controllers/socios.controller');
const { verifyToken, requirePermission } = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');

router.get('/', verifyToken, requirePermission(PERMISSIONS.SOCIOS_READ), ctrl.getAll);
router.get('/:id', verifyToken, requirePermission(PERMISSIONS.SOCIOS_READ), ctrl.getById);
router.post('/', verifyToken, requirePermission(PERMISSIONS.SOCIOS_CREATE), ctrl.create);
router.put('/:id', verifyToken, requirePermission(PERMISSIONS.SOCIOS_UPDATE), ctrl.update);
router.delete('/:id', verifyToken, requirePermission(PERMISSIONS.SOCIOS_DELETE), ctrl.remove);

module.exports = router;
