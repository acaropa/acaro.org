'use client'


import { AppIcon } from "@/components/ui/AppIcon"
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { encuestasApi, type EncuestaFull, type TipoPregunta } from '@/lib/encuestas'
import { QuestionBuilder, type QuestionFormData } from './QuestionBuilder'

const questionTypeLabels: Record<TipoPregunta, string> = {
  texto_corto: 'Texto corto',
  texto_largo: 'Texto largo',
  numero: 'Número',
  booleano: 'Sí / No',
  opcion_unica: 'Selección única',
  opcion_multiple: 'Selección múltiple',
  fecha: 'Fecha',
}

const steps = ['Datos generales', 'Preguntas', 'Revisión'] as const

function emptyQuestion(index: number): QuestionFormData {
  return {
    codigo_pregunta: `P${String(index + 1).padStart(2, '0')}`,
    texto_pregunta: '',
    tipo_pregunta: 'texto_corto',
    es_obligatoria: false,
    texto_ayuda: '',
    opciones: [],
  }
}

interface Props {
  encuestaId?: number
}

export function SurveyEditorWizard({ encuestaId }: Props) {
  const router = useRouter()
  const isNew = !encuestaId
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!!encuestaId)

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [visibilidad, setVisibilidad] = useState<string>('publica')
  const [requiereLogin, setRequiereLogin] = useState(false)
  const [permitirMultiples, setPermitirMultiples] = useState(false)
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState('')
  const [logoUrl, setLogoUrl] = useState('')

  const [questions, setQuestions] = useState<QuestionFormData[]>([emptyQuestion(0)])
  const [savedId, setSavedId] = useState<number | undefined>(encuestaId)

  const loadEncuesta = useCallback(async () => {
    if (!encuestaId) return
    try {
      setLoading(true)
      const data: EncuestaFull = await encuestasApi.getById(encuestaId)
      setTitulo(data.titulo)
      setDescripcion(data.descripcion ?? '')
      setVisibilidad(data.visibilidad)
      setRequiereLogin(!!data.requiere_login)
      setPermitirMultiples(!!data.permitir_multiples_respuestas)
      setMensajeConfirmacion(data.mensaje_confirmacion ?? '')
      setLogoUrl(data.logo_url ?? '')
      setSavedId(data.id)

      if (data.preguntas?.length) {
        setQuestions(
          data.preguntas.map(p => ({
            id: p.id,
            seccion_id: p.seccion_id,
            codigo_pregunta: p.codigo_pregunta ?? '',
            texto_pregunta: p.texto_pregunta,
            tipo_pregunta: p.tipo_pregunta,
            es_obligatoria: !!p.es_obligatoria,
            texto_ayuda: p.texto_ayuda ?? '',
            opciones: (p.opciones ?? []).map(o => ({
              id: o.id,
              valor_opcion: o.valor_opcion,
              etiqueta_opcion: o.etiqueta_opcion,
              permite_texto_libre: !!o.permite_texto_libre,
            })),
          }))
        )
      }
    } catch { /* empty */ } finally {
      setLoading(false)
    }
  }, [encuestaId])

  useEffect(() => { void loadEncuesta() }, [loadEncuesta])

  const handleSave = async () => {
    setSaving(true)
    try {
      let id = savedId
      const payload = {
        titulo,
        descripcion,
        visibilidad,
        requiere_login: requiereLogin,
        permitir_multiples_respuestas: permitirMultiples,
        mensaje_confirmacion: mensajeConfirmacion,
        logo_url: logoUrl,
      }

      if (id) {
        await encuestasApi.update(id, payload)
      } else {
        const created = await encuestasApi.create(payload)
        id = created.id
        setSavedId(id)
      }

      const secciones = [{ titulo: 'Sección principal', descripcion: null, posicion: 1 }]
      await encuestasApi.saveStructure(id!, {
        secciones,
        preguntas: questions.map((q, i) => ({
          ...q,
          posicion: i + 1,
          codigo_pregunta: q.codigo_pregunta || `P${String(i + 1).padStart(2, '0')}`,
        })),
      })

      router.push('/admin/encuestas')
    } catch { /* empty */ } finally {
      setSaving(false)
    }
  }

  const addQuestion = () => setQuestions(prev => [...prev, emptyQuestion(prev.length)])

  const removeQuestion = (idx: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx))
  }

  const updateQuestion = (idx: number, data: QuestionFormData) => {
    setQuestions(prev => prev.map((q, i) => (i === idx ? data : q)))
  }

  const moveQuestion = (idx: number, dir: -1 | 1) => {
    setQuestions(prev => {
      const next = [...prev]
      const target = idx + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  if (loading) {
    return <p className="py-12 text-center text-sm text-[#765e50]">Cargando encuesta...</p>
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2b1710]">
            {isNew ? 'Nueva encuesta' : 'Editar encuesta'}
          </h1>
          <p className="text-sm text-[#765e50]">Paso {step + 1} de {steps.length}: {steps[step]}</p>
        </div>
        <button
          onClick={() => router.push('/admin/encuestas')}
          className="rounded-lg border border-[#d8cabb] px-3 py-2 text-sm font-semibold text-[#5a3424] hover:bg-[#faf9f5]"
        >
          Cancelar
        </button>
      </div>

      <div className="flex gap-2">
        {steps.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={`flex-1 rounded-lg border px-3 py-2.5 text-center text-xs font-semibold transition-colors ${
              i === step
                ? 'border-[#2b1710] bg-[#2b1710] text-white'
                : i < step
                  ? 'border-green-300 bg-green-50 text-green-700'
                  : 'border-[#d8cabb] bg-white text-[#765e50]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4 rounded-xl border border-[#d8cabb] bg-white p-6">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#2b1710]">Título *</label>
            <input
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              className="w-full rounded-lg border border-[#d8cabb] px-3 py-2.5 text-sm text-[#2b1710] focus:outline-none focus:ring-2 focus:ring-[#c28a3a]/30"
              placeholder="Ej: Encuesta de satisfacción 2026"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#2b1710]">Descripción</label>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[#d8cabb] px-3 py-2.5 text-sm text-[#2b1710] focus:outline-none focus:ring-2 focus:ring-[#c28a3a]/30"
              placeholder="Breve descripción de la encuesta"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#2b1710]">Visibilidad</label>
              <select
                value={visibilidad}
                onChange={e => setVisibilidad(e.target.value)}
                className="w-full rounded-lg border border-[#d8cabb] px-3 py-2.5 text-sm text-[#2b1710]"
              >
                <option value="publica">Pública</option>
                <option value="interna">Interna</option>
                <option value="enlace_privado">Enlace privado</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#2b1710]">Logo URL</label>
              <input
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
                className="w-full rounded-lg border border-[#d8cabb] px-3 py-2.5 text-sm text-[#2b1710]"
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex items-center gap-2 text-sm text-[#2b1710]">
              <input
                type="checkbox"
                checked={requiereLogin}
                onChange={e => setRequiereLogin(e.target.checked)}
                className="h-4 w-4 rounded border-[#d8cabb] text-[#2b1710]"
              />
              Requiere login
            </label>
            <label className="flex items-center gap-2 text-sm text-[#2b1710]">
              <input
                type="checkbox"
                checked={permitirMultiples}
                onChange={e => setPermitirMultiples(e.target.checked)}
                className="h-4 w-4 rounded border-[#d8cabb] text-[#2b1710]"
              />
              Permitir múltiples respuestas
            </label>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#2b1710]">Mensaje de confirmación</label>
            <textarea
              value={mensajeConfirmacion}
              onChange={e => setMensajeConfirmacion(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-[#d8cabb] px-3 py-2.5 text-sm text-[#2b1710]"
              placeholder="Gracias por responder la encuesta."
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setStep(1)}
              disabled={!titulo.trim()}
              className="rounded-lg bg-[#2b1710] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#3d2318] disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <QuestionBuilder
              key={i}
              index={i}
              data={q}
              onChange={data => updateQuestion(i, data)}
              onRemove={() => removeQuestion(i)}
              onMoveUp={i > 0 ? () => moveQuestion(i, -1) : undefined}
              onMoveDown={i < questions.length - 1 ? () => moveQuestion(i, 1) : undefined}
            />
          ))}
          <button
            onClick={addQuestion}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#d8cabb] py-4 text-sm font-semibold text-[#5a3424] hover:border-[#c28a3a] hover:text-[#c28a3a]"
          >
            <AppIcon name="add" className="text-[18px]" />
            Agregar pregunta
          </button>
          <div className="flex justify-between">
            <button
              onClick={() => setStep(0)}
              className="rounded-lg border border-[#d8cabb] px-6 py-2.5 text-sm font-semibold text-[#5a3424] hover:bg-[#faf9f5]"
            >
              Anterior
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!questions.some(q => q.texto_pregunta.trim())}
              className="rounded-lg bg-[#2b1710] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#3d2318] disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 rounded-xl border border-[#d8cabb] bg-white p-6">
          <h2 className="text-lg font-bold text-[#2b1710]">Revisión</h2>
          <div className="space-y-2 text-sm text-[#5a3424]">
            <p><strong>Título:</strong> {titulo}</p>
            <p><strong>Descripción:</strong> {descripcion || '—'}</p>
            <p><strong>Visibilidad:</strong> {visibilidad}</p>
            <p><strong>Requiere login:</strong> {requiereLogin ? 'Sí' : 'No'}</p>
            <p><strong>Múltiples respuestas:</strong> {permitirMultiples ? 'Sí' : 'No'}</p>
          </div>
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-bold text-[#2b1710]">
              {questions.length} pregunta{questions.length !== 1 ? 's' : ''}
            </h3>
            <ol className="list-inside list-decimal space-y-1 text-sm text-[#5a3424]">
              {questions.filter(q => q.texto_pregunta.trim()).map((q, i) => (
                <li key={i}>
                  {q.texto_pregunta}
                  <span className="ml-2 text-xs text-[#a08c7a]">
                    ({questionTypeLabels[q.tipo_pregunta]}{q.es_obligatoria ? ', obligatoria' : ''})
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="rounded-lg border border-[#d8cabb] px-6 py-2.5 text-sm font-semibold text-[#5a3424] hover:bg-[#faf9f5]"
            >
              Anterior
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !titulo.trim()}
              className="rounded-lg bg-[#2b1710] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#3d2318] disabled:opacity-50"
            >
              {saving ? 'Guardando...' : isNew ? 'Crear encuesta' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
