'use client'


import { AppIcon } from "@/components/ui/AppIcon"
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { encuestasApi, type EncuestaPregunta, type RespuestaEncuesta, type EncuestaFull } from '@/lib/encuestas'
import {
  buildDashboardMetrics, buildDailySeries, buildWeeklySeries, buildEventSuggestions,
  buildAllQuestionAnalytics, exportToExcelHtml, formatQuestionType,
  type QuestionAnalytics,
} from '@/lib/dashboardAnalytics'
import { useAuth } from '@/context/AuthContext'
import { PERMISSIONS } from '@/lib/permissions'
import { LineChart, Line } from 'recharts'
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
  const [exporting, setExporting] = useState(false)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)

  const [selectedQIds, setSelectedQIds] = useState<number[] | 'all' | null>(null)
  const [chartTypes, setChartTypes] = useState<Record<number, ChartType>>({})

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [enc, resp] = await Promise.all([
        encuestasApi.getById(encuestaId),
        encuestasApi.getResults(encuestaId, {}),
      ])
      setEncuesta(enc)
      setResponses(resp)
    } catch { /* empty */ } finally { setLoading(false) }
  }, [encuestaId])

  useEffect(() => { void load() }, [load])

  const questions: EncuestaPregunta[] = encuesta?.preguntas ?? []

  const metrics = useMemo(() => buildDashboardMetrics(responses, questions), [responses, questions])
  const weeklySeries = useMemo(() => buildWeeklySeries(responses), [responses])
  const dailySeries = useMemo(() => buildDailySeries(responses), [responses])
  const analytics = useMemo(() => buildAllQuestionAnalytics(responses, questions), [responses, questions])

  useEffect(() => {
    if (!questions.length) return
    setChartTypes(prev => {
      const next = { ...prev }
      questions.forEach(q => { if (!next[q.id]) next[q.id] = 'barras' })
      return next
    })
  }, [questions])

  const selectedCards = useMemo(() => {
    if (selectedQIds === 'all') return analytics;
    if (Array.isArray(selectedQIds)) {
      return analytics.filter(c => selectedQIds.includes(c.question.id));
    }
    return [];
  }, [analytics, selectedQIds])

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

  if (loading) return <p className="py-12 text-center text-sm text-[#6b7280]">Cargando resultados...</p>
  if (!encuesta) return <p className="py-12 text-center text-sm text-red-600">Encuesta no encontrada.</p>

  const countText = responses.length === 1 ? '1 registro' : `${responses.length} registros`
  const subtitle = `Mostrando ${countText} en total. La mayoría completó todo en menos de ${metrics.averageTime}.`

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="rounded-xl bg-white p-6 border border-[#ede6db] shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#c28a3a] mb-2">RESUMEN DE RESULTADOS</p>
            <h1 className="text-3xl font-bold text-[#2b1710]">{encuesta.titulo}</h1>
            <p className="text-sm text-[#765e50] mt-1">{subtitle}</p>
          </div>
          <div className="flex shrink-0">
            {canExport && (
              <button onClick={handleExport} disabled={exporting || !responses.length} className="flex items-center gap-2 rounded-lg bg-[#2b1710] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#3d2318] disabled:opacity-50 transition-all shadow-sm active:scale-95">
                <AppIcon name="publish" className="text-[18px] rotate-180" />
                {exporting ? 'Exportando...' : 'Exportar datos'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido Principal (siempre análisis) */}
          {/* Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#ede6db] bg-white p-6 shadow-sm flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0e8dd] text-[#2b1710]">
                <AppIcon name="message_square" className="text-[24px]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2b1710]">{metrics.totalResponses}</p>
                <p className="text-xs text-[#765e50] mt-1">Total respuestas</p>
                <p className="text-[10px] text-[#a08c7a] mt-0.5">Histórico completo</p>
              </div>
            </div>
            
            <div className="rounded-xl border border-[#ede6db] bg-white p-6 shadow-sm flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf1ec] text-[#2f5d3a]">
                <AppIcon name="check_circle" className="text-[24px]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2b1710]">{metrics.completionRate}%</p>
                <p className="text-xs text-[#765e50] mt-1">Tasa de completado</p>
                <p className="text-[10px] text-[#a08c7a] mt-0.5">Revisar fricción</p>
              </div>
            </div>
            
            <div className="rounded-xl border border-[#ede6db] bg-white p-6 shadow-sm flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f9f4ee] text-[#c28a3a]">
                <AppIcon name="clock" className="text-[24px]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2b1710]">{metrics.averageTime}</p>
                <p className="text-xs text-[#765e50] mt-1">Tiempo promedio</p>
                <p className="text-[10px] text-[#a08c7a] mt-0.5">Rápido</p>
              </div>
            </div>

            <div className="rounded-xl border border-[#ede6db] bg-white p-6 shadow-sm flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f4ebec] text-[#8b6a4f]">
                <AppIcon name="activity" className="text-[24px]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2b1710]">{metrics.activeDays}</p>
                <p className="text-xs text-[#765e50] mt-1">Días activos</p>
                <p className="text-[10px] text-[#a08c7a] mt-0.5">Actividad general</p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-[#ede6db] bg-white p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#c28a3a] mb-4">ÚLTIMOS 7 DÍAS</p>
              <h3 className="text-lg font-bold text-[#2b1710] mb-6">Respuestas por día</h3>
              <div className="h-[200px]">
                {weeklySeries.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklySeries} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ede6db" vertical={false} />
                      <XAxis dataKey="dia" tick={{ fill: '#765e50', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#765e50', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip cursor={{ fill: '#fdfcfb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="total" fill="#2b1710" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                   <div className="flex h-full items-center justify-center text-sm text-[#a08c7a]">Sin datos suficientes</div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-[#ede6db] bg-white p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#c28a3a] mb-4">TENDENCIA</p>
              <h3 className="text-lg font-bold text-[#2b1710] mb-6">Últimos 14 días</h3>
              <div className="h-[200px]">
                {dailySeries.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailySeries.slice(-14)} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ede6db" vertical={false} />
                      <XAxis dataKey="etiqueta" tick={{ fill: '#765e50', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(val) => val.slice(5).replace('-', '/')} />
                      <YAxis tick={{ fill: '#765e50', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="total" stroke="#2b1710" strokeWidth={3} dot={{ r: 4, fill: '#2b1710', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[#a08c7a]">Sin datos suficientes</div>
                )}
              </div>
            </div>
          </div>

          {/* Analysis Selection / CTA */}
          {selectedQIds === null ? (
            <div className="rounded-xl border border-dashed border-[#d8cabb] bg-[#fdfcfb] p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f0e8dd] text-[#2b1710] mb-4">
                <AppIcon name="bar_chart" className="text-[24px]" />
              </div>
              <h3 className="text-lg font-bold text-[#2b1710]">Panel de Análisis de Datos</h3>
              <p className="text-sm text-[#765e50] mt-2 mb-6 max-w-md mx-auto">
                Seleccione las preguntas específicas que desea evaluar para generar los gráficos y métricas correspondientes de los resultados obtenidos.
              </p>
              <button 
                onClick={() => setShowAnalysisModal(true)}
                className="rounded-lg bg-[#2b1710] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#3d2318] transition-colors"
              >
                Seleccionar Preguntas
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#2b1710]">Análisis de preguntas</h3>
                <button 
                  onClick={() => setShowAnalysisModal(true)}
                  className="text-sm font-medium text-[#c28a3a] hover:text-[#2b1710]"
                >
                  Cambiar selección
                </button>
              </div>
              
              <div className="grid gap-6">
                {selectedCards.map(card => (
                  <QuestionInsightsCard
                    key={card.question.id}
                    data={card}
                    chartType={chartTypes[card.question.id] ?? 'barras'}
                    onChartTypeChange={t => setChartTypes(prev => ({ ...prev, [card.question.id]: t }))}
                  />
                ))}
                {selectedCards.length === 0 && (
                  <p className="text-center text-sm text-[#765e50] py-8">No hay preguntas seleccionadas para analizar.</p>
                )}
              </div>
            </div>
          )}
      {/* Fin Contenido Principal */}

      {/* Analysis Selection Modal */}
      {showAnalysisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#ede6db] px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-[#2b1710]">Selección de datos</h3>
                <p className="text-sm text-[#765e50]">Indique qué información del cuestionario se mostrará en el reporte.</p>
              </div>
              <button onClick={() => setShowAnalysisModal(false)} className="text-[#a08c7a] hover:text-[#2b1710]">
                <AppIcon name="close" className="text-[20px]" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto bg-[#fdfcfb]">
              <div className="grid gap-4">
                <label className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors ${selectedQIds === 'all' ? 'border-[#2b1710] bg-[#f0e8dd]' : 'border-[#ede6db] bg-white hover:border-[#d8cabb]'}`}>
                   <div className="mt-0.5 text-[#2b1710]">
                     <AppIcon name="list_checks" className="text-[20px]" />
                   </div>
                   <div className="flex-1">
                     <p className={`font-semibold ${selectedQIds === 'all' ? 'text-[#2b1710]' : 'text-[#2b1710]'}`}>Cuestionario completo</p>
                     <p className="text-xs text-[#765e50] mt-1">Generar métricas de todas las preguntas</p>
                   </div>
                   <input 
                     type="radio" 
                     name="q-select" 
                     checked={selectedQIds === 'all'} 
                     onChange={() => setSelectedQIds('all')}
                     className="mt-1 h-5 w-5 accent-[#2b1710]" 
                   />
                </label>

                <div className="grid sm:grid-cols-2 gap-4">
                  {questions.map((q, i) => {
                    const isSelected = Array.isArray(selectedQIds) && selectedQIds.includes(q.id);
                    return (
                      <label key={q.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${isSelected ? 'border-[#2b1710] bg-[#f0e8dd]' : 'border-[#ede6db] bg-white hover:border-[#d8cabb]'}`}>
                         <div className="mt-0.5 text-[#765e50]">
                           <AppIcon name="pie_chart" className="text-[18px]" />
                         </div>
                         <div className="flex-1">
                           <p className="text-sm font-semibold text-[#2b1710] line-clamp-2">{i + 1}. {q.texto_pregunta}</p>
                           <p className="text-[11px] text-[#765e50] mt-1">{formatQuestionType(q.tipo_pregunta)}</p>
                         </div>
                         <input 
                           type="checkbox" 
                           checked={isSelected}
                           onChange={() => {
                             if (selectedQIds === 'all') {
                               setSelectedQIds([q.id]);
                             } else {
                               const current = Array.isArray(selectedQIds) ? selectedQIds : [];
                               if (isSelected) {
                                 setSelectedQIds(current.filter(id => id !== q.id));
                               } else {
                                 setSelectedQIds([...current, q.id]);
                               }
                             }
                           }}
                           className="mt-1 h-4 w-4 rounded accent-[#2b1710]" 
                         />
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#ede6db] px-6 py-4 bg-white">
              <button 
                onClick={() => setShowAnalysisModal(false)}
                className="rounded-lg border border-[#d8cabb] px-4 py-2 text-sm font-semibold text-[#5a3424] hover:bg-[#f0e8dd]"
              >
                Cancelar
              </button>
              <button 
                onClick={() => setShowAnalysisModal(false)}
                disabled={!selectedQIds || (Array.isArray(selectedQIds) && selectedQIds.length === 0)}
                className="rounded-lg bg-[#2b1710] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d2318] disabled:opacity-50"
              >
                Confirmar Selección
              </button>
            </div>
          </div>
        </div>
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
      <div className="border-b border-[#e5e7eb] bg-white px-5 py-4">
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
                  <thead className="sticky top-0 bg-white">
                    <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-[#a08c7a]">
                      <th className="px-3 py-2">Respondente</th>
                      <th className="px-3 py-2">Respuesta</th>
                      <th className="px-3 py-2">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ede6db]">
                    {data.respondentItems.map(item => (
                      <tr key={item.responseId} className="hover:bg-[#f3f4f6]">
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
    <div className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
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
          <thead className="bg-white text-left text-[10px] font-bold uppercase tracking-wider text-[#a08c7a]">
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
                <tr key={r.id} className="hover:bg-[#f3f4f6] transition-colors">
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
                        <AppIcon name="delete" className="text-[18px]" />
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
