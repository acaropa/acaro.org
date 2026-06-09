const router = require('express').Router();
const ctrl = require('../controllers/tecnicos.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

const canRead   = [verifyToken, requireRole('admin', 'supervisor', 'tecnico')];
const canWrite  = [verifyToken, requireRole('admin', 'supervisor')];
const adminOnly = [verifyToken, requireRole('admin')];

router.get('/',       canRead,   ctrl.getAll);
router.get('/:id',    canRead,   ctrl.getById);
router.post('/',      adminOnly, ctrl.create);
router.put('/:id',    canWrite,  ctrl.update);
router.delete('/:id', adminOnly, ctrl.remove);

module.exports = router;
