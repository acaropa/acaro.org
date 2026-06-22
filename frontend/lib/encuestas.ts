import { api } from './api'

export interface Encuesta {
  id: number
  titulo: string
  slug: string
  descripcion: string | null
  estado: string
  visibilidad: string
  logo_url: string | null
  created_by_user_id: number
  reviewed_by_user_id: number | null
  published_by_user_id: number | null
  fecha_inicio: string | null
  fecha_cierre: string | null
  requiere_login: boolean
  permitir_multiples_respuestas: boolean
  mensaje_confirmacion: string | null
  configuracion_json: unknown
  created_at: string
  updated_at: string
  creado_por_nombre?: string
  creado_por_email?: string
  question_count?: number
  response_count?: number
}

export interface EncuestaSeccion {
  id: number
  encuesta_id: number
  titulo: string | null
  descripcion: string | null
  posicion: number
}

export interface EncuestaPregunta {
  id: number
  encuesta_id: number
  seccion_id: number | null
  codigo_pregunta: string | null
  texto_pregunta: string
  tipo_pregunta: TipoPregunta
  posicion: number
  texto_ayuda: string | null
  reglas_validacion: unknown
  es_obligatoria: boolean
  opciones: EncuestaOpcion[]
}

export type TipoPregunta =
  | 'texto_corto'
  | 'texto_largo'
  | 'numero'
  | 'booleano'
  | 'opcion_unica'
  | 'opcion_multiple'
  | 'fecha'

export interface EncuestaOpcion {
  id: number
  pregunta_id: number
  valor_opcion: string
  etiqueta_opcion: string
  posicion: number
  permite_texto_libre: boolean
}

export interface EncuestaFull extends Encuesta {
  secciones: EncuestaSeccion[]
  preguntas: EncuestaPregunta[]
}

export interface RespuestaOpcionSeleccionada {
  id: number
  respuesta_detalle_id: number
  opcion_id: number
  texto_libre: string | null
}

export interface RespuestaDetalle {
  id: number
  respuesta_encuesta_id: number
  pregunta_id: number
  respuesta_texto: string | null
  respuesta_numero: number | null
  respuesta_booleano: boolean | null
  respuesta_fecha: string | null
  respuestas_opciones_seleccionadas: RespuestaOpcionSeleccionada[]
}

export interface RespuestaEncuesta {
  id: number
  encuesta_id: number
  user_id: number | null
  estado: string
  origen: string
  fecha_respuesta: string
  respondente_nombre: string | null
  respondente_email: string | null
  respuestas_detalle: RespuestaDetalle[]
}

export const encuestasApi = {
  list: () => api.get<Encuesta[]>('/encuestas'),
  getById: (id: number) => api.get<EncuestaFull>(`/encuestas/${id}`),
  create: (data: Partial<Encuesta>) => api.post<Encuesta>('/encuestas', data),
  update: (id: number, data: Partial<Encuesta>) => api.put<Encuesta>(`/encuestas/${id}`, data),
  saveStructure: (id: number, body: { secciones: unknown[]; preguntas: unknown[] }) =>
    api.put<EncuestaFull>(`/encuestas/${id}/estructura`, body),
  changeEstado: (id: number, estado: string) =>
    api.patch<Encuesta>(`/encuestas/${id}/estado`, { estado }),
  duplicate: (id: number) => api.post<Encuesta>(`/encuestas/${id}/duplicar`, {}),
  remove: (id: number) => api.delete<void>(`/encuestas/${id}`),
  getResults: (id: number, filters?: { fechaInicio?: string; fechaFin?: string }) => {
    const params = new URLSearchParams()
    if (filters?.fechaInicio) params.set('fechaInicio', filters.fechaInicio)
    if (filters?.fechaFin) params.set('fechaFin', filters.fechaFin)
    const qs = params.toString()
    return api.get<RespuestaEncuesta[]>(`/encuestas/${id}/resultados${qs ? `?${qs}` : ''}`)
  },
  deleteResponse: (responseId: number) => api.delete<void>(`/encuestas/respuestas/${responseId}`),
  getPublic: (slug: string) => api.get<EncuestaFull>(`/encuestas/publica/${slug}`),
  submitPublic: (slug: string, body: { respuestas: unknown[]; token_acceso?: string }) =>
    api.post<{ id: number; mensaje_confirmacion: string }>(`/encuestas/publica/${slug}/responder`, body),
}
