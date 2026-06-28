const { z } = require('../middlewares/validate');

// Deben coincidir exactamente con el ENUM de la tabla noticias en MySQL
const ESTADOS = ['borrador', 'pendiente', 'publicada', 'archivada'];
const VISIBILIDADES = ['publica', 'interna'];

const imageUploadShape = {
  imagen_base64:  z.string().max(7_000_000, 'Imagen demasiado grande').optional(),
  imagen_nombre:  z.string().trim().max(255, 'Nombre de imagen demasiado largo').optional(),
  imagen_portada: z.string().max(500).optional().nullable(),
};

const secondaryImagesShape = {
  imagenes_base64: z.array(z.object({
    base64:   z.string().max(7_000_000, 'Imagen secundaria demasiado grande'),
    fileName: z.string().trim().min(1).max(255),
  })).max(10, 'Máximo 10 imágenes secundarias').optional(),
  imagenes: z.union([
    z.array(z.string().url().max(500)),
    z.string().max(10_000),
  ]).optional().nullable(),
};

const createNoticiaSchema = z.object({
  titulo:    z.string({ required_error: 'titulo es requerido' }).trim().min(1, 'titulo es requerido').max(255, 'Título demasiado largo'),
  contenido: z.string({ required_error: 'contenido es requerido' }).min(1, 'contenido es requerido').max(100_000, 'Contenido demasiado largo'),
  resumen:   z.string().trim().max(500, 'Resumen máximo 500 caracteres').optional().nullable(),
  estado:    z.enum(ESTADOS).optional(),
  visibilidad: z.enum(VISIBILIDADES).optional(),
  tags:      z.array(z.string().trim().min(1).max(100)).max(20, 'Máximo 20 etiquetas').optional().nullable(),
  serie:     z.string().trim().max(255).optional().nullable(),
  ...imageUploadShape,
  ...secondaryImagesShape,
});

const updateNoticiaSchema = z.object({
  titulo:    z.string().trim().min(1).max(255).optional(),
  contenido: z.string().min(1).max(100_000).optional(),
  resumen:   z.string().trim().max(500).optional().nullable(),
  estado:    z.enum(ESTADOS).optional(),
  visibilidad: z.enum(VISIBILIDADES).optional(),
  tags:      z.array(z.string().trim().min(1).max(100)).max(20).optional().nullable(),
  serie:     z.string().trim().max(255).optional().nullable(),
  ...imageUploadShape,
  ...secondaryImagesShape,
});

module.exports = { createNoticiaSchema, updateNoticiaSchema };
