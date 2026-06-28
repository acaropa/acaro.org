const { z } = require('../middlewares/validate');

const VISIBILIDADES = ['publica', 'interna'];
const CATEGORIAS_MAX = 100;
const REVIEW_ACTIONS = ['approve', 'reject', 'request_changes', 'archive', 'unarchive'];

const fileUploadShape = {
  archivo_base64: z.string().max(12_000_000, 'Archivo demasiado grande').optional(),
  archivo_nombre: z.string().trim().max(255, 'Nombre demasiado largo').optional(),
  archivo_url:    z.string().max(1000).optional(),
};

const coverUploadShape = {
  portada_base64: z.string().max(7_000_000, 'Imagen demasiado grande').optional(),
  portada_nombre: z.string().trim().max(255).optional(),
  imagen_portada: z.string().max(1000).optional().nullable(),
};

const createBibliotecaSchema = z.object({
  titulo:        z.string({ required_error: 'titulo es requerido' }).trim().min(1, 'titulo es requerido').max(255, 'Título demasiado largo'),
  descripcion:   z.string().max(5000, 'Descripción máximo 5000 caracteres').optional().nullable(),
  categoria:     z.string({ required_error: 'categoria es requerida' }).trim().min(1, 'categoria es requerida').max(CATEGORIAS_MAX),
  visibilidad:   z.enum(VISIBILIDADES, { error: 'visibilidad inválida' }),
  etiquetas:     z.array(z.string().trim().min(1).max(100)).max(20, 'Máximo 20 etiquetas').optional().nullable(),
  serie:         z.string().trim().max(100, 'Serie máximo 100 caracteres').optional().nullable(),
  orden_lectura: z.coerce.number().int().positive('orden_lectura debe ser entero positivo').optional().nullable(),
  ...fileUploadShape,
  ...coverUploadShape,
});

const updateBibliotecaSchema = z.object({
  titulo:        z.string().trim().min(1).max(255).optional(),
  descripcion:   z.string().max(5000).optional().nullable(),
  categoria:     z.string().trim().min(1).max(CATEGORIAS_MAX).optional(),
  visibilidad:   z.enum(VISIBILIDADES).optional(),
  etiquetas:     z.array(z.string().trim().min(1).max(100)).max(20).optional().nullable(),
  serie:         z.string().trim().max(100).optional().nullable(),
  orden_lectura: z.coerce.number().int().positive().optional().nullable(),
  ...fileUploadShape,
  ...coverUploadShape,
});

const reviewBibliotecaSchema = z.object({
  action:      z.enum(REVIEW_ACTIONS, { error: 'Acción de revisión inválida' }),
  observation: z.string().trim().max(2000, 'Observación máximo 2000 caracteres').optional(),
});

module.exports = { createBibliotecaSchema, updateBibliotecaSchema, reviewBibliotecaSchema };
