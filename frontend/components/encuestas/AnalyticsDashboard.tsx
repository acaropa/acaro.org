'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { encuestasApi, type EncuestaPregunta, type RespuestaEncuesta, type EncuestaFull } from '@/lib/encuestas'
import {
  buildDashboardMetrics, buildDailySeries, buildEventSuggestions,
  buildAllQuestionAnalytics, exportToExcelHtml, formatQuestionType,
  type QuestionAnalytics,
} from '@/lib/dashboardAnalytics'
import { useAuth } from '@/context/AuthContext'
import { PERMISSIONS } from '@/lib/permissions'
// Modal removed — responses shown inline at bottom

type ChartType = 'barras' | 'pastel' | 'dona'
const chartPalette = ['#2b1710', '#c28a3a', '#2f5d3a', '#8b6a4f', '#d7a24a', '#5a3424']

interface Props { encuestaId: number }

export function AnalyticsDashboard({ encuestaId }: Props) {
  const { can } = useAuth()
  const canExport = can(PERMISSIONS.ENCUESTAS_RESULTS_EXPORT)
  const canDeleteResp = can(PERMISSIONS.ENCUESTAS_RESULTS_DELETE)

  const [encuesta, setEncuesta] = useState<EncuestaFull | null>(null)
  const [responses, setResponses] = useState<RespuestaEncuesta[]>([])
  const [loading, setLoading] = useState(true)
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [exporting, setExporting] = useState(false)
  const [copied, setCopied] = useState(false)

  const [selectedQIds, setSelectedQIds] = useState<number[]>([])
  const [chartTypes, setChartTypes] = useState<Record<number, ChartType>>({})
  const [respPage, setRespPage] = useState(0)

  const copyLink = () => {
    if (!encuesta) return
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://acaro.org'
    navigator.clipboard.writeText(`${origin}/encuestas/responder?slug=${encuesta.slug}`).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [enc, resp] = await Promise.all([
        encuestasApi.getById(encuestaId),
        encuestasApi.getResults(encuestaId, { fechaInicio: fechaInicio || undefined, fechaFin: fechaFin || undefined }),
      ])
      setEncuesta(enc)
      setResponses(resp)
    } catch { /* empty */ } finally { setLoading(false) }
  }, [encuestaId, fechaInicio, fechaFin])

  useEffect(() => { void load() }, [load])

  const questions: EncuestaPregunta[] = encuesta?.preguntas ?? []
  const metrics = useMemo(() => buildDashboardMetrics(responses, questions), [responses, questions])
  const dailySeries = useMemo(() => buildDailySeries(responses), [responses])
  const events = useMemo(() => buildEventSuggestions(responses), [responses])
  const analytics = useMemo(() => buildAllQuestionAnalytics(responses, questions), [responses, questions])

  useEffect(() => {
    if (!questions.length) return
    setSelectedQIds(prev => {
      const valid = prev.filter(id => questions.some(q => q.id === id))
      return valid.length ? valid : questions.slice(0, 3).map(q => q.id)
    })
    setChartTypes(prev => {
      const next = { ...prev }
      questions.forEach(q => { if (!next[q.id]) next[q.id] = 'barras' })
      return next
    })
  }, [questions])

  const selectedCards = useMemo(
    () => analytics.filter(c => selectedQIds.includes(c.question.id)),
    [analytics, selectedQIds]
  )

  const toggleQ = (id: number) =>
    setSelectedQIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  const handleExport = async () => {
    if (!encuesta) return
    setExporting(true)
    try { exportToExcelHtml(encuesta.titulo, encuesta.estado, questions, responses) }
    finally { setExporting(false) }
  }

  const handleDeleteResponse = async (id: number) => {
    if (!confirm('¿Eliminar esta respuesta?')) return
    try { await encuestasApi.deleteResponse(id); setResponses(prev => prev.filter(r => r.id !== id)) }
    catch { /* empty */ }
  }

  if (loading) return <p className="py-12 text-center text-sm text-[#765e50]">Cargando resultados...</p>
  if (!encuesta) return <p className="py-12 text-center text-sm text-red-600">Encuesta no encontrada.</p>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2b1710]">{encuesta.titulo}</h1>
          <p className="text-sm text-[#765e50]">Resultados y analítica</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {encuesta.estado === 'publicada' && (
            <button onClick={copyLink} className="inline-flex items-center gap-2 rounded-lg border border-[#d8cabb] px-3 py-2 text-sm font-semibold text-[#5a3424] hover:bg-[#fbf7f0]">
              <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'link'}</span>
              {copied ? 'Copiado' : 'Copiar enlace'}
            </button>
          )}
          <Link href={`/admin/encuestas/editar?id=${encuestaId}`} className="rounded-lg border border-[#d8cabb] px-3 py-2 text-sm font-semibold text-[#5a3424] hover:bg-[#fbf7f0]">Editar</Link>
          {canExport && (
            <button onClick={handleExport} disabled={exporting || !responses.length} className="rounded-lg bg-[#2b1710] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d2318] disabled:opacity-50">
              {exporting ? 'Exportando...' : 'Exportar Excel'}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="rounded-lg border border-[#d8cabb] px-3 py-2 text-sm text-[#2b1710]" />
        <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="rounded-lg border border-[#d8cabb] px-3 py-2 text-sm text-[#2b1710]" />
        <button onClick={() => { setFechaInicio(''); setFechaFin('') }} className="rounded-lg border border-[#d8cabb] px-3 py-2 text-sm text-[#5a3424] hover:bg-[#fbf7f0]">Limpiar</button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Respuestas" value={metrics.totalResponses} />
        <MetricCard label="Días activos" value={metrics.activeDays} />
        <MetricCard label="Encuestas" value={metrics.uniqueSurveys} />
        <MetricCard label="Última respuesta" value={metrics.latestResponse} />
      </div>

      {/* Activity chart */}
      {dailySeries.length > 0 && (
        <div className="rounded-xl border border-[#d8cabb] bg-white p-5">
          <h3 className="mb-3 text-sm font-bold text-[#2b1710]">Actividad por fecha</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySeries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ede6db" vertical={false} />
                <XAxis dataKey="etiqueta" tick={{ fill: '#765e50', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#765e50', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#d8cabb', color: '#2b1710' }} />
                <Bar dataKey="total" fill="#2b1710" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detected peaks */}
      {events.length > 0 && (
        <div className="rounded-xl border border-[#d8cabb] bg-white p-5">
          <h3 className="mb-3 text-sm font-bold text-[#2b1710]">Picos detectados</h3>
          <div className="divide-y divide-[#ede6db]">
            {events.map(ev => (
              <div key={ev.fecha} className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-[#2b1710]">{ev.fecha}</span>
                <span className="text-xs text-[#765e50]">{ev.total} — {ev.motivo}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ QUESTION ANALYSIS (with sidebar filter) ═══ */}
      <div className="rounded-xl border border-[#d8cabb] bg-white overflow-hidden">
        <div className="border-b border-[#ede6db] px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a08c7a]">Preguntas</p>
            <h3 className="text-lg font-bold text-[#2b1710]">Análisis por pregunta</h3>
          </div>
          <span className="text-sm text-[#765e50]">
            {selectedQIds.length} pregunta{selectedQIds.length !== 1 ? 's' : ''} seleccionada{selectedQIds.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid xl:grid-cols-[280px,1fr]">
          {/* ── Sidebar: question filter ── */}
          <aside className="border-b border-[#ede6db] bg-[#fbf7f0] p-5 xl:border-b-0 xl:border-r">
            <div className="flex items-center gap-2 text-sm font-bold text-[#2b1710]">
              <span className="material-symbols-outlined text-[16px] text-[#c28a3a]">filter_list</span>
              Filtrar Preguntas
            </div>
            <p className="mt-2 text-xs text-[#765e50]">Selecciona las preguntas que deseas incluir en el análisis.</p>

            <div className="mt-4 flex gap-2">
              <button onClick={() => setSelectedQIds(questions.map(q => q.id))}
                className="flex-1 rounded-lg border border-[#d8cabb] px-3 py-1.5 text-xs font-semibold text-[#5a3424] hover:bg-[#f0e8dd]">
                Todas
              </button>
              <button onClick={() => setSelectedQIds([])}
                className="flex-1 rounded-lg border border-[#d8cabb] px-3 py-1.5 text-xs font-semibold text-[#5a3424] hover:bg-[#f0e8dd]">
                Ninguna
              </button>
            </div>

            <div className="mt-4 space-y-1 max-h-[400px] overflow-y-auto">
              {questions.map(q => {
                const checked = selectedQIds.includes(q.id)
                return (
                  <label key={q.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                      checked ? 'bg-[#2b1710]/5' : 'hover:bg-[#f0e8dd]'
                    }`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleQ(q.id)}
                      className="mt-0.5 h-4 w-4 rounded border-[#d8cabb] text-[#2b1710] accent-[#2b1710]" />
                    <div className="min-w-0">
                      <p className={`text-sm font-medium leading-tight ${checked ? 'text-[#2b1710]' : 'text-[#765e50]'}`}>
                        {q.texto_pregunta}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-[#a08c7a]">
                        {formatQuestionType(q.tipo_pregunta)}
                      </p>
                    </div>
                  </label>
                )
              })}
            </div>
          </aside>

          {/* ── Main: selected question cards ── */}
          <div className="p-5 space-y-6">
            {selectedCards.length ? selectedCards.map(card => (
              <QuestionInsightsCard
                key={card.question.id}
                data={card}
                chartType={chartTypes[card.question.id] ?? 'barras'}
                onChartTypeChange={t => setChartTypes(prev => ({ ...prev, [card.question.id]: t }))}
                onDeleteResponse={canDeleteResp ? handleDeleteResponse : undefined}
              />
            )) : (
              <div className="py-12 text-center text-sm text-[#765e50] border border-dashed border-[#d8cabb] rounded-xl">
                Selecciona una o más preguntas en el panel lateral para ver su análisis.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ RESPONSE LIST (single list at the bottom) ═══ */}
      {responses.length > 0 && (
        <ResponseList
          responses={responses}
          questions={questions}
          canDelete={canDeleteResp}
          onDelete={handleDeleteResponse}
        />
      )}
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-[#d8cabb] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#765e50]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#2b1710]">{value}</p>
    </div>
  )
}

function QuestionInsightsCard({
  data, chartType, onChartTypeChange,
}: {
  data: QuestionAnalytics
  chartType: ChartType
  onChartTypeChange: (t: ChartType) => void
  onDeleteResponse?: (id: number) => void
}) {
  const isChartable = ['opcion_unica', 'opcion_multiple', 'booleano'].includes(data.question.tipo_pregunta)

  return (
    <div className="rounded-xl border border-[#d8cabb] bg-white overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#ede6db] px-5 py-4 bg-[#fbf7f0]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#f0e8dd] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#5a3424]">
                {formatQuestionType(data.question.tipo_pregunta)}
              </span>
              {data.question.es_obligatoria && (
                <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600 border border-red-200">
                  Obligatoria
                </span>
              )}
            </div>
            <h4 className="mt-3 text-lg font-bold leading-tight text-[#2b1710]">{data.question.texto_pregunta}</h4>
          </div>
          {isChartable && (
            <select
              value={chartType}
              onChange={e => onChartTypeChange(e.target.value as ChartType)}
              className="h-9 rounded-lg border border-[#d8cabb] bg-white px-3 text-sm text-[#2b1710] max-w-[200px]"
            >
              <option value="barras">Gráfico de barras</option>
              <option value="pastel">Gráfico pastel</option>
              <option value="dona">Gráfico dona</option>
            </select>
          )}
        </div>
      </div>

      <div>
        <div className="px-5 py-5">
          <div className="grid gap-2 sm:grid-cols-3 mb-5">
            <MiniStat label="Personas" value={data.uniqueRespondents} />
            <MiniStat label="Registros" value={data.totalAnswered} />
            <MiniStat label={isChartable ? 'Categorías' : 'Respuestas únicas'} value={data.distribution.length} />
          </div>

          {isChartable ? (
            <>
              <div className="h-[220px]">
                {data.distribution.length ? (
                  chartType === 'barras' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.distribution} layout="vertical" margin={{ left: 8, right: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ede6db" horizontal={false} />
                        <XAxis type="number" tick={{ fill: '#765e50', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <YAxis type="category" dataKey="etiquetaCorta" width={140} tick={{ fill: '#765e50', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={v => [v, 'Registros']} labelFormatter={(_, p) => p?.[0]?.payload?.etiqueta ?? ''} contentStyle={{ backgroundColor: '#fff', borderColor: '#d8cabb', color: '#2b1710' }} />
                        <Bar dataKey="valor" radius={[0, 6, 6, 0]}>
                          {data.distribution.map((_, i) => <Cell key={i} fill={chartPalette[i % chartPalette.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.distribution} dataKey="valor" nameKey="etiqueta"
                          innerRadius={chartType === 'dona' ? 52 : 0} outerRadius={78} paddingAngle={2}>
                          {data.distribution.map((_, i) => <Cell key={i} fill={chartPalette[i % chartPalette.length]} />)}
                        </Pie>
                        <Tooltip formatter={v => [v, 'Registros']} contentStyle={{ backgroundColor: '#fff', borderColor: '#d8cabb', color: '#2b1710' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[#a08c7a] border border-dashed border-[#d8cabb] rounded-lg">
                    Sin respuestas.
                  </div>
                )}
              </div>

              {data.distribution.length > 0 && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {data.distribution.slice(0, 6).map((item, i) => (
                    <div key={item.etiqueta} className="flex items-center justify-between rounded-lg border border-[#ede6db] bg-white px-3 py-2 text-sm text-[#765e50]">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: chartPalette[i % chartPalette.length] }} />
                        <span className="truncate">{item.etiqueta}</span>
                      </div>
                      <span className="font-semibold text-[#2b1710]">{item.valor}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Text/number/date questions: show a table instead of chart */
            <div className="max-h-[340px] overflow-y-auto">
              {data.respondentItems.length ? (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[#fbf7f0]">
                    <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-[#a08c7a]">
                      <th className="px-3 py-2">Respondente</th>
                      <th className="px-3 py-2">Respuesta</th>
                      <th className="px-3 py-2">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ede6db]">
                    {data.respondentItems.map(item => (
                      <tr key={item.responseId} className="hover:bg-[#fbf7f0]">
                        <td className="px-3 py-2.5 font-medium text-[#2b1710] max-w-[140px] truncate">{item.respondentName}</td>
                        <td className="px-3 py-2.5 text-[#5a3424] max-w-[200px] truncate">{item.answerPreview}</td>
                        <td className="px-3 py-2.5 text-xs text-[#a08c7a] whitespace-nowrap">{item.fecha}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex h-[120px] items-center justify-center text-sm text-[#a08c7a] border border-dashed border-[#d8cabb] rounded-lg">
                  Sin respuestas.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[#ede6db] bg-[#fbf7f0] px-4 py-3">
      <p className="text-lg font-bold text-[#2b1710]">{value}</p>
      <p className="text-xs text-[#765e50]">{label}</p>
    </div>
  )
}

const RESP_PAGE_SIZE = 15

function ResponseList({
  responses, questions, canDelete, onDelete,
}: {
  responses: RespuestaEncuesta[]
  questions: EncuestaPregunta[]
  canDelete: boolean
  onDelete: (id: number) => void
}) {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return responses
    const q = search.toLowerCase()
    return responses.filter(r =>
      (r.respondente_nombre ?? '').toLowerCase().includes(q) ||
      (r.respondente_email ?? '').toLowerCase().includes(q)
    )
  }, [responses, search])

  const totalPages = Math.ceil(filtered.length / RESP_PAGE_SIZE)
  const visible = filtered.slice(page * RESP_PAGE_SIZE, (page + 1) * RESP_PAGE_SIZE)

  const firstTextQ = questions.find(q => q.tipo_pregunta === 'texto_corto')

  return (
    <div className="rounded-xl border border-[#d8cabb] bg-white overflow-hidden">
      <div className="border-b border-[#ede6db] px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a08c7a]">Registros</p>
          <h3 className="text-lg font-bold text-[#2b1710]">Respuestas individuales ({responses.length})</h3>
        </div>
        <input
          type="text"
          placeholder="Buscar respondente..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          className="h-9 rounded-lg border border-[#d8cabb] bg-white px-3 text-sm text-[#2b1710] focus:outline-none focus:ring-2 focus:ring-[#a66f2e]/30 sm:w-56"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#fbf7f0] text-left text-[10px] font-bold uppercase tracking-wider text-[#a08c7a]">
            <tr>
              <th className="px-5 py-3">Respondente</th>
              <th className="px-5 py-3 hidden md:table-cell">Respuesta destacada</th>
              <th className="px-5 py-3">Fecha</th>
              {canDelete && <th className="px-5 py-3 w-12" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ede6db]">
            {visible.map(r => {
              const preview = firstTextQ
                ? r.respuestas_detalle?.find(d => d.pregunta_id === firstTextQ.id)?.respuesta_texto ?? ''
                : ''
              return (
                <tr key={r.id} className="hover:bg-[#fbf7f0] transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-[#2b1710]">
                      {r.respondente_nombre || r.respondente_email || `Anónimo #${r.id}`}
                    </p>
                    {r.respondente_email && r.respondente_nombre && (
                      <p className="text-xs text-[#a08c7a]">{r.respondente_email}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-[#5a3424] max-w-[250px] truncate hidden md:table-cell">
                    {preview.length > 50 ? preview.slice(0, 50) + '...' : preview || '—'}
                  </td>
                  <td className="px-5 py-3 text-xs text-[#a08c7a] whitespace-nowrap">
                    {r.fecha_respuesta ? new Intl.DateTimeFormat('es', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(r.fecha_respuesta)) : ''}
                  </td>
                  {canDelete && (
                    <td className="px-5 py-3">
                      <button onClick={() => onDelete(r.id)}
                        className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#ede6db] px-5 py-3">
          <p className="text-xs text-[#a08c7a]">
            Mostrando {page * RESP_PAGE_SIZE + 1}–{Math.min((page + 1) * RESP_PAGE_SIZE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex gap-1">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              className="rounded-lg border border-[#d8cabb] px-3 py-1 text-xs font-semibold text-[#5a3424] hover:bg-[#f0e8dd] disabled:opacity-30">
              Anterior
            </button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
              className="rounded-lg border border-[#d8cabb] px-3 py-1 text-xs font-semibold text-[#5a3424] hover:bg-[#f0e8dd] disabled:opacity-30">
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
