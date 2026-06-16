const router = require('express').Router();
const ctrl = require('../controllers/notasConceptuales.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/', verifyToken, ctrl.getAll);
router.get('/:id', verifyToken, ctrl.getById);
router.post('/', verifyToken, ctrl.create);
router.put('/:id', verifyToken, ctrl.update);
router.delete('/:id', verifyToken, ctrl.remove);

module.exports = router;
