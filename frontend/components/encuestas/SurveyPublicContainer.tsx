'use client'

import { AppIcon } from "@/components/ui/AppIcon"
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { encuestasApi, type EncuestaFull, type EncuestaPregunta } from '@/lib/encuestas'
import { isQuestionVisible, isQuestionRequired, type AnswerValue } from '@/lib/surveyRules'
import { SurveyQuestionRenderer } from './SurveyQuestionRenderer'
import { AnimatedCircularProgress } from '@/components/ui/AnimatedCircularProgress'

const STYLES = `
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(48px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-48px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.5); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .q-enter-forward { animation: slideInRight 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .q-enter-back    { animation: slideInLeft  0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .check-enter     { animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
  .fade-up         { animation: fadeUp 0.4s ease-out both; }
`

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
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

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
    setDirection('forward')
    setIndex(nextIdx)
  }, [visibleQuestions, index, isSaving, answersByCode, questions, submitAnswers])

  const goBack = () => {
    if (index > 0 && !isSaving) {
      setSaveError('')
      setDirection('back')
      setIndex(p => p - 1)
    }
  }

  if (loading) return (
    <div className="landing-typography min-h-screen bg-surface flex items-center justify-center">
      <style>{STYLES}</style>
      <div className="flex flex-col items-center gap-4 fade-up">
        <AnimatedCircularProgress value={0} size={80} strokeWidth={6} />
        <p className="text-xs font-bold tracking-widest uppercase text-muted">Cargando...</p>
      </div>
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
      <style>{STYLES}</style>
      <div className="max-w-sm text-center">
        <div className="check-enter mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border-2 border-brand-green/25 bg-brand-green/5">
          <AppIcon name="check_circle" className="text-[52px] text-brand-green" />
        </div>
        <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-brand-green mb-3">Encuesta completada</p>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4 leading-tight">
          ¡Gracias por su participación!
        </h1>
        <p className="text-[15px] leading-relaxed text-muted mb-8">
          Su información fue registrada correctamente y contribuye al desarrollo de la comunidad cafetalera.
        </p>
        <Link href="/encuestas" className="inline-flex items-center gap-2 px-7 py-3 bg-primary text-primary-foreground text-xs font-bold tracking-widest uppercase hover:opacity-90 transition-opacity">
          <AppIcon name="home" className="text-[15px]" />
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
  const animClass = direction === 'forward' ? 'q-enter-forward' : 'q-enter-back'
  const decorNum = String(pos).padStart(2, '0')

  return (
    <div className="landing-typography min-h-screen bg-surface">
      <style>{STYLES}</style>

      {/* Sticky header — back button left, progress circle right */}
      <header className="sticky top-0 z-10 border-b border-primary/8 bg-surface/90 backdrop-blur-md">
        <div className="mx-auto max-w-[820px] flex items-center justify-between px-5 py-3 sm:px-8">
          <Link
            href="/encuestas"
            className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-muted hover:text-primary transition-colors"
          >
            <AppIcon name="arrow_back" className="text-[15px]" />
            Volver
          </Link>
          <div className="flex items-center gap-3">
            {survey.logo_url && (
              <img src={survey.logo_url} alt="" className="h-7 w-auto opacity-70" onError={e => { e.currentTarget.style.display = 'none' }} />
            )}
            <AnimatedCircularProgress value={pct} size={52} strokeWidth={5} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[820px] px-5 sm:px-8 py-8 md:py-12">

        {/* Survey meta above the card */}
        <div className="mb-5 fade-up">
          {section && (
            <span className="inline-block text-[9px] font-black tracking-[0.3em] uppercase text-accent bg-accent/8 px-2.5 py-1 rounded-full mb-2">
              {section}
            </span>
          )}
          <p className="text-sm font-semibold text-primary/50 leading-snug line-clamp-1">
            {survey.titulo}
          </p>
        </div>

        {/* Card stack */}
        <div className="relative pb-8">
          {/* Ghost card 2 — deepest */}
          <div className="absolute inset-x-8 bottom-2 top-4 rounded-2xl border border-primary/5 bg-white/50" style={{ zIndex: 0 }} />
          {/* Ghost card 1 */}
          <div className="absolute inset-x-4 bottom-4 top-2 rounded-2xl border border-primary/8 bg-white/75" style={{ zIndex: 1 }} />

          {/* Main card */}
          <div
            key={`q-${index}`}
            className={`relative rounded-2xl border border-primary/10 bg-white shadow-[0_4px_32px_rgba(43,23,16,0.07)] overflow-hidden ${animClass}`}
            style={{ zIndex: 2 }}
          >
            {/* Accent top bar */}
            <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, transparent 0%, var(--color-accent, #a66f2e) 30%, var(--color-accent, #a66f2e) 70%, transparent 100%)' }} />

            <div className="px-6 pt-6 pb-8 md:px-10 md:pt-8 md:pb-10">

              {/* Card header: question number + required badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-black tracking-[0.3em] uppercase text-primary/20">
                  N.º {decorNum}
                </span>
                {required
                  ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-[0.2em] uppercase bg-accent/10 text-accent border border-accent/20">
                      <span className="block w-1 h-1 rounded-full bg-accent" />
                      Obligatoria
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-bold tracking-[0.2em] uppercase text-primary/20 border border-primary/10">
                      Opcional
                    </span>
                  )
                }
              </div>

              {/* Decorative large number — watermark effect */}
              <div
                className="font-serif font-black text-primary/[0.035] leading-none select-none pointer-events-none"
                style={{ fontSize: 'clamp(4.5rem, 11vw, 7.5rem)', lineHeight: 1 }}
                aria-hidden="true"
              >
                {decorNum}
              </div>

              {/* Question title — overlaps the watermark */}
              <h2
                className="font-serif font-bold text-primary leading-tight relative"
                style={{ fontSize: 'clamp(1.5rem, 4vw, 2.1rem)', marginTop: '-0.5em' }}
              >
                {q.texto_pregunta.replace(/^\s*\d+[.)\-]?\s*/, '').trim()}
              </h2>

              {q.texto_ayuda && (
                <p className="mt-2 text-sm leading-relaxed text-muted">{q.texto_ayuda}</p>
              )}

              {/* Divider */}
              <div className="my-6 h-px bg-primary/6" />

              {saveError && (
                <div className="flex items-center gap-2.5 text-sm text-red-600 bg-red-50/80 border border-red-200 rounded-xl px-4 py-3 mb-5">
                  <AppIcon name="error" className="text-[18px] shrink-0" />
                  {saveError}
                </div>
              )}

              <SurveyQuestionRenderer
                question={q}
                initialValue={answersByCode[q.codigo_pregunta ?? q.id]}
                required={required}
                continueLabel={isLast ? 'Enviar encuesta' : 'Continuar'}
                onAnswer={handleAnswer}
                isSubmitting={isSaving}
              />
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex items-center justify-between px-1 mt-2">
          <button
            type="button"
            onClick={goBack}
            disabled={index === 0 || isSaving}
            className="flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-primary/35 hover:text-primary transition-colors disabled:opacity-0 disabled:pointer-events-none py-2"
          >
            <AppIcon name="arrow_back" className="text-[14px]" />
            Anterior
          </button>
          {isLast && !isSaving && (
            <p className="text-xs text-muted/60 hidden sm:block">
              Al continuar se enviará la encuesta.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
