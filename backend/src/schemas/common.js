const { z } = require('../middlewares/validate');

// Valida que un parámetro de ruta :id sea un string de número positivo.
// Los controladores que hacen Number(req.params.id) o parseInt() siguen funcionando igual.
const positiveIdString = z
  .string()
  .regex(/^\d+$/, 'El ID debe ser un número entero positivo')
  .refine(s => parseInt(s, 10) > 0, 'El ID debe ser mayor que cero');

const idParamSchema = z.object({ id: positiveIdString });

const slugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'El slug es requerido')
    .max(300, 'Slug demasiado largo')
    .regex(/^[a-z0-9][a-z0-9-]*$/, 'Slug inválido: solo letras minúsculas, números y guiones'),
});

const paginationSchema = z.object({
  page:   z.coerce.number().int().positive().optional(),
  limit:  z.coerce.number().int().min(1, 'Límite mínimo es 1').max(100, 'Límite máximo es 100').optional(),
  search: z.string().trim().max(200, 'Búsqueda demasiado larga').optional(),
  sort:   z.enum(['asc', 'desc']).optional(),
});

const dateRangeSchema = z.object({
  fechaInicio: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  fechaFin:    z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
});

module.exports = { positiveIdString, idParamSchema, slugParamSchema, paginationSchema, dateRangeSchema };
