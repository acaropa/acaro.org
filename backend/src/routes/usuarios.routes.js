const router = require('express').Router();
const ctrl = require('../controllers/usuarios.controller');
const { verifyToken, requirePermission } = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');
const { validate } = require('../middlewares/validate');
const { createUsuarioSchema, assignRoleSchema } = require('../schemas/usuarios');

router.use(verifyToken);
router.get('/', requirePermission(PERMISSIONS.USUARIOS_READ), ctrl.getAll);
router.post('/', requirePermission(PERMISSIONS.USUARIOS_CREATE), validate(createUsuarioSchema), ctrl.create);
router.put('/:id', requirePermission(PERMISSIONS.USUARIOS_UPDATE), ctrl.update);
router.patch('/:id/role', requirePermission(PERMISSIONS.USUARIOS_ASSIGN_ROLES), validate(assignRoleSchema), ctrl.assignRole);
router.patch('/:id/disable', requirePermission(PERMISSIONS.USUARIOS_DISABLE), ctrl.disable);

module.exports = router;
