const { z } = require('../middlewares/validate');

// La tabla socios usa estado ENUM('activo','inactivo'), no un campo booleano
const createSocioSchema = z.object({
  nombre:        z.string({ required_error: 'nombre es requerido' }).trim().min(1, 'nombre es requerido').max(100, 'Nombre demasiado largo'),
  apellido:      z.string({ required_error: 'apellido es requerido' }).trim().min(1, 'apellido es requerido').max(100, 'Apellido demasiado largo'),
  fecha_ingreso: z.string({ required_error: 'fecha_ingreso es requerida' }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (YYYY-MM-DD)'),
  dni:           z.string().trim().max(20).optional().nullable(),
  telefono:      z.string().trim().max(20).optional().nullable(),
  email:         z.string().email('Email inválido').max(254).optional().nullable(),
  direccion:     z.string().trim().max(255).optional().nullable(),
  user_id:       z.coerce.number().int().positive().optional().nullable(),
});

const updateSocioSchema = z.object({
  nombre:        z.string().trim().min(1).max(100).optional(),
  apellido:      z.string().trim().min(1).max(100).optional(),
  fecha_ingreso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dni:           z.string().trim().max(20).optional().nullable(),
  telefono:      z.string().trim().max(20).optional().nullable(),
  email:         z.string().email().max(254).optional().nullable(),
  direccion:     z.string().trim().max(255).optional().nullable(),
  // ENUM('activo','inactivo') en la tabla socios
  estado:        z.enum(['activo', 'inactivo']).optional(),
  user_id:       z.coerce.number().int().positive().optional().nullable(),
});

module.exports = { createSocioSchema, updateSocioSchema };
