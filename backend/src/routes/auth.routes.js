const router = require('express').Router();
const { login, register, me, refresh, logout, logoutAll } = require('../controllers/auth.controller');
const { verifyToken, optionalAuth } = require('../middlewares/auth.middleware');
const { loginLimiter, registerLimiter } = require('../middlewares/rateLimiter');
const requireTrustedOrigin = require('../middlewares/origin.middleware');

router.post('/login', requireTrustedOrigin, loginLimiter, login);
router.post('/register', requireTrustedOrigin, registerLimiter, register);
router.post('/refresh', requireTrustedOrigin, refresh);
router.post('/logout', requireTrustedOrigin, optionalAuth, logout);
router.post('/logout-all', requireTrustedOrigin, verifyToken, logoutAll);
router.get('/me',        verifyToken, me);

module.exports = router;
