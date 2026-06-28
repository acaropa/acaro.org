const { z } = require('../middlewares/validate');

const ESTADOS = ['borrador', 'publicada', 'cerrada', 'archivada'];
const VISIBILIDADES = ['publica', 'enlace_privado', 'interna'];
const TIPOS_PREGUNTA = ['texto_corto', 'texto_largo', 'numero', 'booleano', 'opcion_unica', 'opcion_multiple', 'fecha'];

const seccionShape = z.object({
  id:          z.coerce.number().int().positive().optional(),
  titulo:      z.string().trim().min(1).max(255),
  descripcion: z.string().max(2000).optional().nullable(),
  posicion:    z.coerce.number().int().min(0).optional(),
});

const preguntaShape = z.object({
  id:                z.coerce.number().int().positive().optional(),
  seccion_id:        z.coerce.number().int().positive().optional().nullable(),
  codigo_pregunta:   z.string().max(50).optional().nullable(),
  texto_pregunta:    z.string().trim().min(1, 'El texto de la pregunta es requerido').max(1000),
  tipo_pregunta:     z.enum(TIPOS_PREGUNTA, { error: 'Tipo de pregunta inválido' }),
  es_obligatoria:    z.boolean().optional(),
  texto_ayuda:       z.string().max(2000).optional().nullable(),
  posicion:          z.coerce.number().int().min(0).optional(),
  reglas_validacion: z.record(z.string(), z.unknown()).optional().nullable(),
  opciones: z.array(z.object({
    id:                  z.coerce.number().int().positive().optional(),
    valor_opcion:        z.string().trim().min(1).max(500),
    etiqueta_opcion:     z.string().trim().min(1).max(500),
    permite_texto_libre: z.boolean().optional(),
    posicion:            z.coerce.number().int().min(0).optional(),
  })).max(50, 'Máximo 50 opciones por pregunta').optional(),
});

const createEncuestaSchema = z.object({
  titulo:               z.string({ required_error: 'El título es requerido' }).trim().min(1, 'El título es requerido').max(255),
  descripcion:          z.string().max(2000).optional().nullable(),
  estado:               z.enum(ESTADOS).optional(),
  visibilidad:          z.enum(VISIBILIDADES).optional(),
  requiere_login:       z.boolean().optional(),
  permite_anonimo:      z.boolean().optional(),
  una_respuesta_por_ip: z.boolean().optional(),
  fecha_cierre:         z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  mensaje_confirmacion: z.string().max(1000).optional().nullable(),
});

const updateEncuestaSchema = z.object({
  titulo:               z.string().trim().min(1).max(255).optional(),
  descripcion:          z.string().max(2000).optional().nullable(),
  visibilidad:          z.enum(VISIBILIDADES).optional(),
  requiere_login:       z.boolean().optional(),
  permite_anonimo:      z.boolean().optional(),
  una_respuesta_por_ip: z.boolean().optional(),
  fecha_cierre:         z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  mensaje_confirmacion: z.string().max(1000).optional().nullable(),
});

const changeEstadoSchema = z.object({
  estado: z.enum(ESTADOS, { error: `Estado inválido. Debe ser uno de: ${ESTADOS.join(', ')}` }),
});

const saveStructureSchema = z.object({
  secciones: z.array(seccionShape).max(20, 'Máximo 20 secciones').optional(),
  preguntas: z.array(preguntaShape).max(100, 'Máximo 100 preguntas').optional(),
});

const respuestaItemSchema = z.object({
  pregunta_id: z.coerce.number({ required_error: 'pregunta_id es requerido' }).int().positive(),
  valor:       z.union([z.string().max(5000), z.number(), z.boolean(), z.array(z.string().max(500)).max(50)]).optional().nullable(),
  texto:       z.string().max(5000).optional().nullable(),
  opcion_ids:  z.array(z.coerce.number().int().positive()).max(50).optional(),
});

const submitResponseSchema = z.object({
  respuestas:    z.array(respuestaItemSchema, { required_error: 'Las respuestas son requeridas' }).min(1, 'Al menos una respuesta es requerida').max(200, 'Demasiadas respuestas'),
  token_acceso:  z.string().max(500).optional().nullable(),
});

module.exports = {
  createEncuestaSchema,
  updateEncuestaSchema,
  changeEstadoSchema,
  saveStructureSchema,
  submitResponseSchema,
};
