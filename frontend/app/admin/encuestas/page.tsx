'use client'


import { AppIcon } from "@/components/ui/AppIcon"
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
  const [changingId, setChangingId] = useState<number | null>(null)
  const [statusError, setStatusError] = useState('')

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
    setChangingId(enc.id)
    setStatusError('')
    try {
      const updated = await encuestasApi.changeEstado(enc.id, estado)
      setEncuestas(prev => prev.map(e => (e.id === updated.id ? { ...e, ...updated } : e)))
    } catch {
      setStatusError('No se pudo cambiar el estado de la encuesta. Inténtalo nuevamente.')
    } finally {
      setChangingId(null)
    }
  }

  const totalRespuestas = encuestas.reduce((sum, e) => sum + (e.response_count ?? 0), 0)
  const totalPublicadas = encuestas.filter(e => e.estado === 'publicada').length
  const totalBorradores = encuestas.filter(e => e.estado === 'borrador').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2b1710]">Encuestas</h1>
          <p className="mt-1 text-sm text-[#765e50]">Gestiona las encuestas de ACARO</p>
        </div>
        {canCreate && (
          <Link
            href="/admin/encuestas/nueva"
            className="inline-flex items-center gap-2 rounded-lg bg-[#2b1710] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3d2318]"
          >
            <AppIcon name="add" className="text-[18px]" />
            Nueva encuesta
          </Link>
        )}
      </div>

      {/* Stats cards */}
      {!loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total', value: encuestas.length, icon: 'assignment', color: 'text-[#2b1710]', bg: 'bg-[#f5f0ea]' },
            { label: 'Publicadas', value: totalPublicadas, icon: 'public', color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Borradores', value: totalBorradores, icon: 'edit_note', color: 'text-yellow-700', bg: 'bg-yellow-50' },
            { label: 'Respuestas', value: totalRespuestas, icon: 'how_to_vote', color: 'text-[#a66f2e]', bg: 'bg-[#fdf6ec]' },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl border border-[#e5ddd2] bg-white p-5">
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                <AppIcon name={stat.icon} className={`text-[20px] ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-[#2b1710]">{stat.value}</p>
              <p className="text-xs font-medium text-[#765e50]">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-1 rounded-lg border border-[#e5e7eb] bg-white p-1">
          {tabs.map(tab => (
            <button
              key={tab.estado}
              onClick={() => setActiveTab(tab.estado)}
              className={`rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
                activeTab === tab.estado
                  ? 'bg-[#2b1710] text-white'
                  : 'text-[#5a3424] hover:bg-[#f3f4f6]'
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
          className="h-10 rounded-lg border border-[#d8cabb] bg-white px-4 text-sm text-[#2b1710] focus:outline-none focus:ring-2 focus:ring-[#a66f2e]/30 sm:w-72"
        />
      </div>

      {statusError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {statusError}
        </p>
      )}

      {loading ? (
        <p className="py-16 text-center text-sm text-[#765e50]">Cargando encuestas...</p>
      ) : !filtered.length ? (
        <p className="py-16 text-center text-sm text-[#765e50]">No hay encuestas para mostrar.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#d8cabb]">
          <table className="w-full">
            <thead className="bg-[#f5f0ea] text-left text-[11px] font-semibold uppercase tracking-wider text-[#765e50]">
              <tr>
                <th className="px-6 py-4">Título</th>
                <th className="hidden px-6 py-4 md:table-cell">Estado</th>
                <th className="hidden px-6 py-4 lg:table-cell">Preguntas</th>
                <th className="hidden px-6 py-4 lg:table-cell">Respuestas</th>
                <th className="hidden px-6 py-4 xl:table-cell">Creador</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede6db]">
              {filtered.map(enc => (
                <tr key={enc.id} className="bg-white transition-colors hover:bg-[#faf7f3]">
                  <td className="px-6 py-5 font-medium text-[#2b1710]">
                    <Link href={`/admin/encuestas/editar?id=${enc.id}`} className="text-base font-semibold hover:underline">
                      {enc.titulo}
                    </Link>
                    <p className="mt-1 text-xs text-[#a08c7a]">/{enc.slug}</p>
                  </td>
                  <td className="hidden px-6 py-5 md:table-cell">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${stateColors[enc.estado] ?? ''}`}>
                      {stateLabels[enc.estado] ?? enc.estado}
                    </span>
                  </td>
                  <td className="hidden px-6 py-5 text-sm text-[#765e50] lg:table-cell">{enc.question_count ?? 0}</td>
                  <td className="hidden px-6 py-5 text-sm text-[#765e50] lg:table-cell">{enc.response_count ?? 0}</td>
                  <td className="hidden px-6 py-5 text-sm text-[#765e50] xl:table-cell">{enc.creado_por_nombre ?? enc.creado_por_email}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/encuestas/editar?id=${enc.id}`}
                        className="rounded-lg p-2 text-[#5a3424] hover:bg-[#f0e8dd]"
                        title="Editar"
                      >
                        <AppIcon name="edit" className="text-[20px]" />
                      </Link>
                      <Link
                        href={`/admin/encuestas/resultados?id=${enc.id}`}
                        className="rounded-lg p-2 text-[#5a3424] hover:bg-[#f0e8dd]"
                        title="Resultados"
                      >
                        <AppIcon name="bar_chart" className="text-[20px]" />
                      </Link>
                      {enc.estado === 'publicada' && (
                        <button
                          onClick={() => copyLink(enc)}
                          className="rounded-lg p-2 text-[#5a3424] hover:bg-[#f0e8dd]"
                          title={copiedId === enc.id ? '¡Copiado!' : 'Copiar enlace'}
                        >
                          <AppIcon name={copiedId === enc.id ? 'check' : 'link'} className="text-[20px]" />
                        </button>
                      )}
                      {canPublish && enc.estado === 'borrador' && (
                        <button
                          onClick={() => handleChangeEstado(enc, 'publicada')}
                          disabled={changingId === enc.id}
                          className="rounded-lg p-2 text-green-700 hover:bg-green-50 disabled:cursor-wait disabled:opacity-50"
                          title="Publicar"
                        >
                          <AppIcon name="publish" className="text-[20px]" />
                        </button>
                      )}
                      {canPublish && enc.estado === 'publicada' && (
                        <button
                          onClick={() => handleChangeEstado(enc, 'cerrada')}
                          disabled={changingId === enc.id}
                          className="rounded-lg p-2 text-orange-700 hover:bg-orange-50 disabled:cursor-wait disabled:opacity-50"
                          title="Cerrar"
                        >
                          <AppIcon name="lock" className="text-[20px]" />
                        </button>
                      )}
                      {canPublish && enc.estado === 'cerrada' && (
                        <button
                          onClick={() => handleChangeEstado(enc, 'publicada')}
                          disabled={changingId === enc.id}
                          className="rounded-lg p-2 text-green-700 hover:bg-green-50 disabled:cursor-wait disabled:opacity-50"
                          title="Volver a publicar"
                          aria-label={`Volver a publicar ${enc.titulo}`}
                        >
                          <AppIcon name="publish" className="text-[20px]" />
                        </button>
                      )}
                      {canDuplicate && (
                        <button
                          onClick={() => handleDuplicate(enc)}
                          className="rounded-lg p-2 text-[#5a3424] hover:bg-[#f0e8dd]"
                          title="Duplicar"
                        >
                          <AppIcon name="content_copy" className="text-[20px]" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeleteTarget(enc)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          title="Eliminar"
                        >
                          <AppIcon name="delete" className="text-[20px]" />
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
            className="rounded-lg border border-[#d8cabb] px-4 py-2 text-sm font-semibold text-[#5a3424] hover:bg-[#f3f4f6]"
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
