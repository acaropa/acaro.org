const { z } = require('../middlewares/validate');

const imageUploadShape = {
  imagen_base64: z.string().max(7_000_000, 'Imagen demasiado grande').optional(),
  imagen_nombre: z.string().trim().max(255).optional(),
  imagen_url:    z.string().max(1000).optional().nullable(),
};

const galleryUploadShape = {
  imagenes_base64: z.array(z.object({
    base64: z.string().max(7_000_000, 'Imagen de galería demasiado grande'),
    fileName: z.string().trim().min(1).max(255),
  })).max(8, 'Máximo 8 imágenes de galería').optional(),
  imagenes: z.union([
    z.array(z.string().max(1000)).max(8),
    z.string().max(10_000),
  ]).optional().nullable(),
};

const createProductorSchema = z.object({
  nombre:            z.string({ required_error: 'nombre es requerido' }).trim().min(1, 'nombre es requerido').max(200, 'Nombre demasiado largo'),
  descripcion:       z.string().max(2000, 'Descripción máximo 2000 caracteres').optional().nullable(),
  frase_corta:       z.string().trim().max(180, 'Frase corta máximo 180 caracteres').optional().nullable(),
  comunidad:         z.string().trim().max(200).optional().nullable(),
  rol:               z.string().trim().max(100).optional().nullable(),
  anios_experiencia: z.coerce.number().int().min(0, 'Años de experiencia no puede ser negativo').max(100).optional().nullable(),
  distrito_id:       z.coerce.number().int().positive().optional().nullable(),
  activo:            z.boolean().optional(),
  destacado:         z.boolean().optional(),
  ...imageUploadShape,
  ...galleryUploadShape,
});

const updateProductorSchema = z.object({
  nombre:            z.string().trim().min(1).max(200).optional(),
  descripcion:       z.string().max(2000).optional().nullable(),
  frase_corta:       z.string().trim().max(180).optional().nullable(),
  comunidad:         z.string().trim().max(200).optional().nullable(),
  rol:               z.string().trim().max(100).optional().nullable(),
  anios_experiencia: z.coerce.number().int().min(0).max(100).optional().nullable(),
  distrito_id:       z.coerce.number().int().positive().optional().nullable(),
  activo:            z.boolean().optional(),
  destacado:         z.boolean().optional(),
  ...imageUploadShape,
  ...galleryUploadShape,
});

module.exports = { createProductorSchema, updateProductorSchema };
