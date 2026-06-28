const router = require('express').Router();
const ctrl = require('../controllers/tecnicos.controller');
const { verifyToken, requirePermission } = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');
const { validate, validateParams } = require('../middlewares/validate');
const { idParamSchema } = require('../schemas/common');
const { createTecnicoSchema, updateTecnicoSchema, assignSupervisorSchema } = require('../schemas/tecnicos');
const { adminLimiter } = require('../middlewares/rateLimiter');

router.get('/', verifyToken, requirePermission(PERMISSIONS.TECNICOS_READ), ctrl.getAll);
router.get('/:id', validateParams(idParamSchema), verifyToken, requirePermission(PERMISSIONS.TECNICOS_READ), ctrl.getById);
router.post('/', verifyToken, requirePermission(PERMISSIONS.TECNICOS_CREATE), adminLimiter, validate(createTecnicoSchema), ctrl.create);
router.put('/:id', validateParams(idParamSchema), verifyToken, requirePermission(PERMISSIONS.TECNICOS_UPDATE), validate(updateTecnicoSchema), ctrl.update);
router.delete('/:id', validateParams(idParamSchema), verifyToken, requirePermission(PERMISSIONS.TECNICOS_DELETE), ctrl.remove);
router.put('/:id/supervisor', validateParams(idParamSchema), verifyToken, requirePermission(PERMISSIONS.TECNICOS_ASSIGN), validate(assignSupervisorSchema), ctrl.assignSupervisor);

module.exports = router;
