const { z } = require('../middlewares/validate');

// Deben coincidir exactamente con el ENUM de la tabla proyectos en MySQL
const ESTADOS = ['pendiente', 'en_progreso', 'completado', 'cancelado'];
const TIPOS = ['publico', 'privado'];

const imageUploadShape = {
  imagen_base64: z.string().max(7_000_000, 'Imagen demasiado grande').optional(),
  imagen_nombre: z.string().trim().max(255).optional(),
  imagen_portada: z.string().max(1000).optional().nullable(),
};

const createProyectoSchema = z.object({
  nombre:        z.string({ required_error: 'nombre es requerido' }).trim().min(1, 'nombre es requerido').max(255, 'Nombre demasiado largo'),
  descripcion:   z.string().max(10_000, 'Descripción máximo 10,000 caracteres').optional().nullable(),
  impacto:       z.string().max(2000, 'Impacto máximo 2,000 caracteres').optional().nullable(),
  estado:        z.enum(ESTADOS).optional(),
  tipo:          z.enum(TIPOS).optional(),
  fecha_inicio:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (YYYY-MM-DD)').optional().nullable(),
  fecha_fin:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (YYYY-MM-DD)').optional().nullable(),
  supervisor_id: z.coerce.number().int().positive().optional().nullable(),
  destacado:     z.boolean().optional(),
  ...imageUploadShape,
});

const updateProyectoSchema = z.object({
  nombre:        z.string().trim().min(1).max(255).optional(),
  descripcion:   z.string().max(10_000).optional().nullable(),
  impacto:       z.string().max(2000).optional().nullable(),
  estado:        z.enum(ESTADOS).optional(),
  tipo:          z.enum(TIPOS).optional(),
  fecha_inicio:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  fecha_fin:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  supervisor_id: z.coerce.number().int().positive().optional().nullable(),
  destacado:     z.boolean().optional(),
  ...imageUploadShape,
});

const createFaseSchema = z.object({
  nombre:       z.string({ required_error: 'nombre es requerido' }).trim().min(1, 'nombre es requerido').max(255),
  descripcion:  z.string().max(5000).optional().nullable(),
  // ENUM de la tabla proyecto_fases en MySQL
  estado:       z.enum(['pendiente', 'en_progreso', 'completado']).optional(),
  fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  fecha_fin:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  orden:        z.coerce.number().int().min(0).optional(),
});

const updateFaseSchema = z.object({
  nombre:       z.string().trim().min(1).max(255).optional(),
  descripcion:  z.string().max(5000).optional().nullable(),
  estado:       z.enum(['pendiente', 'en_progreso', 'completado']).optional(),
  fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  fecha_fin:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  orden:        z.coerce.number().int().min(0).optional(),
});

const assignTecnicoSchema = z.object({
  tecnico_id:       z.coerce.number({ required_error: 'tecnico_id es requerido' }).int().positive(),
  fecha_asignacion: z.string({ required_error: 'fecha_asignacion es requerida' }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
});

const addImagenSchema = z.object({
  url:        z.string({ required_error: 'url es requerida' }).url('url debe ser una URL válida').max(1000),
  descripcion: z.string().trim().max(500).optional().nullable(),
});

const createIndicadorSchema = z.object({
  icono:    z.string().trim().min(1).max(50).optional(),
  valor:    z.string({ required_error: 'valor es requerido' }).trim().min(1, 'valor es requerido').max(100),
  etiqueta: z.string({ required_error: 'etiqueta es requerida' }).trim().min(1, 'etiqueta es requerida').max(255),
  orden:    z.coerce.number().int().min(0).optional(),
});

const updateIndicadorSchema = z.object({
  icono:    z.string().trim().min(1).max(50).optional(),
  valor:    z.string().trim().min(1).max(100).optional(),
  etiqueta: z.string().trim().min(1).max(255).optional(),
  orden:    z.coerce.number().int().min(0).optional(),
});

module.exports = {
  createProyectoSchema,
  updateProyectoSchema,
  createFaseSchema,
  updateFaseSchema,
  assignTecnicoSchema,
  addImagenSchema,
  createIndicadorSchema,
  updateIndicadorSchema,
};
