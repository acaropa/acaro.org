const { z } = require('../middlewares/validate');

// La tabla tecnicos tiene: especialidad VARCHAR(150), disponible BOOLEAN
// No existe campo cargo ni notas
const createTecnicoSchema = z.object({
  email:       z.string({ required_error: 'email es requerido' }).email('Email inválido').max(254),
  password:    z.string({ required_error: 'password es requerida' }).min(12, 'La contraseña debe tener al menos 12 caracteres').max(72, 'Contraseña demasiado larga'),
  nombre:      z.string({ required_error: 'nombre es requerido' }).trim().min(1, 'nombre es requerido').max(100),
  apellido:    z.string({ required_error: 'apellido es requerido' }).trim().min(1, 'apellido es requerido').max(100),
  especialidad: z.string().trim().max(150).optional().nullable(),
  telefono:    z.string().trim().max(20).optional().nullable(),
});

const updateTecnicoSchema = z.object({
  nombre:      z.string().trim().min(1).max(100).optional(),
  apellido:    z.string().trim().min(1).max(100).optional(),
  especialidad: z.string().trim().max(150).optional().nullable(),
  telefono:    z.string().trim().max(20).optional().nullable(),
  disponible:  z.boolean().optional(),
});

const assignSupervisorSchema = z.object({
  supervisor_id: z.coerce.number({ required_error: 'supervisor_id es requerido' }).int().positive('supervisor_id debe ser un ID positivo'),
});

module.exports = { createTecnicoSchema, updateTecnicoSchema, assignSupervisorSchema };
