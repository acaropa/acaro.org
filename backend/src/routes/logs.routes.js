const router = require('express').Router();
const ctrl = require('../controllers/logs.controller');
const { verifyToken, requirePermission } = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');

router.use(verifyToken);
router.use(requirePermission(PERMISSIONS.CONFIGURACION_MANAGE));

router.get('/audit', ctrl.getAuditLogs);
router.get('/sessions', ctrl.getSessionLogs);
router.get('/modules', ctrl.getModules);

module.exports = router;
