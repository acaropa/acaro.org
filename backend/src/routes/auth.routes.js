const router = require('express').Router();
const { login, register, me } = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { loginLimiter, registerLimiter } = require('../middlewares/rateLimiter');

router.post('/login',    loginLimiter, login);
router.post('/register', registerLimiter, register);
router.get('/me',        verifyToken, me);

module.exports = router;
