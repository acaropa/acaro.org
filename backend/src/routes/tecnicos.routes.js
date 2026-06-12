const router = require('express').Router();
const ctrl = require('../controllers/tecnicos.controller');
const { verifyToken, requirePermission } = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');

router.get('/', verifyToken, requirePermission(PERMISSIONS.TECNICOS_READ), ctrl.getAll);
router.get('/:id', verifyToken, requirePermission(PERMISSIONS.TECNICOS_READ), ctrl.getById);
router.post('/', verifyToken, requirePermission(PERMISSIONS.TECNICOS_CREATE), ctrl.create);
router.put('/:id', verifyToken, requirePermission(PERMISSIONS.TECNICOS_UPDATE), ctrl.update);
router.delete('/:id', verifyToken, requirePermission(PERMISSIONS.TECNICOS_DELETE), ctrl.remove);
router.put('/:id/supervisor', verifyToken, requirePermission(PERMISSIONS.TECNICOS_ASSIGN), ctrl.assignSupervisor);

module.exports = router;
