const router = require('express').Router();
const ctrl = require('../controllers/socios.controller');
const { verifyToken, requirePermission } = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');
const { validate, validateParams } = require('../middlewares/validate');
const { idParamSchema } = require('../schemas/common');
const { createSocioSchema, updateSocioSchema } = require('../schemas/socios');
const { adminLimiter } = require('../middlewares/rateLimiter');

router.use(verifyToken);
router.get('/', requirePermission(PERMISSIONS.SOCIOS_READ), ctrl.getAll);
router.get('/:id', validateParams(idParamSchema), requirePermission(PERMISSIONS.SOCIOS_READ), ctrl.getById);
router.post('/', requirePermission(PERMISSIONS.SOCIOS_CREATE), adminLimiter, validate(createSocioSchema), ctrl.create);
router.put('/:id', validateParams(idParamSchema), requirePermission(PERMISSIONS.SOCIOS_UPDATE), validate(updateSocioSchema), ctrl.update);
router.delete('/:id', validateParams(idParamSchema), requirePermission(PERMISSIONS.SOCIOS_DELETE), ctrl.remove);

module.exports = router;
