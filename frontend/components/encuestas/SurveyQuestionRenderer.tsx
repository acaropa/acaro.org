'use client'

import { AppIcon } from "@/components/ui/AppIcon"
import { useEffect, useMemo, useState, type RefObject } from 'react'
import type { EncuestaPregunta } from '@/lib/encuestas'
import type { AnswerValue } from '@/lib/surveyRules'
import type { SubmitMotionPhase } from './SurveySubmitMotion'

interface Props {
  question: EncuestaPregunta
  initialValue?: AnswerValue
  required?: boolean
  continueLabel?: string
  onAnswer: (value?: AnswerValue) => void | Promise<void>
  isSubmitting?: boolean
  onGoBack?: () => void
  canGoBack?: boolean
  submitButtonRef?: RefObject<HTMLButtonElement | null>
  submitMotionPhase?: SubmitMotionPhase
}

const inputCls =
  'block w-full px-5 py-4 text-base text-primary bg-transparent border border-outline-variant/50 hover:border-primary/50 focus:outline-none focus:border-primary transition-all disabled:cursor-not-allowed disabled:opacity-60'

export function SurveyQuestionRenderer({
  question,
  initialValue,
  required = false,
  continueLabel = 'Continuar',
  onAnswer,
  isSubmitting = false,
  onGoBack,
  canGoBack = false,
  submitButtonRef,
  submitMotionPhase = 'idle'
}: Props) {
  const [textValue, setTextValue] = useState('')
  const [longTextValue, setLongTextValue] = useState('')
  const [numberValue, setNumberValue] = useState('')
  const [dateValue, setDateValue] = useState('')
  const [selectedBoolean, setSelectedBoolean] = useState<boolean | null>(null)
  const [selectedSingleId, setSelectedSingleId] = useState<number | null>(null)
  const [selectedMultiIds, setSelectedMultiIds] = useState<number[]>([])
  const [freeText, setFreeText] = useState<Record<number, string>>({})

  useEffect(() => {
    let cancelled = false

    queueMicrotask(() => {
      if (cancelled) return

      setTextValue(''); setLongTextValue(''); setNumberValue(''); setDateValue('')
      setSelectedBoolean(null); setSelectedSingleId(null); setSelectedMultiIds([]); setFreeText({})

      if (question.tipo_pregunta === 'texto_corto' && typeof initialValue === 'string') setTextValue(initialValue)
      if (question.tipo_pregunta === 'texto_largo' && typeof initialValue === 'string') setLongTextValue(initialValue)
      if (question.tipo_pregunta === 'numero' && typeof initialValue === 'number') setNumberValue(String(initialValue))
      if (question.tipo_pregunta === 'fecha' && typeof initialValue === 'string') setDateValue(initialValue)
      if (question.tipo_pregunta === 'booleano' && typeof initialValue === 'boolean') setSelectedBoolean(initialValue)

      if (question.tipo_pregunta === 'opcion_unica' && initialValue && typeof initialValue === 'object' && 'type' in initialValue && initialValue.type === 'single_choice') {
        setSelectedSingleId(initialValue.optionId)
        if (initialValue.textFree) setFreeText({ [initialValue.optionId]: initialValue.textFree })
      }
      if (question.tipo_pregunta === 'opcion_multiple' && initialValue && typeof initialValue === 'object' && 'type' in initialValue && initialValue.type === 'multiple_choice') {
        setSelectedMultiIds(initialValue.selections.map(s => s.optionId))
        setFreeText(Object.fromEntries(initialValue.selections.filter(s => s.textFree).map(s => [s.optionId, s.textFree!])))
      }
    })

    return () => {
      cancelled = true
    }
  }, [initialValue, question.id, question.tipo_pregunta])

  const sortedOptions = useMemo(
    () => [...(question.opciones ?? [])].sort((a, b) => a.posicion - b.posicion),
    [question.opciones]
  )

  const isFinalSubmit = continueLabel === 'Enviar encuesta'
  const isSubmitAnimating = isFinalSubmit && submitMotionPhase !== 'idle' && submitMotionPhase !== 'error'

  const renderActionBar = (disabled: boolean, onContinue: () => void) => (
    <div className="flex justify-between items-center mt-12 pt-8 w-full border-t border-outline-variant/20">
      {onGoBack && canGoBack ? (
        <button
          type="button"
          onClick={onGoBack}
          disabled={isSubmitting}
          className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-muted hover:text-primary transition-colors disabled:opacity-30"
        >
          <AppIcon name="chevron_left" />
          <span>Anterior</span>
        </button>
      ) : <div />}

      <button
        type="button"
        ref={isFinalSubmit ? submitButtonRef : undefined}
        disabled={disabled}
        onClick={onContinue}
        data-submit-state={isFinalSubmit ? submitMotionPhase : undefined}
        className={`inline-flex items-center gap-3 px-8 py-3.5 bg-primary text-white text-xs font-bold tracking-[0.2em] uppercase hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed group ${isFinalSubmit ? 'survey-submit-button' : ''}`}
      >
        <span className={isFinalSubmit ? 'survey-submit-label' : undefined}>{isSubmitting ? 'Enviando...' : continueLabel}</span>
        {!isSubmitting && <AppIcon name="arrow_forward" className={`group-hover:translate-x-1 transition-transform ${isFinalSubmit ? 'survey-submit-arrow' : ''}`} />}
        {isSubmitAnimating && (
          <span className="survey-submit-plane" aria-hidden="true">
            <svg viewBox="0 0 42 42" className="h-full w-full" fill="none">
              <path d="M4.8 20.6 36.2 6.7 27.1 35.6 19.9 24.2 4.8 20.6Z" fill="currentColor" />
              <path d="M19.9 24.2 36.2 6.7 15.8 26.7 16.9 34.1 19.9 24.2Z" fill="rgba(255,255,255,.34)" />
            </svg>
          </span>
        )}
      </button>
    </div>
  )

  // ─── BOOLEANO ─────────────────────────────────────────
  if (question.tipo_pregunta === 'booleano') {
    return (
      <div className="flex flex-col">
        <div className="grid grid-cols-1 gap-4 mb-8">
          {([{ label: 'Sí', value: true }, { label: 'No', value: false }] as const).map((opt, idx) => {
            const sel = selectedBoolean === opt.value
            return (
              <button key={opt.label} type="button" disabled={isSubmitting}
                className={`group flex items-center text-left px-6 py-5 border transition-all duration-300 ${
                  sel ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/40 hover:border-primary/50 bg-white/50'
                }`}
                onClick={() => setSelectedBoolean(opt.value)}>
                <span className={`w-8 h-8 shrink-0 flex items-center justify-center border font-bold text-xs tracking-wider mr-6 transition-colors ${
                  sel ? 'border-primary bg-primary text-white' : 'border-outline-variant/50 text-muted group-hover:border-primary/50 group-hover:text-primary'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="font-serif text-lg">{opt.label}</span>
              </button>
            )
          })}
        </div>
        {renderActionBar(isSubmitting || (required && selectedBoolean === null), () => onAnswer(selectedBoolean === null ? undefined : selectedBoolean))}
      </div>
    )
  }

  // ─── TEXTO CORTO ──────────────────────────────────────
  if (question.tipo_pregunta === 'texto_corto') {
    const disabled = isSubmitting || (required && !textValue.trim())
    return (
      <div className="flex flex-col">
        <div className="mb-8">
          <input className={inputCls} placeholder={required ? 'Escribe aquí tu respuesta' : 'Escribe aquí tu respuesta (opcional)'}
            value={textValue} disabled={isSubmitting} onChange={e => setTextValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !disabled) onAnswer(textValue.trim() || undefined) }} />
        </div>
        {renderActionBar(disabled, () => onAnswer(textValue.trim() || undefined))}
      </div>
    )
  }

  // ─── TEXTO LARGO ──────────────────────────────────────
  if (question.tipo_pregunta === 'texto_largo') {
    const disabled = isSubmitting || (required && !longTextValue.trim())
    return (
      <div className="flex flex-col">
        <div className="mb-8">
          <textarea className={`${inputCls} min-h-[160px] resize-y`} placeholder={required ? 'Escribe tu respuesta' : 'Escribe tu respuesta (opcional)'}
            value={longTextValue} disabled={isSubmitting} onChange={e => setLongTextValue(e.target.value)} />
        </div>
        {renderActionBar(disabled, () => onAnswer(longTextValue.trim() || undefined))}
      </div>
    )
  }

  // ─── NÚMERO ───────────────────────────────────────────
  if (question.tipo_pregunta === 'numero') {
    const disabled = isSubmitting || (required && !numberValue.trim())
    return (
      <div className="flex flex-col">
        <div className="mb-8">
          <input type="number" className={inputCls} placeholder={required ? 'Ingresa el valor numérico' : 'Ingresa el valor numérico (opcional)'}
            value={numberValue} disabled={isSubmitting} onChange={e => setNumberValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !disabled) onAnswer(numberValue.trim() ? Number(numberValue) : undefined) }} />
        </div>
        {renderActionBar(disabled, () => onAnswer(numberValue.trim() ? Number(numberValue) : undefined))}
      </div>
    )
  }

  // ─── FECHA ────────────────────────────────────────────
  if (question.tipo_pregunta === 'fecha') {
    const disabled = isSubmitting || (required && !dateValue)
    return (
      <div className="flex flex-col">
        <div className="mb-8">
          <input type="date" className={inputCls} value={dateValue} disabled={isSubmitting}
            onChange={e => setDateValue(e.target.value)} />
        </div>
        {renderActionBar(disabled, () => onAnswer(dateValue || undefined))}
      </div>
    )
  }

  // ─── OPCIÓN ÚNICA ─────────────────────────────────────
  if (question.tipo_pregunta === 'opcion_unica') {
    const selOpt = sortedOptions.find(o => o.id === selectedSingleId)
    const needsFree = selOpt?.permite_texto_libre && !(freeText[selOpt.id] ?? '').trim()
    const disabled = isSubmitting || (required && !selOpt) || !!(selOpt && needsFree)

    return (
      <div className="flex flex-col">
        <div className="grid grid-cols-1 gap-4 mb-8">
          {sortedOptions.map((opt, idx) => {
            const sel = selectedSingleId === opt.id
            return (
              <div key={opt.id}>
                <button type="button" disabled={isSubmitting}
                  className={`group w-full flex items-center text-left px-6 py-5 border transition-all duration-300 ${
                    sel ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/40 hover:border-primary/50 bg-white/50'
                  }`}
                  onClick={() => setSelectedSingleId(opt.id)}>

                  <span className={`w-8 h-8 shrink-0 flex items-center justify-center border font-bold text-xs tracking-wider mr-6 transition-colors ${
                    sel ? 'border-primary bg-primary text-white' : 'border-outline-variant/50 text-muted group-hover:border-primary/50 group-hover:text-primary'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <div className="flex-1">
                    <span className="font-serif text-[17px] block leading-snug">{opt.etiqueta_opcion}</span>
                    {!!opt.permite_texto_libre && <span className="text-xs tracking-wider uppercase text-muted mt-2 block">Requiere detalle adicional</span>}
                  </div>
                </button>
                {sel && !!opt.permite_texto_libre && (
                  <div className="mt-3 ml-14 relative animate-fade-in">
                    <input className={inputCls} placeholder="Especifica tu respuesta..." autoFocus
                      value={freeText[opt.id] ?? ''} disabled={isSubmitting}
                      onChange={e => setFreeText(prev => ({ ...prev, [opt.id]: e.target.value }))} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {renderActionBar(disabled, () => onAnswer(selOpt ? { type: 'single_choice', optionId: selOpt.id, value: selOpt.valor_opcion, textFree: selOpt.permite_texto_libre ? (freeText[selOpt.id] ?? '').trim() : undefined } : undefined))}
      </div>
    )
  }

  // ─── OPCIÓN MÚLTIPLE ──────────────────────────────────
  if (question.tipo_pregunta === 'opcion_multiple') {
    const missingFree = sortedOptions.some(o => selectedMultiIds.includes(o.id) && o.permite_texto_libre && !(freeText[o.id] ?? '').trim())
    const disabled = isSubmitting || missingFree || (required && selectedMultiIds.length === 0)

    return (
      <div className="flex flex-col">
        <div className="grid grid-cols-1 gap-4 mb-8">
          {sortedOptions.map((opt, idx) => {
            const sel = selectedMultiIds.includes(opt.id)
            return (
              <div key={opt.id}>
                <button type="button" disabled={isSubmitting}
                  className={`group w-full flex items-center text-left px-6 py-5 border transition-all duration-300 ${
                    sel ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/40 hover:border-primary/50 bg-white/50'
                  }`}
                  onClick={() => setSelectedMultiIds(prev => prev.includes(opt.id) ? prev.filter(id => id !== opt.id) : [...prev, opt.id])}>

                  <span className={`w-8 h-8 shrink-0 flex items-center justify-center border font-bold text-xs tracking-wider mr-6 transition-colors ${
                    sel ? 'border-primary bg-primary text-white' : 'border-outline-variant/50 text-muted group-hover:border-primary/50 group-hover:text-primary'
                  }`}>
                    {sel ? <AppIcon name="check" className="text-[14px]" /> : String.fromCharCode(65 + idx)}
                  </span>
                  <div className="flex-1">
                    <span className="font-serif text-[17px] block leading-snug">{opt.etiqueta_opcion}</span>
                    {!!opt.permite_texto_libre && <span className="text-xs tracking-wider uppercase text-muted mt-2 block">Requiere detalle adicional</span>}
                  </div>
                </button>
                {sel && !!opt.permite_texto_libre && (
                  <div className="mt-3 ml-14 relative animate-fade-in">
                    <input className={inputCls} placeholder="Especifica tu respuesta..." autoFocus
                      value={freeText[opt.id] ?? ''} disabled={isSubmitting}
                      onChange={e => setFreeText(prev => ({ ...prev, [opt.id]: e.target.value }))} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {renderActionBar(disabled, () => onAnswer(selectedMultiIds.length > 0
          ? { type: 'multiple_choice', selections: sortedOptions.filter(o => selectedMultiIds.includes(o.id)).map(o => ({ optionId: o.id, value: o.valor_opcion, textFree: o.permite_texto_libre ? (freeText[o.id] ?? '').trim() : undefined })) }
          : undefined))}
      </div>
    )
  }

  return (
    <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
      Tipo de pregunta no soportado: {question.tipo_pregunta}
    </div>
  )
}
