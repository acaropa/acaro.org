const router = require('express').Router();
const ctrl = require('../controllers/contact.controller');
const { contactLimiter } = require('../middlewares/rateLimiter');

router.post('/', contactLimiter, ctrl.send);

module.exports = router;
