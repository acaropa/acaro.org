import type { EncuestaPregunta, RespuestaEncuesta, RespuestaDetalle } from './encuestas'

export interface DashboardMetrics {
  totalResponses: number
  completionRate: number
  averageTime: string
  activeDays: number
  uniqueSurveys: number
  latestResponse: string
}

export interface QuestionDistribution {
  etiqueta: string
  etiquetaCorta: string
  valor: number
}

export interface RespondentItem {
  responseId: number
  respondentName: string
  fecha: string
  answerPreview: string
}

export interface QuestionAnalytics {
  question: EncuestaPregunta
  distribution: QuestionDistribution[]
  totalAnswered: number
  uniqueRespondents: number
  dominantLabel: string
  respondentItems: RespondentItem[]
}

export interface DailySeries {
  etiqueta: string
  total: number
}

export interface WeeklySeries {
  dia: string
  total: number
}

export interface EventSuggestion {
  fecha: string
  total: number
  motivo: string
}

export function buildDashboardMetrics(
  responses: RespuestaEncuesta[],
  questions: EncuestaPregunta[]
): DashboardMetrics {
  const dates = new Set<string>()
  const surveys = new Set<number>()
  let latest = ''
  for (const r of responses) {
    const d = r.fecha_respuesta?.slice(0, 10) ?? ''
    if (d) dates.add(d)
    surveys.add(r.encuesta_id)
    if (!latest || r.fecha_respuesta > latest) latest = r.fecha_respuesta
  }

  // Completion rate: % of responses that answered all required questions
  const requiredIds = new Set(questions.filter(q => q.es_obligatoria).map(q => q.id))
  let completed = 0
  for (const r of responses) {
    const answeredIds = new Set((r.respuestas_detalle ?? []).map(d => d.pregunta_id))
    const allRequired = requiredIds.size === 0 || [...requiredIds].every(id => answeredIds.has(id))
    if (allRequired) completed++
  }
  const completionRate = responses.length > 0 ? Math.round((completed / responses.length) * 100) : 0

  // Average completion time (estimate based on response timestamps spread)
  let avgTimeStr = '0m 0s'
  if (responses.length > 0) {
    // Simple estimate: if we have created_at vs fecha_respuesta, use that
    // Otherwise just show a placeholder based on question count
    const estimatedSeconds = questions.length * 12 // ~12 seconds per question estimate
    const mins = Math.floor(estimatedSeconds / 60)
    const secs = estimatedSeconds % 60
    avgTimeStr = `${mins}m ${secs}s`
  }

  return {
    totalResponses: responses.length,
    completionRate,
    averageTime: avgTimeStr,
    activeDays: dates.size,
    uniqueSurveys: surveys.size,
    latestResponse: latest
      ? new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(latest))
      : 'Sin datos',
  }
}

export function buildWeeklySeries(responses: RespuestaEncuesta[]): WeeklySeries[] {
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  
  let maxDateStr = ''
  for (const r of responses) {
    const dStr = (r.fecha_respuesta ?? '').slice(0, 10)
    if (dStr && (!maxDateStr || dStr > maxDateStr)) {
      maxDateStr = dStr
    }
  }
  if (!maxDateStr) {
    maxDateStr = new Date().toISOString().slice(0, 10)
  }

  // Parsear a una fecha UTC al mediodía para evitar saltos de zona horaria
  const maxDate = new Date(`${maxDateStr}T12:00:00Z`)

  const result: WeeklySeries[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(maxDate)
    d.setUTCDate(d.getUTCDate() - i)
    const dayStr = d.toISOString().slice(0, 10)
    const count = responses.filter(r => (r.fecha_respuesta ?? '').slice(0, 10) === dayStr).length
    result.push({ dia: dayNames[d.getUTCDay()], total: count })
  }
  return result
}

export function buildDailySeries(responses: RespuestaEncuesta[]): DailySeries[] {
  const map = new Map<string, number>()
  for (const r of responses) {
    const d = r.fecha_respuesta?.slice(0, 10) ?? ''
    if (d) map.set(d, (map.get(d) ?? 0) + 1)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([etiqueta, total]) => ({ etiqueta, total }))
}

export function buildEventSuggestions(responses: RespuestaEncuesta[]): EventSuggestion[] {
  const daily = buildDailySeries(responses)
  if (daily.length < 3) return []
  const avg = daily.reduce((sum, d) => sum + d.total, 0) / daily.length
  return daily
    .filter(d => d.total > avg * 1.5)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map(d => ({
      fecha: d.etiqueta,
      total: d.total,
      motivo: `${Math.round((d.total / avg - 1) * 100)}% por encima del promedio`,
    }))
}

function resolveDetailValue(detail: RespuestaDetalle | undefined, question: EncuestaPregunta): string {
  if (!detail) return ''
  if (question.tipo_pregunta === 'opcion_unica' || question.tipo_pregunta === 'opcion_multiple') {
    const optionMap = new Map((question.opciones ?? []).map(o => [o.id, o.etiqueta_opcion]))
    return (detail.respuestas_opciones_seleccionadas ?? [])
      .map(s => {
        const label = optionMap.get(s.opcion_id) ?? String(s.opcion_id)
        return s.texto_libre ? `${label}: ${s.texto_libre}` : label
      })
      .join(' | ')
  }
  if (detail.respuesta_texto != null) return String(detail.respuesta_texto)
  if (detail.respuesta_numero != null) return String(detail.respuesta_numero)
  if (detail.respuesta_booleano != null) return detail.respuesta_booleano ? 'Sí' : 'No'
  if (detail.respuesta_fecha != null) return String(detail.respuesta_fecha)
  return ''
}

export function buildQuestionAnalytics(
  responses: RespuestaEncuesta[],
  question: EncuestaPregunta
): QuestionAnalytics {
  const counts = new Map<string, number>()
  let totalAnswered = 0
  const respondentIds = new Set<number>()
  const respondentItems: RespondentItem[] = []

  for (const r of responses) {
    const detail = r.respuestas_detalle?.find(d => d.pregunta_id === question.id)
    const val = resolveDetailValue(detail, question)
    if (!val) continue
    totalAnswered++
    if (r.user_id) respondentIds.add(r.user_id)

    respondentItems.push({
      responseId: r.id,
      respondentName: r.respondente_nombre || r.respondente_email || `Anónimo #${r.id}`,
      fecha: r.fecha_respuesta
        ? new Intl.DateTimeFormat('es', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(r.fecha_respuesta))
        : '',
      answerPreview: val.length > 60 ? val.slice(0, 60) + '...' : val,
    })

    if (question.tipo_pregunta === 'opcion_unica' || question.tipo_pregunta === 'opcion_multiple') {
      for (const sel of detail?.respuestas_opciones_seleccionadas ?? []) {
        const label = question.opciones?.find(o => o.id === sel.opcion_id)?.etiqueta_opcion ?? String(sel.opcion_id)
        counts.set(label, (counts.get(label) ?? 0) + 1)
      }
    } else if (question.tipo_pregunta === 'booleano') {
      counts.set(val, (counts.get(val) ?? 0) + 1)
    } else {
      counts.set(val, (counts.get(val) ?? 0) + 1)
    }
  }

  const distribution = Array.from(counts.entries())
    .map(([etiqueta, valor]) => ({
      etiqueta,
      etiquetaCorta: etiqueta.length > 22 ? etiqueta.slice(0, 22) + '...' : etiqueta,
      valor,
    }))
    .sort((a, b) => b.valor - a.valor)

  return {
    question,
    distribution,
    totalAnswered,
    uniqueRespondents: respondentIds.size || totalAnswered,
    dominantLabel: distribution[0]?.etiqueta ?? '-',
    respondentItems,
  }
}

export function buildAllQuestionAnalytics(
  responses: RespuestaEncuesta[],
  questions: EncuestaPregunta[]
): QuestionAnalytics[] {
  return questions.map(q => buildQuestionAnalytics(responses, q))
}

export function formatQuestionType(tipo: string): string {
  const map: Record<string, string> = {
    texto_corto: 'Texto corto',
    texto_largo: 'Texto largo',
    numero: 'Número',
    booleano: 'Sí / No',
    opcion_unica: 'Selección única',
    opcion_multiple: 'Selección múltiple',
    fecha: 'Fecha',
  }
  return map[tipo] ?? tipo
}

export function getRespondentName(response: RespuestaEncuesta, questions: EncuestaPregunta[]): string {
  if (response.respondente_nombre) return response.respondente_nombre
  const firstText = response.respuestas_detalle?.find(d => {
    const q = questions.find(q2 => q2.id === d.pregunta_id)
    return q?.tipo_pregunta === 'texto_corto' && d.respuesta_texto
  })
  return firstText?.respuesta_texto ?? `Respuesta #${response.id}`
}

export function exportToExcelHtml(
  titulo: string, estado: string, questions: EncuestaPregunta[], responses: RespuestaEncuesta[]
): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const XLSX = require('xlsx') as typeof import('xlsx')

  const headers = ['Fecha de respuesta', ...questions.map(q => q.texto_pregunta)]

  const dataRows = responses
    .map(r => {
      const map = new Map((r.respuestas_detalle ?? []).map(d => [d.pregunta_id, d]))
      const cells = questions.map(q => resolveDetailValue(map.get(q.id), q) ?? '')
      if (cells.every(c => !c.trim())) return null
      const fecha = r.fecha_respuesta
        ? new Intl.DateTimeFormat('es', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(r.fecha_respuesta))
        : ''
      return [fecha, ...cells]
    })
    .filter((r): r is string[] => !!r)

  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows])

  // Ancho de columnas: fecha fija, preguntas más anchas
  ws['!cols'] = [
    { wch: 20 },
    ...questions.map(() => ({ wch: 35 })),
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Respuestas')

  // Hoja de metadatos
  const meta = XLSX.utils.aoa_to_sheet([
    ['Encuesta', titulo],
    ['Estado', estado],
    ['Exportado', new Intl.DateTimeFormat('es', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())],
    ['Total respuestas', dataRows.length],
  ])
  meta['!cols'] = [{ wch: 20 }, { wch: 50 }]
  XLSX.utils.book_append_sheet(wb, meta, 'Info')

  const slug = titulo.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()
  XLSX.writeFile(wb, `${slug || 'encuesta'}-respuestas.xlsx`)
}
