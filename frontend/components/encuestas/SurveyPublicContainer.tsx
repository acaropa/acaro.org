'use client'

import { AppIcon } from "@/components/ui/AppIcon"
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { encuestasApi, type EncuestaFull, type EncuestaPregunta } from '@/lib/encuestas'
import { isQuestionVisible, isQuestionRequired, type AnswerValue, type ValidationRules } from '@/lib/surveyRules'
import { SurveyQuestionRenderer } from './SurveyQuestionRenderer'
import { AnimatedCircularProgress } from '@/components/ui/AnimatedCircularProgress'
import { SurveySubmitMotion, type SubmitMotionPhase } from './SurveySubmitMotion'

const STYLES = `
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(32px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-32px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.55); }
    to   { opacity: 1; transform: scale(1); }
  }
  .q-enter-forward { animation: slideInRight 0.28s ease-out both; }
  .q-enter-back    { animation: slideInLeft  0.28s ease-out both; }
  .check-enter     { animation: scaleIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
  @keyframes submitPress {
    0% { transform: scale(1); }
    42% { transform: scale(0.965); }
    100% { transform: scale(1); }
  }
  @keyframes submitPlaneFold {
    0% { opacity: 0; transform: translate(-50%, -45%) scale(0.58) rotate(-18deg); }
    52% { opacity: 1; transform: translate(-50%, -50%) scale(0.92) rotate(5deg); }
    100% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(0deg); }
  }
  @keyframes submitCapsuleSheen {
    from { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
    38% { opacity: 0.22; }
    to { transform: translateX(130%) skewX(-18deg); opacity: 0; }
  }
  @keyframes trailFade {
    from { opacity: 0.42; transform: scale(1); }
    to { opacity: 0; transform: translateY(7px) scale(0.28); }
  }
  @keyframes leafFade {
    from { opacity: 0.28; transform: scale(1); }
    to { opacity: 0; transform: translateY(8px) rotate(18deg) scale(0.46); }
  }
  @keyframes arrivalRing {
    from { opacity: 0.48; transform: scale(0.18); }
    to { opacity: 0; transform: scale(3.4); }
  }
  @keyframes arrivalSpark {
    0% { opacity: 0; }
    28% { opacity: 0.95; }
    100% { opacity: 0; }
  }
  @keyframes launchBurst {
    0% { opacity: 0; transform: translate3d(-50%, -50%, 0) scale(0.48); }
    22% { opacity: 0.42; }
    100% { opacity: 0; transform: translate3d(-50%, -50%, 0) scale(2.15); }
  }
  @keyframes launchCore {
    0% { opacity: 0; transform: translate3d(-50%, -50%, 0) scale(0.72); }
    36% { opacity: 0.5; }
    100% { opacity: 0; transform: translate3d(-50%, -50%, 0) scale(0.25); }
  }
  @keyframes formExitAfterSubmit {
    0% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
    100% { opacity: 0; transform: translate3d(0, -18px, 0) scale(0.965); }
  }
  @keyframes successPanelEnter {
    from { opacity: 0; transform: translateY(10px) scale(0.985); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes successItemEnter {
    from { opacity: 0; transform: translateY(8px) scale(0.985); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes drawSuccessCheck {
    to { stroke-dashoffset: 0; }
  }
  .survey-submit-button {
    position: relative;
    overflow: hidden;
    min-width: 0;
    max-width: 260px;
    transform-origin: center;
  }
  .survey-submit-button[data-submit-state='preparing'] {
    width: 58px;
    max-width: 58px;
    border-radius: 999px;
    animation: submitPress 220ms cubic-bezier(.2,.8,.2,1) both;
    transition: max-width 540ms cubic-bezier(.16,1,.3,1), border-radius 540ms cubic-bezier(.16,1,.3,1), opacity 260ms ease, transform 220ms cubic-bezier(.2,.8,.2,1);
  }
  .survey-submit-button[data-submit-state='flying'],
  .survey-submit-button[data-submit-state='waiting'],
  .survey-submit-button[data-submit-state='success'] {
    width: 58px;
    max-width: 58px;
    opacity: 0;
    transform: scale(0.54) translateY(-2px);
    transition: opacity 320ms ease, transform 420ms cubic-bezier(.16,1,.3,1), max-width 540ms cubic-bezier(.16,1,.3,1);
  }
  .survey-submit-button[data-submit-state='preparing'] .survey-submit-label,
  .survey-submit-button[data-submit-state='preparing'] .survey-submit-arrow,
  .survey-submit-button[data-submit-state='flying'] .survey-submit-label,
  .survey-submit-button[data-submit-state='flying'] .survey-submit-arrow,
  .survey-submit-button[data-submit-state='waiting'] .survey-submit-label,
  .survey-submit-button[data-submit-state='waiting'] .survey-submit-arrow,
  .survey-submit-button[data-submit-state='success'] .survey-submit-label,
  .survey-submit-button[data-submit-state='success'] .survey-submit-arrow {
    opacity: 0;
    transform: scale(0.92);
    transition: opacity 220ms ease, transform 220ms ease;
  }
  .survey-submit-plane {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 25px;
    height: 25px;
    color: currentColor;
    pointer-events: none;
    transform-origin: 54% 48%;
    animation: submitPlaneFold 460ms 120ms cubic-bezier(.16,1,.3,1) both;
  }
  .survey-submit-motion {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 80;
    overflow: hidden;
  }
  .survey-flight-target {
    position: fixed;
    left: 0;
    top: 0;
    width: 48px;
    height: 48px;
    border-radius: 999px;
    background: radial-gradient(circle at 50% 50%, #0f0b08 0 34%, rgba(15, 11, 8, 0.72) 35% 52%, rgba(15, 11, 8, 0.14) 53% 72%, transparent 73% 100%);
    box-shadow: 0 18px 38px rgba(18, 12, 8, 0.16), inset 0 0 12px rgba(0, 0, 0, 0.34);
    opacity: 0;
    pointer-events: none;
    will-change: transform, opacity, filter;
  }
  .survey-flight-target.is-visible {
    animation: flightTargetEnter 240ms cubic-bezier(.16,1,.3,1) forwards;
  }
  .survey-flight-target.is-consuming {
    animation: flightTargetConsume 360ms cubic-bezier(.16,1,.3,1) forwards;
  }
  .survey-launch-burst {
    position: fixed;
    left: 0;
    top: 0;
    width: 38px;
    height: 38px;
    border: 1px solid color-mix(in srgb, var(--primary) 42%, transparent);
    border-radius: 999px;
    pointer-events: none;
    animation: launchBurst 680ms cubic-bezier(.16,1,.3,1) forwards;
  }
  .survey-launch-burst::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--primary) 74%, transparent);
    animation: launchCore 540ms ease-out forwards;
  }
  .survey-flight-plane {
    position: fixed;
    left: 0;
    top: 0;
    width: 36px;
    height: 36px;
    color: var(--primary);
    will-change: transform, opacity;
    filter: drop-shadow(0 12px 22px rgba(34, 24, 14, 0.16));
  }
  .survey-flight-plane svg {
    transform-origin: 54% 48%;
  }
  .survey-flight-particle {
    position: fixed;
    left: 0;
    top: 0;
    width: 5px;
    height: 5px;
    will-change: transform;
  }
  .survey-flight-particle::before {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 999px;
    background: color-mix(in srgb, var(--primary) 58%, transparent);
    box-shadow: 0 0 10px color-mix(in srgb, var(--primary) 16%, transparent);
    animation: trailFade 640ms ease-out forwards;
  }
  .survey-flight-leaf {
    width: 7px;
    height: 4px;
  }
  .survey-flight-leaf::before {
    border-radius: 7px 0 7px 0;
    background: color-mix(in srgb, var(--accent) 46%, transparent);
    animation: leafFade 620ms ease-out forwards;
  }
  .survey-arrival-mark {
    position: fixed;
    left: 0;
    top: 0;
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--primary);
    opacity: 0;
  }
  .survey-arrival-mark.is-visible {
    animation: arrivalSpark 640ms ease-out forwards;
  }
  .survey-arrival-mark span {
    position: absolute;
    inset: -8px;
    border: 1px solid color-mix(in srgb, var(--primary) 45%, transparent);
    border-radius: 999px;
    opacity: 0;
  }
  .survey-arrival-mark.is-visible span {
    animation: arrivalRing 680ms cubic-bezier(.16,1,.3,1) forwards;
  }
  .survey-arrival-mark.is-visible span + span {
    animation-delay: 120ms;
  }
  .survey-form-shell[data-submit-motion='success'] {
    animation: formExitAfterSubmit 340ms cubic-bezier(.16,1,.3,1) both;
    transform-origin: center;
    will-change: transform, opacity;
  }
  .success-panel-enter {
    animation: successPanelEnter 640ms cubic-bezier(.16,1,.3,1) both;
  }
  .success-item-enter {
    opacity: 0;
    animation: successItemEnter 620ms cubic-bezier(.16,1,.3,1) both;
  }
  .success-check-shell {
    opacity: 0;
    animation: successItemEnter 560ms cubic-bezier(.16,1,.3,1) both;
  }
  .success-check-path {
    stroke-dasharray: 32;
    stroke-dashoffset: 32;
    animation: drawSuccessCheck 540ms 260ms cubic-bezier(.16,1,.3,1) forwards;
  }
  @media (prefers-reduced-motion: reduce) {
    .q-enter-forward,
    .q-enter-back,
    .check-enter,
    .survey-submit-button,
    .survey-submit-plane,
    .survey-flight-target,
    .survey-launch-burst,
    .survey-flight-plane,
    .survey-flight-particle,
    .survey-arrival-mark,
    .survey-arrival-mark span,
    .survey-form-shell[data-submit-motion='success'],
    .success-panel-enter,
    .success-item-enter,
    .success-check-shell,
    .success-check-path {
      animation-duration: 1ms !important;
      transition-duration: 1ms !important;
    }
    .survey-submit-motion { display: none; }
  }
`

type VisibleEncuestaPregunta = EncuestaPregunta & { seccion_titulo?: string }
type RuleQuestion = { es_obligatoria?: boolean; reglas_validacion?: ValidationRules | null }

function toRuleQuestion(question: EncuestaPregunta): RuleQuestion {
  return {
    es_obligatoria: question.es_obligatoria,
    reglas_validacion: (question.reglas_validacion ?? null) as ValidationRules | null,
  }
}
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
  const [questions, setQuestions] = useState<VisibleEncuestaPregunta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [answersByCode, setAnswersByCode] = useState<Record<string, AnswerValue | undefined>>({})
  const [index, setIndex] = useState(0)
  const [done, setDone] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [submitMotionPhase, setSubmitMotionPhase] = useState<SubmitMotionPhase>('idle')
  const surveyShellRef = useRef<HTMLElement | null>(null)
  const submitButtonRef = useRef<HTMLButtonElement | null>(null)
  const apiSucceededRef = useRef(false)
  const flightArrivedRef = useRef(false)
  const completionTimerRef = useRef<number | null>(null)

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
    () => questions.filter(q => isQuestionVisible(toRuleQuestion(q), answersByCode)),
    [questions, answersByCode]
  )

  useEffect(() => {
    if (index < visibleQuestions.length || visibleQuestions.length === 0) return

    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) setIndex(visibleQuestions.length - 1)
    })

    return () => {
      cancelled = true
    }
  }, [index, visibleQuestions.length])
  useEffect(() => {
    return () => {
      if (completionTimerRef.current) window.clearTimeout(completionTimerRef.current)
    }
  }, [])

  const completeSuccessfulSubmit = useCallback(() => {
    setSubmitMotionPhase('success')
    if (completionTimerRef.current) window.clearTimeout(completionTimerRef.current)
    completionTimerRef.current = window.setTimeout(() => {
      setDone(true)
      setIsSaving(false)
    }, 620)
  }, [])

  const handleFlightStart = useCallback(() => {
    setSubmitMotionPhase(current => current === 'preparing' ? 'flying' : current)
  }, [])

  const handleFlightArrive = useCallback(() => {
    flightArrivedRef.current = true
    if (apiSucceededRef.current) {
      completeSuccessfulSubmit()
      return
    }
    setSubmitMotionPhase(current => current === 'success' || current === 'error' ? current : 'waiting')
  }, [completeSuccessfulSubmit])


  const submitAnswers = useCallback(async (finalAnswers: Record<string, AnswerValue | undefined>) => {
    if (!survey) return
    const visibleQs = questions.filter(q => isQuestionVisible(toRuleQuestion(q), finalAnswers))
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
    apiSucceededRef.current = false
    flightArrivedRef.current = false
    setIsSaving(true); setSaveError(''); setSubmitMotionPhase('preparing')
    try {
      await encuestasApi.submitPublic(slug, { respuestas })
      apiSucceededRef.current = true
      if (flightArrivedRef.current) completeSuccessfulSubmit()
    } catch (err) {
      apiSucceededRef.current = false
      setSubmitMotionPhase('error')
      setSaveError(err instanceof Error ? err.message : 'No se pudo enviar la encuesta.')
      window.setTimeout(() => setSubmitMotionPhase('idle'), 260)
      setIsSaving(false)
    }
  }, [survey, questions, slug, completeSuccessfulSubmit])

  const handleAnswer = useCallback(async (value?: AnswerValue) => {
    const q = visibleQuestions[index]
    if (!q || isSaving) return
    if (isQuestionRequired(toRuleQuestion(q), answersByCode) && isEmptyAnswer(value)) {
      setSaveError('Esta pregunta es obligatoria.'); return
    }
    const draft = { ...answersByCode, [q.codigo_pregunta ?? q.id]: value }
    if (typeof value === 'undefined') delete draft[q.codigo_pregunta ?? q.id]
    setSaveError(''); setAnswersByCode(draft)
    const nextVisible = questions.filter(qq => isQuestionVisible(toRuleQuestion(qq), draft))
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
      <style>{STYLES}</style>
      <div className="max-w-lg text-center success-panel-enter">
        <div className="success-check-shell mx-auto mb-6 flex h-20 w-20 items-center justify-center border border-brand-green/30 bg-brand-green/5">
          <svg viewBox="0 0 56 56" className="h-12 w-12 text-brand-green" fill="none" aria-hidden="true">
            <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="2" opacity="0.24" />
            <path className="success-check-path" d="M18 29.2 25.2 36 39 21" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="success-item-enter text-xs font-bold tracking-[0.3em] uppercase text-brand-green mb-3" style={{ animationDelay: '90ms' }}>Encuesta enviada</p>
        <h1 className="success-item-enter font-serif text-4xl font-bold text-primary mb-4" style={{ animationDelay: '180ms' }}>Gracias por completar la encuesta</h1>
        <p className="success-item-enter text-[16px] leading-[1.6] text-muted mb-8" style={{ animationDelay: '280ms' }}>
          Su información fue enviada correctamente. Puede cerrar esta página o regresar al listado.
        </p>
        <Link href="/encuestas" className="success-item-enter inline-flex items-center gap-2 px-8 py-3 border border-primary text-primary text-xs font-bold tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-colors" style={{ animationDelay: '380ms' }}>
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
  const section = q.seccion_titulo ?? 'Encuesta'
  const pct = total > 0 ? (pos / total) * 100 : 0
  const isLast = pos === total
  const required = isQuestionRequired(toRuleQuestion(q), answersByCode)
  const animClass = direction === 'forward' ? 'q-enter-forward' : 'q-enter-back'

  return (
    <div className="theme-public-surveys bg-background text-on-surface font-body-md overflow-x-hidden min-h-screen flex flex-col lg:flex-row w-full">
      <style>{STYLES}</style>
      <SurveySubmitMotion
        phase={submitMotionPhase}
        containerRef={surveyShellRef}
        buttonRef={submitButtonRef}
        onFlightStart={handleFlightStart}
        onArrive={handleFlightArrive}
      />

      {/* Left Panel: Photo */}
      <section className="relative lg:sticky lg:top-0 lg:h-screen w-full lg:w-1/2 h-[30vh] min-h-[250px] bg-[#120C08] flex flex-col justify-end p-8 lg:p-[64px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center opacity-80"
            style={{backgroundImage: "url('/coffee_farmers_survey.png')"}}>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#120C08]/95 via-[#120C08]/50 to-[#120C08]/10"></div>
        </div>

        {/* Absolute 'volver' button at top left */}
        <div className="absolute top-6 left-6 lg:top-8 lg:left-8 z-20">
          <Link href="/encuestas" className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-white hover:text-white transition-all flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/20 hover:bg-black/60 shadow-lg">
            <AppIcon name="close" className="text-[16px]" />
            Salir
          </Link>
        </div>

        <div className="relative z-10 space-y-4 max-w-xl hidden lg:block">
          <h2 className="font-serif text-3xl lg:text-5xl font-bold text-[#f8efe3] leading-none drop-shadow-lg">
            {survey?.titulo ?? "Encuesta"}
          </h2>
          <div className="w-12 h-[2px] bg-primary/80 my-4"></div>
          <p className="font-body-lg text-lg text-[#d8c9bb] max-w-md drop-shadow-md">
            Complete las siguientes preguntas para continuar.
          </p>
        </div>
      </section>

      {/* Right Panel: Content */}
      <section ref={surveyShellRef} className="w-full lg:w-1/2 flex flex-col justify-start lg:justify-center p-8 pt-12 lg:px-20 relative min-h-[70vh] lg:min-h-screen">
        <main className="w-full max-w-xl mx-auto flex flex-col justify-start lg:justify-center relative lg:my-auto">
          <div key={`q-${index}`} data-submit-motion={submitMotionPhase} className={`survey-form-shell w-full flex flex-col justify-center ${animClass}`}>
          {/* Question Section */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <span className="inline-block text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-white px-4 py-1.5 bg-primary">
                {section === 'Sección principal' ? 'PREGUNTA' : section}
              </span>
              <div className="flex-shrink-0">
                <AnimatedCircularProgress value={pct} size={56} strokeWidth={2} />
              </div>
            </div>

            <div className="flex-grow">
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-2 leading-tight">
                {index + 1} - {q.texto_pregunta.replace(/^[\s\d.\-)]+/, '').trim()}
              </h1>
              <p className="text-[15px] text-muted mt-3 leading-relaxed">
                {q.texto_ayuda || "Por favor, indique su respuesta a continuación."}
              </p>
              {!required && (
                <div>
                  <span className="inline-block mt-4 px-2 py-1 text-[10px] font-bold tracking-[0.2em] uppercase text-muted border border-primary/10">
                    Opcional
                  </span>
                </div>
              )}
            </div>
          </section>

          {saveError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl flex items-center gap-2 mb-6">
              <AppIcon name="error" className="text-[18px]" />
              {saveError}
            </div>
          )}

          {/* Options Grid */}
          <div className="flex-1">
            <SurveyQuestionRenderer
              question={q}
              initialValue={answersByCode[q.codigo_pregunta ?? q.id]}
              required={required}
              continueLabel={isLast ? 'Enviar encuesta' : 'Continuar'}
              onAnswer={handleAnswer}
              isSubmitting={isSaving}
              onGoBack={goBack}
              canGoBack={index > 0}
              submitButtonRef={submitButtonRef}
              submitMotionPhase={submitMotionPhase}
            />
          </div>
        </div>
      </main>
    </section>
  </div>
  )
}
