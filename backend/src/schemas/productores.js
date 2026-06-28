const { z } = require('../middlewares/validate');

const imageUploadShape = {
  imagen_base64: z.string().max(7_000_000, 'Imagen demasiado grande').optional(),
  imagen_nombre: z.string().trim().max(255).optional(),
  imagen_url:    z.string().max(1000).optional().nullable(),
};

const createProductorSchema = z.object({
  nombre:            z.string({ required_error: 'nombre es requerido' }).trim().min(1, 'nombre es requerido').max(200, 'Nombre demasiado largo'),
  descripcion:       z.string().max(2000, 'Descripción máximo 2000 caracteres').optional().nullable(),
  comunidad:         z.string().trim().max(200).optional().nullable(),
  rol:               z.string().trim().max(100).optional().nullable(),
  anios_experiencia: z.coerce.number().int().min(0, 'Años de experiencia no puede ser negativo').max(100).optional().nullable(),
  activo:            z.boolean().optional(),
  destacado:         z.boolean().optional(),
  ...imageUploadShape,
});

const updateProductorSchema = z.object({
  nombre:            z.string().trim().min(1).max(200).optional(),
  descripcion:       z.string().max(2000).optional().nullable(),
  comunidad:         z.string().trim().max(200).optional().nullable(),
  rol:               z.string().trim().max(100).optional().nullable(),
  anios_experiencia: z.coerce.number().int().min(0).max(100).optional().nullable(),
  activo:            z.boolean().optional(),
  destacado:         z.boolean().optional(),
  ...imageUploadShape,
});

module.exports = { createProductorSchema, updateProductorSchema };
