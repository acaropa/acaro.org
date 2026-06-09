const router = require('express').Router();
const ctrl = require('../controllers/proyectos.controller');
const { verifyToken, requireRole, optionalAuth } = require('../middlewares/auth.middleware');

const canRead   = [verifyToken, requireRole('admin', 'supervisor', 'tecnico')];
const canWrite  = [verifyToken, requireRole('admin', 'supervisor')];
const adminOnly = [verifyToken, requireRole('admin')];

// Proyectos
router.get('/',    optionalAuth, ctrl.getAll);   // público: solo devuelve tipo=publico; con token: todos
router.get('/:id', canRead,  ctrl.getById);
router.post('/',   canWrite, ctrl.create);
router.put('/:id', canWrite, ctrl.update);
router.delete('/:id', adminOnly, ctrl.remove);

// Técnicos en proyecto
router.post('/:id/tecnicos',                canWrite, ctrl.assignTecnico);
router.delete('/:id/tecnicos/:tecnicoId',   canWrite, ctrl.removeTecnico);

// Fases
router.post('/:id/fases',                   canWrite,  ctrl.createFase);
router.put('/:id/fases/:faseId',            canWrite,  ctrl.updateFase);
router.delete('/:id/fases/:faseId',         adminOnly, ctrl.removeFase);

// Imágenes de fase
router.post('/:id/fases/:faseId/imagenes',              canWrite,  ctrl.addImagen);
router.delete('/:id/fases/:faseId/imagenes/:imagenId',  adminOnly, ctrl.removeImagen);

module.exports = router;
