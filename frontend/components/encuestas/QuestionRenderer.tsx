'use client'

import type { EncuestaPregunta } from '@/lib/encuestas'
import type { AnswerValue, SingleChoiceAnswer, MultipleChoiceAnswer } from '@/lib/surveyRules'

interface Props {
  question: EncuestaPregunta
  value: AnswerValue | undefined
  onChange: (val: AnswerValue) => void
  required: boolean
}

export function QuestionRenderer({ question, value, onChange, required }: Props) {
  return (
    <div className="rounded-xl border border-[#d8cabb] bg-white p-5">
      <label className="mb-1 block text-sm font-semibold text-[#2b1710]">
        {question.texto_pregunta}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {question.texto_ayuda && (
        <p className="mb-3 text-xs text-[#a08c7a]">{question.texto_ayuda}</p>
      )}

      {question.tipo_pregunta === 'texto_corto' && (
        <input
          type="text"
          value={(value as string) ?? ''}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-lg border border-[#d8cabb] px-3 py-2.5 text-sm text-[#2b1710] focus:outline-none focus:ring-2 focus:ring-[#c28a3a]/30"
        />
      )}

      {question.tipo_pregunta === 'texto_largo' && (
        <textarea
          rows={4}
          value={(value as string) ?? ''}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-lg border border-[#d8cabb] px-3 py-2.5 text-sm text-[#2b1710] focus:outline-none focus:ring-2 focus:ring-[#c28a3a]/30"
        />
      )}

      {question.tipo_pregunta === 'numero' && (
        <input
          type="number"
          value={(value as number) ?? ''}
          onChange={e => onChange(e.target.value ? Number(e.target.value) : '')}
          className="w-full rounded-lg border border-[#d8cabb] px-3 py-2.5 text-sm text-[#2b1710] focus:outline-none focus:ring-2 focus:ring-[#c28a3a]/30"
        />
      )}

      {question.tipo_pregunta === 'fecha' && (
        <input
          type="date"
          value={(value as string) ?? ''}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-lg border border-[#d8cabb] px-3 py-2.5 text-sm text-[#2b1710] focus:outline-none focus:ring-2 focus:ring-[#c28a3a]/30"
        />
      )}

      {question.tipo_pregunta === 'booleano' && (
        <div className="flex gap-3">
          {[
            { label: 'Sí', val: true },
            { label: 'No', val: false },
          ].map(opt => (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange(opt.val)}
              className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
                value === opt.val
                  ? 'border-[#2b1710] bg-[#2b1710] text-white'
                  : 'border-[#d8cabb] text-[#5a3424] hover:bg-[#faf9f5]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {question.tipo_pregunta === 'opcion_unica' && (
        <div className="space-y-2">
          {question.opciones.map(opc => {
            const selected = (value as SingleChoiceAnswer | undefined)?.optionId === opc.id
            return (
              <div key={opc.id}>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      type: 'single_choice',
                      optionId: opc.id,
                      value: opc.valor_opcion,
                    })
                  }
                  className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
                    selected
                      ? 'border-[#2b1710] bg-[#2b1710] text-white'
                      : 'border-[#d8cabb] text-[#5a3424] hover:bg-[#faf9f5]'
                  }`}
                >
                  {opc.etiqueta_opcion}
                </button>
                {selected && opc.permite_texto_libre && (
                  <input
                    type="text"
                    placeholder="Especifique..."
                    value={(value as SingleChoiceAnswer)?.textFree ?? ''}
                    onChange={e =>
                      onChange({
                        ...(value as SingleChoiceAnswer),
                        textFree: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[#d8cabb] px-3 py-2 text-sm text-[#2b1710]"
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      {question.tipo_pregunta === 'opcion_multiple' && (
        <div className="space-y-2">
          {question.opciones.map(opc => {
            const currentVal = value as MultipleChoiceAnswer | undefined
            const sel = currentVal?.selections?.find(s => s.optionId === opc.id)
            const isChecked = !!sel

            const toggle = () => {
              const prev = currentVal?.selections ?? []
              if (isChecked) {
                onChange({
                  type: 'multiple_choice',
                  selections: prev.filter(s => s.optionId !== opc.id),
                })
              } else {
                onChange({
                  type: 'multiple_choice',
                  selections: [...prev, { optionId: opc.id, value: opc.valor_opcion }],
                })
              }
            }

            return (
              <div key={opc.id}>
                <button
                  type="button"
                  onClick={toggle}
                  className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
                    isChecked
                      ? 'border-[#2b1710] bg-[#2b1710]/10 text-[#2b1710]'
                      : 'border-[#d8cabb] text-[#5a3424] hover:bg-[#faf9f5]'
                  }`}
                >
                  <span className="mr-2">{isChecked ? '☑' : '☐'}</span>
                  {opc.etiqueta_opcion}
                </button>
                {isChecked && opc.permite_texto_libre && (
                  <input
                    type="text"
                    placeholder="Especifique..."
                    value={sel?.textFree ?? ''}
                    onChange={e => {
                      const prev = currentVal?.selections ?? []
                      onChange({
                        type: 'multiple_choice',
                        selections: prev.map(s =>
                          s.optionId === opc.id ? { ...s, textFree: e.target.value } : s
                        ),
                      })
                    }}
                    className="mt-1 w-full rounded-lg border border-[#d8cabb] px-3 py-2 text-sm text-[#2b1710]"
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
