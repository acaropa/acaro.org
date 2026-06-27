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
      <div className="max-w-lg text-center">
        <div className="check-enter mx-auto mb-6 flex h-20 w-20 items-center justify-center border border-brand-green/30 bg-brand-green/5">
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
  const section = (q as any).seccion_titulo ?? 'Encuesta'
  const pct = total > 0 ? (pos / total) * 100 : 0
  const isLast = pos === total
  const required = isQuestionRequired(q as any, answersByCode)
  const animClass = direction === 'forward' ? 'q-enter-forward' : 'q-enter-back'

  return (
    <div className="theme-public-surveys bg-background text-on-surface font-body-md overflow-x-hidden min-h-screen flex flex-col lg:flex-row w-full">
      <style>{STYLES}</style>

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
      <section className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:px-20 relative min-h-[70vh] lg:min-h-screen">
        <main className="w-full max-w-xl mx-auto flex flex-col justify-center relative my-auto">
          <div key={`q-${index}`} className={`w-full flex flex-col justify-center ${animClass}`}>
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
              {q.texto_ayuda && (
                <p className="text-[15px] text-muted mt-3 leading-relaxed">{q.texto_ayuda}</p>
              )}
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
            />
          </div>
        </div>
      </main>
    </section>
  </div>
  )
}
