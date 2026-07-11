const { z } = require('../middlewares/validate');

const createActorSchema = z.object({
  nombre: z.string({ required_error: 'nombre es requerido' }).trim().min(1, 'nombre es requerido').max(200, 'Nombre demasiado largo'),
  tipo_entidad: z.enum(['persona', 'empresa', 'organizacion', 'institucion'], { required_error: 'tipo_entidad es requerido' }),
  distrito_id: z.coerce.number().int().positive('distrito_id debe ser un ID válido'),
  comunidad: z.string().trim().max(150).optional().nullable(),
  activo: z.boolean().optional(),
  tipos: z.array(z.string()).min(1, 'Debe seleccionar al menos un tipo de actor').optional(),
});

const updateActorSchema = z.object({
  nombre: z.string().trim().min(1).max(200).optional(),
  tipo_entidad: z.enum(['persona', 'empresa', 'organizacion', 'institucion']).optional(),
  distrito_id: z.coerce.number().int().positive().optional(),
  comunidad: z.string().trim().max(150).optional().nullable(),
  activo: z.boolean().optional(),
  tipos: z.array(z.string()).min(1).optional(),
});

module.exports = { createActorSchema, updateActorSchema };
