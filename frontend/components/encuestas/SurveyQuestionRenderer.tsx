'use client'


import { AppIcon } from "@/components/ui/AppIcon"
import { useEffect, useMemo, useState } from 'react'
import type { EncuestaPregunta } from '@/lib/encuestas'
import type { AnswerValue, SingleChoiceAnswer, MultipleChoiceAnswer } from '@/lib/surveyRules'

interface Props {
  question: EncuestaPregunta
  initialValue?: AnswerValue
  required?: boolean
  continueLabel?: string
  onAnswer: (value?: AnswerValue) => void | Promise<void>
  isSubmitting?: boolean
}

const inputCls =
  'block w-full px-4 pb-2.5 pt-4 text-sm text-primary bg-[#efeeeb] hover:bg-[#e9e8e5] border-0 border-b border-[#81756f] appearance-none focus:outline-none focus:ring-0 focus:border-primary focus:bg-[#e9e8e5] transition-colors disabled:cursor-not-allowed disabled:opacity-60'

const primaryBtnCls =
  'inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-xs font-bold tracking-widest uppercase transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 shadow-lg'

const optionCls = (selected: boolean) =>
  `w-full flex items-start gap-4 px-5 py-4 border text-left transition-colors duration-150 ${
    selected
      ? 'border-accent bg-accent/5 text-primary'
      : 'border-primary/15 bg-surface hover:border-accent/40 hover:bg-accent/[0.02] text-primary'
  }`

export function SurveyQuestionRenderer({
  question,
  initialValue,
  required = false,
  continueLabel = 'Continuar',
  onAnswer,
  isSubmitting = false,
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
  }, [initialValue, question.id, question.tipo_pregunta])

  const sortedOptions = useMemo(
    () => [...(question.opciones ?? [])].sort((a, b) => a.posicion - b.posicion),
    [question.opciones]
  )

  const arrow = <AppIcon name="arrow_forward" className="text-[16px]" />

  // ─── BOOLEANO ─────────────────────────────────────────
  if (question.tipo_pregunta === 'booleano') {
    return (
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {([{ label: 'Sí', value: true }, { label: 'No', value: false }] as const).map(opt => (
            <button key={opt.label} type="button" disabled={isSubmitting}
              className={optionCls(selectedBoolean === opt.value)}
              onClick={() => setSelectedBoolean(opt.value)}>
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border ${
                selectedBoolean === opt.value ? 'border-accent bg-accent text-white' : 'border-[#81756f]'
              }`}>
                {selectedBoolean === opt.value && <AppIcon name="check" className="text-[14px]" />}
              </span>
              <span className="text-base font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
        <button type="button" className={primaryBtnCls} disabled={isSubmitting || (required && selectedBoolean === null)}
          onClick={() => onAnswer(selectedBoolean === null ? undefined : selectedBoolean)}>
          {isSubmitting ? 'Enviando...' : continueLabel} {!isSubmitting && arrow}
        </button>
      </div>
    )
  }

  // ─── TEXTO CORTO ──────────────────────────────────────
  if (question.tipo_pregunta === 'texto_corto') {
    const disabled = isSubmitting || (required && !textValue.trim())
    return (
      <div className="space-y-5">
        <input className={inputCls} placeholder={required ? 'Tu respuesta aquí...' : 'Tu respuesta aquí... (opcional)'}
          value={textValue} disabled={isSubmitting} onChange={e => setTextValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !disabled) onAnswer(textValue.trim() || undefined) }} />
        <button type="button" className={primaryBtnCls} disabled={disabled}
          onClick={() => onAnswer(textValue.trim() || undefined)}>
          {isSubmitting ? 'Enviando...' : continueLabel} {!isSubmitting && arrow}
        </button>
      </div>
    )
  }

  // ─── TEXTO LARGO ──────────────────────────────────────
  if (question.tipo_pregunta === 'texto_largo') {
    const disabled = isSubmitting || (required && !longTextValue.trim())
    return (
      <div className="space-y-5">
        <textarea className={`${inputCls} min-h-[140px] resize-y`} placeholder={required ? 'Escribe tu respuesta' : 'Escribe tu respuesta (opcional)'}
          value={longTextValue} disabled={isSubmitting} onChange={e => setLongTextValue(e.target.value)} />
        <button type="button" className={primaryBtnCls} disabled={disabled}
          onClick={() => onAnswer(longTextValue.trim() || undefined)}>
          {isSubmitting ? 'Enviando...' : continueLabel} {!isSubmitting && arrow}
        </button>
      </div>
    )
  }

  // ─── NÚMERO ───────────────────────────────────────────
  if (question.tipo_pregunta === 'numero') {
    const disabled = isSubmitting || (required && !numberValue.trim())
    return (
      <div className="space-y-5">
        <input type="number" className={inputCls} placeholder={required ? 'Escribe un número' : 'Escribe un número (opcional)'}
          value={numberValue} disabled={isSubmitting} onChange={e => setNumberValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !disabled) onAnswer(numberValue.trim() ? Number(numberValue) : undefined) }} />
        <button type="button" className={primaryBtnCls} disabled={disabled}
          onClick={() => onAnswer(numberValue.trim() ? Number(numberValue) : undefined)}>
          {isSubmitting ? 'Enviando...' : continueLabel} {!isSubmitting && arrow}
        </button>
      </div>
    )
  }

  // ─── FECHA ────────────────────────────────────────────
  if (question.tipo_pregunta === 'fecha') {
    const disabled = isSubmitting || (required && !dateValue)
    return (
      <div className="space-y-5">
        <input type="date" className={inputCls} value={dateValue} disabled={isSubmitting}
          onChange={e => setDateValue(e.target.value)} />
        <button type="button" className={primaryBtnCls} disabled={disabled}
          onClick={() => onAnswer(dateValue || undefined)}>
          {isSubmitting ? 'Enviando...' : continueLabel} {!isSubmitting && arrow}
        </button>
      </div>
    )
  }

  // ─── OPCIÓN ÚNICA ─────────────────────────────────────
  if (question.tipo_pregunta === 'opcion_unica') {
    const selOpt = sortedOptions.find(o => o.id === selectedSingleId)
    const needsFree = selOpt?.permite_texto_libre && !(freeText[selOpt.id] ?? '').trim()
    const disabled = isSubmitting || (required && !selOpt) || !!(selOpt && needsFree)

    return (
      <div className="space-y-4">
        {sortedOptions.map(opt => {
          const sel = selectedSingleId === opt.id
          return (
            <div key={opt.id}>
              <button type="button" disabled={isSubmitting} className={optionCls(sel)}
                onClick={() => setSelectedSingleId(opt.id)}>
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  sel ? 'border-accent bg-accent' : 'border-[#81756f]'
                }`}>
                  {sel && <span className="block h-2 w-2 rounded-full bg-white" />}
                </span>
                <div>
                  <p className="text-[15px] font-semibold">{opt.etiqueta_opcion}</p>
                  {opt.permite_texto_libre && <p className="mt-1 text-xs text-muted">Requiere detalle adicional.</p>}
                </div>
              </button>
              {sel && opt.permite_texto_libre && (
                <input className={`${inputCls} mt-2 ml-9`} placeholder="Especifica tu respuesta"
                  value={freeText[opt.id] ?? ''} disabled={isSubmitting}
                  onChange={e => setFreeText(prev => ({ ...prev, [opt.id]: e.target.value }))} />
              )}
            </div>
          )
        })}
        <button type="button" className={primaryBtnCls} disabled={disabled}
          onClick={() => onAnswer(selOpt ? { type: 'single_choice', optionId: selOpt.id, value: selOpt.valor_opcion, textFree: selOpt.permite_texto_libre ? (freeText[selOpt.id] ?? '').trim() : undefined } : undefined)}>
          {isSubmitting ? 'Enviando...' : continueLabel} {!isSubmitting && arrow}
        </button>
      </div>
    )
  }

  // ─── OPCIÓN MÚLTIPLE ──────────────────────────────────
  if (question.tipo_pregunta === 'opcion_multiple') {
    const missingFree = sortedOptions.some(o => selectedMultiIds.includes(o.id) && o.permite_texto_libre && !(freeText[o.id] ?? '').trim())
    const disabled = isSubmitting || missingFree || (required && selectedMultiIds.length === 0)

    return (
      <div className="space-y-4">
        {sortedOptions.map(opt => {
          const sel = selectedMultiIds.includes(opt.id)
          return (
            <div key={opt.id}>
              <button type="button" disabled={isSubmitting} className={optionCls(sel)}
                onClick={() => setSelectedMultiIds(prev => prev.includes(opt.id) ? prev.filter(id => id !== opt.id) : [...prev, opt.id])}>
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border ${
                  sel ? 'border-accent bg-accent text-white' : 'border-[#81756f] bg-white'
                }`}>
                  {sel && <AppIcon name="check" className="text-[14px]" />}
                </span>
                <div>
                  <p className="text-[15px] font-semibold">{opt.etiqueta_opcion}</p>
                  {opt.permite_texto_libre && <p className="mt-1 text-xs text-muted">Requiere detalle adicional.</p>}
                </div>
              </button>
              {sel && opt.permite_texto_libre && (
                <input className={`${inputCls} mt-2 ml-9`} placeholder="Especifica tu respuesta"
                  value={freeText[opt.id] ?? ''} disabled={isSubmitting}
                  onChange={e => setFreeText(prev => ({ ...prev, [opt.id]: e.target.value }))} />
              )}
            </div>
          )
        })}
        <button type="button" className={primaryBtnCls} disabled={disabled}
          onClick={() => onAnswer(selectedMultiIds.length > 0
            ? { type: 'multiple_choice', selections: sortedOptions.filter(o => selectedMultiIds.includes(o.id)).map(o => ({ optionId: o.id, value: o.valor_opcion, textFree: o.permite_texto_libre ? (freeText[o.id] ?? '').trim() : undefined })) }
            : undefined)}>
          {isSubmitting ? 'Enviando...' : continueLabel} {!isSubmitting && arrow}
        </button>
      </div>
    )
  }

  return (
    <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3">
      Tipo de pregunta no soportado: {question.tipo_pregunta}
    </div>
  )
}
