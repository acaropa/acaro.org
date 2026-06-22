'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { PERMISSIONS } from '@/lib/permissions'
import { encuestasApi, type Encuesta } from '@/lib/encuestas'
import { Modal } from '@/components/ui/Modal'

const stateLabels: Record<string, string> = {
  borrador: 'Borrador',
  pendiente_revision: 'En revisión',
  publicada: 'Publicada',
  cerrada: 'Cerrada',
  archivada: 'Archivada',
}

const stateColors: Record<string, string> = {
  borrador: 'bg-yellow-100 text-yellow-800',
  pendiente_revision: 'bg-blue-100 text-blue-800',
  publicada: 'bg-green-100 text-green-800',
  cerrada: 'bg-red-100 text-red-800',
  archivada: 'bg-gray-100 text-gray-600',
}

const tabs = [
  { estado: '', label: 'Todas' },
  { estado: 'borrador', label: 'Borradores' },
  { estado: 'publicada', label: 'Publicadas' },
  { estado: 'cerrada', label: 'Cerradas' },
]

export default function AdminEncuestas() {
  const { can } = useAuth()
  const canCreate = can(PERMISSIONS.ENCUESTAS_CREATE)
  const canDelete = can(PERMISSIONS.ENCUESTAS_DELETE)
  const canDuplicate = can(PERMISSIONS.ENCUESTAS_DUPLICATE, PERMISSIONS.ENCUESTAS_CREATE)
  const canPublish = can(PERMISSIONS.ENCUESTAS_PUBLISH)

  const [encuestas, setEncuestas] = useState<Encuesta[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('')
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Encuesta | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const copyLink = (enc: Encuesta) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://acaro.org'
    const url = `${origin}/encuestas/responder?slug=${enc.slug}`
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(enc.id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setEncuestas(await encuestasApi.list())
    } catch { /* empty */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const filtered = useMemo(() => {
    let list = encuestas
    if (activeTab) list = list.filter(e => e.estado === activeTab)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(e => e.titulo.toLowerCase().includes(q))
    }
    return list
  }, [encuestas, activeTab, search])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await encuestasApi.remove(deleteTarget.id)
      setEncuestas(prev => prev.filter(e => e.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch { /* empty */ } finally {
      setDeleting(false)
    }
  }

  const handleDuplicate = async (enc: Encuesta) => {
    try {
      const copy = await encuestasApi.duplicate(enc.id)
      setEncuestas(prev => [copy, ...prev])
    } catch { /* empty */ }
  }

  const handleChangeEstado = async (enc: Encuesta, estado: string) => {
    try {
      const updated = await encuestasApi.changeEstado(enc.id, estado)
      setEncuestas(prev => prev.map(e => (e.id === updated.id ? { ...e, ...updated } : e)))
    } catch { /* empty */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2b1710]">Encuestas</h1>
          <p className="text-sm text-[#765e50]">Gestiona las encuestas de ACARO</p>
        </div>
        {canCreate && (
          <Link
            href="/admin/encuestas/nueva"
            className="inline-flex items-center gap-2 rounded-lg bg-[#2b1710] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3d2318]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nueva encuesta
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex gap-1 rounded-lg border border-[#d8cabb] bg-[#fbf7f0] p-1">
          {tabs.map(tab => (
            <button
              key={tab.estado}
              onClick={() => setActiveTab(tab.estado)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === tab.estado
                  ? 'bg-[#2b1710] text-white'
                  : 'text-[#5a3424] hover:bg-[#f0e8dd]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Buscar encuesta..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-9 rounded-lg border border-[#d8cabb] bg-white px-3 text-sm text-[#2b1710] focus:outline-none focus:ring-2 focus:ring-[#a66f2e]/30 sm:w-64"
        />
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-[#765e50]">Cargando encuestas...</p>
      ) : !filtered.length ? (
        <p className="py-12 text-center text-sm text-[#765e50]">No hay encuestas para mostrar.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#d8cabb]">
          <table className="w-full text-sm">
            <thead className="bg-[#fbf7f0] text-left text-[11px] font-semibold uppercase tracking-wider text-[#765e50]">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="hidden px-4 py-3 md:table-cell">Estado</th>
                <th className="hidden px-4 py-3 lg:table-cell">Preguntas</th>
                <th className="hidden px-4 py-3 lg:table-cell">Respuestas</th>
                <th className="hidden px-4 py-3 xl:table-cell">Creador</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede6db]">
              {filtered.map(enc => (
                <tr key={enc.id} className="bg-white transition-colors hover:bg-[#fefcf8]">
                  <td className="px-4 py-3 font-medium text-[#2b1710]">
                    <Link href={`/admin/encuestas/editar?id=${enc.id}`} className="hover:underline">
                      {enc.titulo}
                    </Link>
                    <p className="mt-0.5 text-xs text-[#a08c7a]">/{enc.slug}</p>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${stateColors[enc.estado] ?? ''}`}>
                      {stateLabels[enc.estado] ?? enc.estado}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-[#765e50] lg:table-cell">{enc.question_count ?? 0}</td>
                  <td className="hidden px-4 py-3 text-[#765e50] lg:table-cell">{enc.response_count ?? 0}</td>
                  <td className="hidden px-4 py-3 text-xs text-[#765e50] xl:table-cell">{enc.creado_por_nombre ?? enc.creado_por_email}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/encuestas/editar?id=${enc.id}`}
                        className="rounded-md p-1.5 text-[#5a3424] hover:bg-[#f0e8dd]"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </Link>
                      <Link
                        href={`/admin/encuestas/resultados?id=${enc.id}`}
                        className="rounded-md p-1.5 text-[#5a3424] hover:bg-[#f0e8dd]"
                        title="Resultados"
                      >
                        <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                      </Link>
                      {enc.estado === 'publicada' && (
                        <button
                          onClick={() => copyLink(enc)}
                          className="rounded-md p-1.5 text-[#5a3424] hover:bg-[#f0e8dd]"
                          title={copiedId === enc.id ? '¡Copiado!' : 'Copiar enlace'}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {copiedId === enc.id ? 'check' : 'link'}
                          </span>
                        </button>
                      )}
                      {canPublish && enc.estado === 'borrador' && (
                        <button
                          onClick={() => handleChangeEstado(enc, 'publicada')}
                          className="rounded-md p-1.5 text-green-700 hover:bg-green-50"
                          title="Publicar"
                        >
                          <span className="material-symbols-outlined text-[18px]">publish</span>
                        </button>
                      )}
                      {canPublish && enc.estado === 'publicada' && (
                        <button
                          onClick={() => handleChangeEstado(enc, 'cerrada')}
                          className="rounded-md p-1.5 text-orange-700 hover:bg-orange-50"
                          title="Cerrar"
                        >
                          <span className="material-symbols-outlined text-[18px]">lock</span>
                        </button>
                      )}
                      {canDuplicate && (
                        <button
                          onClick={() => handleDuplicate(enc)}
                          className="rounded-md p-1.5 text-[#5a3424] hover:bg-[#f0e8dd]"
                          title="Duplicar"
                        >
                          <span className="material-symbols-outlined text-[18px]">content_copy</span>
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeleteTarget(enc)}
                          className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                          title="Eliminar"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Eliminar encuesta">
        <p className="mb-4 text-sm text-[#5a3424]">
          ¿Seguro que deseas eliminar <strong>{deleteTarget?.titulo}</strong>?
          Se eliminarán todas sus preguntas, secciones y respuestas. Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setDeleteTarget(null)}
            className="rounded-lg border border-[#d8cabb] px-4 py-2 text-sm font-semibold text-[#5a3424] hover:bg-[#fbf7f0]"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
