const router = require('express').Router();
const { login, register, me } = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rateLimiter');

router.post('/login',    authLimiter, login);
router.post('/register', authLimiter, register);
router.get('/me',        verifyToken, me);

module.exports = router;
