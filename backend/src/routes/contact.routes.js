const router = require('express').Router();
const ctrl = require('../controllers/contact.controller');
const { contactLimiter } = require('../middlewares/rateLimiter');
const { verifyToken, requirePermission } = require('../middlewares/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');

// Público: formulario de contacto
router.post('/', contactLimiter, ctrl.send);

// Protegido: bandeja de entrada
router.get('/mensajes', verifyToken, requirePermission(PERMISSIONS.CONTACTO_READ), ctrl.list);
router.get('/mensajes/:id', verifyToken, requirePermission(PERMISSIONS.CONTACTO_READ), ctrl.get);
router.post('/mensajes/:id/responder', verifyToken, requirePermission(PERMISSIONS.CONTACTO_REPLY), ctrl.reply);
router.delete('/mensajes/:id', verifyToken, requirePermission(PERMISSIONS.CONTACTO_READ), ctrl.remove);

module.exports = router;
