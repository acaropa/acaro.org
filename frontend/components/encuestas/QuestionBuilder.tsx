'use client'


import { AppIcon } from "@/components/ui/AppIcon"
import type { TipoPregunta } from '@/lib/encuestas'

export interface OptionFormData {
  id?: number
  valor_opcion: string
  etiqueta_opcion: string
  permite_texto_libre: boolean
}

export interface QuestionFormData {
  id?: number
  seccion_id?: number | null
  codigo_pregunta: string
  texto_pregunta: string
  tipo_pregunta: TipoPregunta
  es_obligatoria: boolean
  texto_ayuda: string
  opciones: OptionFormData[]
}

const typeOptions: { value: TipoPregunta; label: string }[] = [
  { value: 'texto_corto', label: 'Texto corto' },
  { value: 'texto_largo', label: 'Texto largo' },
  { value: 'numero', label: 'Número' },
  { value: 'booleano', label: 'Sí / No' },
  { value: 'opcion_unica', label: 'Selección única' },
  { value: 'opcion_multiple', label: 'Selección múltiple' },
  { value: 'fecha', label: 'Fecha' },
]

const hasOptions = (tipo: TipoPregunta) => tipo === 'opcion_unica' || tipo === 'opcion_multiple'

interface Props {
  index: number
  data: QuestionFormData
  onChange: (data: QuestionFormData) => void
  onRemove: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}

export function QuestionBuilder({ index, data, onChange, onRemove, onMoveUp, onMoveDown }: Props) {
  const set = <K extends keyof QuestionFormData>(key: K, value: QuestionFormData[K]) =>
    onChange({ ...data, [key]: value })

  const addOption = () =>
    set('opciones', [
      ...data.opciones,
      { valor_opcion: '', etiqueta_opcion: '', permite_texto_libre: false },
    ])

  const updateOption = (i: number, field: keyof OptionFormData, value: string | boolean) => {
    const next = data.opciones.map((o, idx) => {
      if (idx !== i) return o
      const updated = { ...o, [field]: value }
      if (field === 'etiqueta_opcion' && typeof value === 'string') {
        updated.valor_opcion = value
      }
      return updated
    })
    set('opciones', next)
  }

  const removeOption = (i: number) => set('opciones', data.opciones.filter((_, idx) => idx !== i))

  return (
    <div className="rounded-xl border border-[#d8cabb] bg-white">
      <div className="flex items-center justify-between border-b border-[#ede6db] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2b1710] text-xs font-bold text-white">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-[#2b1710]">
            {data.codigo_pregunta || `P${String(index + 1).padStart(2, '0')}`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onMoveUp && (
            <button onClick={onMoveUp} className="rounded p-1 text-[#765e50] hover:bg-[#f0e8dd]" title="Mover arriba">
              <AppIcon name="arrow_upward" className="text-[18px]" />
            </button>
          )}
          {onMoveDown && (
            <button onClick={onMoveDown} className="rounded p-1 text-[#765e50] hover:bg-[#f0e8dd]" title="Mover abajo">
              <AppIcon name="arrow_downward" className="text-[18px]" />
            </button>
          )}
          <button onClick={onRemove} className="rounded p-1 text-red-500 hover:bg-red-50" title="Eliminar">
            <AppIcon name="close" className="text-[18px]" />
          </button>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#765e50]">Texto de la pregunta *</label>
            <input
              value={data.texto_pregunta}
              onChange={e => set('texto_pregunta', e.target.value)}
              className="w-full rounded-lg border border-[#d8cabb] px-3 py-2 text-sm text-[#2b1710] focus:outline-none focus:ring-2 focus:ring-[#a66f2e]/30"
              placeholder="Escribe tu pregunta aquí"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#765e50]">Tipo</label>
            <select
              value={data.tipo_pregunta}
              onChange={e => {
                const tipo = e.target.value as TipoPregunta
                set('tipo_pregunta', tipo)
                if (!hasOptions(tipo)) set('opciones', [])
              }}
              className="w-full rounded-lg border border-[#d8cabb] px-3 py-2 text-sm text-[#2b1710]"
            >
              {typeOptions.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#765e50]">Código</label>
            <input
              value={data.codigo_pregunta}
              onChange={e => set('codigo_pregunta', e.target.value)}
              className="w-full rounded-lg border border-[#d8cabb] px-3 py-2 text-sm text-[#2b1710]"
              placeholder={`P${String(index + 1).padStart(2, '0')}`}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#765e50]">Texto de ayuda</label>
            <input
              value={data.texto_ayuda}
              onChange={e => set('texto_ayuda', e.target.value)}
              className="w-full rounded-lg border border-[#d8cabb] px-3 py-2 text-sm text-[#2b1710]"
              placeholder="Instrucción para el respondente"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-[#2b1710]">
          <input
            type="checkbox"
            checked={data.es_obligatoria}
            onChange={e => set('es_obligatoria', e.target.checked)}
            className="h-4 w-4 rounded border-[#d8cabb] text-[#2b1710]"
          />
          Obligatoria
        </label>

        {hasOptions(data.tipo_pregunta) && (
          <div className="space-y-2 rounded-lg border border-dashed border-[#d1d5db] bg-white p-3">
            <p className="text-xs font-semibold text-[#765e50]">Opciones de respuesta</p>
            {data.opciones.map((opc, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-[#a08c7a]">{i + 1}.</span>
                <input
                  value={opc.etiqueta_opcion}
                  onChange={e => updateOption(i, 'etiqueta_opcion', e.target.value)}
                  className="flex-1 rounded border border-[#d8cabb] px-2.5 py-1.5 text-sm text-[#2b1710]"
                  placeholder="Texto de la opción"
                />
                <label className="flex items-center gap-1 text-xs text-[#765e50]">
                  <input
                    type="checkbox"
                    checked={opc.permite_texto_libre}
                    onChange={e => updateOption(i, 'permite_texto_libre', e.target.checked)}
                    className="h-3.5 w-3.5"
                  />
                  Otro
                </label>
                <button
                  onClick={() => removeOption(i)}
                  className="rounded p-0.5 text-red-400 hover:text-red-600"
                >
                  <AppIcon name="close" className="text-[16px]" />
                </button>
              </div>
            ))}
            <button
              onClick={addOption}
              className="text-xs font-semibold text-[#a66f2e] hover:underline"
            >
              + Agregar opción
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
