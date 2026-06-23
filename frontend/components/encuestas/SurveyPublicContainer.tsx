'use client'


import { AppIcon } from "@/components/ui/AppIcon"
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { encuestasApi, type EncuestaFull, type EncuestaPregunta } from '@/lib/encuestas'
import { isQuestionVisible, isQuestionRequired, type AnswerValue } from '@/lib/surveyRules'
import { SurveyQuestionRenderer } from './SurveyQuestionRenderer'

function isEmptyAnswer(value?: AnswerValue) {
  if (typeof value === 'undefined') return true
  if (typeof value === 'string') return !value.trim()
  if (typeof value === 'number') return Number.isNaN(value)
  if (typeof value === 'boolean') return false
  if (typeof value === 'object' && value !== null && 'type' in value) {
    if (value.type === 'single_choice') return !value.optionId
    if (value.type === 'multiple_choice') return value.selections.length === 0
  }
  return true
}

interface Props { slug: string }

export function SurveyPublicContainer({ slug }: Props) {
  const [survey, setSurvey] = useState<EncuestaFull | null>(null)
  const [questions, setQuestions] = useState<(EncuestaPregunta & { seccion_titulo?: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [answersByCode, setAnswersByCode] = useState<Record<string, AnswerValue | undefined>>({})
  const [index, setIndex] = useState(0)
  const [done, setDone] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    encuestasApi.getPublic(slug)
      .then(data => {
        setSurvey(data)
        const secciones = (data.secciones ?? []).sort((a, b) => a.posicion - b.posicion)
        const flat = secciones.flatMap(sec =>
          (data.preguntas ?? [])
            .filter(p => p.seccion_id === sec.id)
            .sort((a, b) => a.posicion - b.posicion)
            .map(p => ({ ...p, seccion_titulo: sec.titulo ?? undefined }))
        )
        const withoutSection = (data.preguntas ?? [])
          .filter(p => !p.seccion_id)
          .sort((a, b) => a.posicion - b.posicion)
        setQuestions([...flat, ...withoutSection])
      })
      .catch(err => setError(err.message || 'Encuesta no encontrada'))
      .finally(() => setLoading(false))
  }, [slug])

  const visibleQuestions = useMemo(
    () => questions.filter(q => isQuestionVisible(q as any, answersByCode)),
    [questions, answersByCode]
  )

  useEffect(() => {
    if (index >= visibleQuestions.length && visibleQuestions.length > 0)
      setIndex(visibleQuestions.length - 1)
  }, [index, visibleQuestions.length])

  const submitAnswers = useCallback(async (finalAnswers: Record<string, AnswerValue | undefined>) => {
    if (!survey) return
    const visibleQs = questions.filter(q => isQuestionVisible(q as any, finalAnswers))
    const respuestas = visibleQs
      .filter(q => !isEmptyAnswer(finalAnswers[q.codigo_pregunta ?? '']))
      .map(q => {
        const val = finalAnswers[q.codigo_pregunta ?? '']
        const row: Record<string, unknown> = { pregunta_id: q.id }
        if (typeof val === 'string') row.respuesta_texto = val
        else if (typeof val === 'number') row.respuesta_numero = val
        else if (typeof val === 'boolean') row.respuesta_booleano = val
        else if (val && typeof val === 'object' && 'type' in val) {
          if (val.type === 'single_choice') {
            row.respuesta_texto = val.value
            row.opciones_seleccionadas = [{ opcion_id: val.optionId, texto_libre: val.textFree ?? null }]
          } else if (val.type === 'multiple_choice') {
            row.respuesta_texto = val.selections.map(s => s.value).join(', ')
            row.opciones_seleccionadas = val.selections.map(s => ({ opcion_id: s.optionId, texto_libre: s.textFree ?? null }))
          }
        }
        return row
      })
    setIsSaving(true); setSaveError('')
    try {
      await encuestasApi.submitPublic(slug, { respuestas })
      setDone(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'No se pudo enviar la encuesta.')
    } finally { setIsSaving(false) }
  }, [survey, questions, slug])

  const handleAnswer = useCallback(async (value?: AnswerValue) => {
    const q = visibleQuestions[index]
    if (!q || isSaving) return
    if (isQuestionRequired(q as any, answersByCode) && isEmptyAnswer(value)) {
      setSaveError('Esta pregunta es obligatoria.'); return
    }
    const draft = { ...answersByCode, [q.codigo_pregunta ?? q.id]: value }
    if (typeof value === 'undefined') delete draft[q.codigo_pregunta ?? q.id]
    setSaveError(''); setAnswersByCode(draft)
    const nextVisible = questions.filter(qq => isQuestionVisible(qq as any, draft))
    const nextIdx = nextVisible.findIndex(qq => qq.id === q.id) + 1
    if (nextIdx >= nextVisible.length) { await submitAnswers(draft); return }
    setIndex(nextIdx)
  }, [visibleQuestions, index, isSaving, answersByCode, questions, submitAnswers])

  const goBack = () => { if (index > 0 && !isSaving) { setSaveError(''); setIndex(p => p - 1) } }

  if (loading) return (
    <div className="landing-typography min-h-screen bg-surface flex items-center justify-center">
      <p className="text-muted text-sm">Cargando formulario...</p>
    </div>
  )

  if (error) return (
    <div className="landing-typography min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <AppIcon name="error_outline" className="text-[48px] text-accent mb-4" />
        <h1 className="font-serif text-3xl font-bold text-primary mb-3">Encuesta no disponible</h1>
        <p className="text-muted text-[15px] leading-relaxed mb-6">{error}</p>
        <Link href="/encuestas" className="text-xs font-bold tracking-widest uppercase text-primary border-b border-accent pb-1 hover:border-b-2 transition-all">
          Volver al listado
        </Link>
      </div>
    </div>
  )

  if (done) return (
    <div className="landing-typography min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border border-brand-green/30 bg-brand-green/5">
          <AppIcon name="check_circle" className="text-[40px] text-brand-green" />
        </div>
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-brand-green mb-3">Encuesta enviada</p>
        <h1 className="font-serif text-4xl font-bold text-primary mb-4">Gracias por completar la encuesta</h1>
        <p className="text-[16px] leading-[1.6] text-muted mb-8">
          Su información fue enviada correctamente. Puede cerrar esta página o regresar al listado.
        </p>
        <Link href="/encuestas" className="inline-flex items-center gap-2 px-8 py-3 border border-primary text-primary text-xs font-bold tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-colors">
          <AppIcon name="home" className="text-[16px]" />
          Volver al inicio
        </Link>
      </div>
    </div>
  )

  if (!survey || visibleQuestions.length === 0) return null

  const q = visibleQuestions[index] ?? visibleQuestions[0]
  const pos = visibleQuestions.findIndex(qq => qq.id === q.id) + 1
  const total = visibleQuestions.length
  const section = (q as any).seccion_titulo ?? ''
  const pct = total > 0 ? (pos / total) * 100 : 0
  const isLast = pos === total
  const required = isQuestionRequired(q as any, answersByCode)

  return (
    <div className="landing-typography min-h-screen bg-surface">
      <div className="border-b border-primary/10 bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto max-w-[960px] flex items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/encuestas" className="text-xs font-bold tracking-widest uppercase text-muted hover:text-primary transition-colors flex items-center gap-2">
            <AppIcon name="arrow_back" className="text-[16px]" />
            Volver
          </Link>
          <div className="flex items-center gap-3">
            {survey.logo_url && <img src={survey.logo_url} alt="" className="h-8 w-auto" onError={e => { e.currentTarget.style.display = 'none' }} />}
            <span className="text-xs font-bold tracking-widest uppercase text-muted hidden sm:inline">Encuesta</span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[960px] px-5 sm:px-8 py-12 md:py-16">
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-accent">Paso {pos} de {total}</span>
            {section && (<><span className="w-1 h-1 rounded-full bg-primary/30" /><span className="text-xs font-bold tracking-[0.2em] uppercase text-muted">{section}</span></>)}
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary leading-tight mb-3">{survey.titulo}</h1>
          <p className="text-[15px] leading-[1.6] text-muted max-w-2xl">
            {survey.descripcion?.trim() || 'Complete el formulario siguiendo el orden de las preguntas.'}
          </p>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-[3px] bg-primary/10 overflow-hidden">
              <div className="h-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-bold tracking-wider text-accent">{Math.round(pct)}%</span>
          </div>
        </div>

        <div className="h-[1px] bg-primary/10 mb-10" />

        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase border border-primary/20 text-primary">Pregunta {pos}</span>
            {required
              ? <span className="px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase bg-accent/10 text-accent border border-accent/20">Obligatoria</span>
              : <span className="px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase text-muted border border-primary/10">Opcional</span>
            }
          </div>

          <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary leading-snug mb-2">
            {q.texto_pregunta.replace(/^\s*\d+[.)\-]?\s*/, '').trim()}
          </h2>
          {q.texto_ayuda && <p className="text-sm text-muted mb-6">{q.texto_ayuda}</p>}

          {saveError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-2 mb-6">
              <AppIcon name="error" className="text-[18px]" />
              {saveError}
            </div>
          )}

          <div className="mt-6">
            <SurveyQuestionRenderer
              question={q}
              initialValue={answersByCode[q.codigo_pregunta ?? q.id]}
              required={required}
              continueLabel={isLast ? 'Enviar encuesta' : 'Continuar'}
              onAnswer={handleAnswer}
              isSubmitting={isSaving}
            />
          </div>

          <div className="flex items-center justify-between mt-10 pt-6 border-t border-primary/10">
            <button type="button" onClick={goBack} disabled={index === 0 || isSaving}
              className="px-6 py-2.5 border border-primary text-primary text-xs font-bold tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              Anterior
            </button>
            <p className="text-xs text-muted max-w-[280px] text-right leading-relaxed hidden sm:block">
              {isLast ? isSaving ? 'Enviando respuestas...' : 'Al continuar se enviará la encuesta.' : 'Continúe hasta el final para enviar.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
