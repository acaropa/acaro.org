const router = require('express').Router();
const ctrl = require('../controllers/settings.controller');
const { verifyToken, requirePermission } = require('../middlewares/auth.middleware');
const { publicCache } = require('../middlewares/cache.middleware');
const { PERMISSIONS } = require('../config/permissions');

router.get('/landing', publicCache(300, 600), ctrl.getLanding);
router.put('/landing', verifyToken, requirePermission(PERMISSIONS.CONFIGURACION_MANAGE), ctrl.updateLanding);
router.get('/library-themes', publicCache(300, 600), ctrl.getLibraryThemes);
router.put('/library-themes', verifyToken, requirePermission(PERMISSIONS.CONFIGURACION_MANAGE), ctrl.updateLibraryThemes);

module.exports = router;
