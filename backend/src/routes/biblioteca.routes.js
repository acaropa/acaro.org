const router = require('express').Router();
const ctrl = require('../controllers/biblioteca.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const canWrite  = [verifyToken, requireRole('admin', 'supervisor')];
const adminOnly = [verifyToken, requireRole('admin')];

router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/',   canWrite,  ctrl.create);
router.put('/:id', canWrite,  ctrl.update);
router.delete('/:id', adminOnly, ctrl.remove);

module.exports = router;
