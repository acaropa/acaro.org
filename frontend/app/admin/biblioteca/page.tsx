'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { EmptyState } from '@/components/ui/EmptyState';

type DocumentState =
  | 'borrador'
  | 'pendiente_revision'
  | 'requiere_correccion'
  | 'aprobado'
  | 'rechazado'
  | 'archivado';

interface LibraryRecord {
  id: number;
  titulo: string;
  descripcion: string | null;
  archivo_url: string;
  categoria: string;
  estado: DocumentState;
  visibilidad: 'publica' | 'interna';
  creado_por: number;
  creado_por_email: string;
  revisado_por_email: string | null;
  fecha_creacion: string;
  fecha_revision: string | null;
  observacion_revision: string | null;
}

const emptyForm = {
  titulo: '',
  descripcion: '',
  archivo_url: '',
  categoria: '',
  visibilidad: 'interna' as 'publica' | 'interna',
};

const stateLabels: Record<DocumentState, string> = {
  borrador: 'Borrador',
  pendiente_revision: 'Pendiente de revisión',
  requiere_correccion: 'Requiere corrección',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  archivado: 'Archivado',
};

const reviewTabs: Array<{ state: DocumentState; label: string }> = [
  { state: 'pendiente_revision', label: 'Documentos pendientes' },
  { state: 'requiere_correccion', label: 'Correcciones solicitadas' },
  { state: 'aprobado', label: 'Aprobados' },
  { state: 'rechazado', label: 'Rechazados' },
  { state: 'archivado', label: 'Archivados' },
];

export default function AdminBiblioteca() {
  const { user, can } = useAuth();
  const canReview = can(PERMISSIONS.BIBLIOTECA_REVIEW);
  const canDelete = can(PERMISSIONS.BIBLIOTECA_DELETE);
  const [documents, setDocuments] = useState<LibraryRecord[]>([]);
  const [activeState, setActiveState] = useState<DocumentState>('pendiente_revision');
  const [mineOnly, setMineOnly] = useState(!canReview);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<LibraryRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (activeState) params.set('status', activeState);
    if (mineOnly) params.set('scope', 'mine');
    try {
      setDocuments(await api.get<LibraryRecord[]>(`/biblioteca?${params}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la biblioteca');
    } finally {
      setLoading(false);
    }
  }, [activeState, mineOnly]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const title = canReview && !mineOnly ? 'Revisión de biblioteca' : 'Mis documentos';
  const editableStates: DocumentState[] = ['borrador', 'pendiente_revision', 'requiere_correccion'];

  function resetForm() {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(document: LibraryRecord) {
    setEditing(document);
    setForm({
      titulo: document.titulo,
      descripcion: document.descripcion || '',
      archivo_url: document.archivo_url,
      categoria: document.categoria,
      visibilidad: document.visibilidad,
    });
    setShowForm(true);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.put(`/biblioteca/${editing.id}`, form);
        if (editing.estado === 'requiere_correccion') {
          await api.post(`/biblioteca/${editing.id}/resubmit`, {});
        }
      } else {
        await api.post('/biblioteca', form);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el documento');
    } finally {
      setSaving(false);
    }
  }

  async function review(document: LibraryRecord, action: string) {
    let observation = '';
    if (action === 'reject' || action === 'request_changes') {
      observation = prompt('Escribe la observación para el autor:')?.trim() || '';
      if (!observation) return;
    }
    try {
      await api.post(`/biblioteca/${document.id}/review`, { action, observation });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la revisión');
    }
  }

  async function remove(document: LibraryRecord) {
    if (!confirm(`¿Eliminar "${document.titulo}"?`)) return;
    try {
      await api.delete(`/biblioteca/${document.id}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el documento');
    }
  }

  const tabs = useMemo(() => reviewTabs, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted">
            {canReview && !mineOnly
              ? 'Aprueba, rechaza o solicita correcciones a los documentos recibidos.'
              : 'Consulta el estado de tus documentos y reenvía las correcciones.'}
          </p>
        </div>
        <div className="flex gap-2">
          {canReview && (
            <button
              type="button"
              onClick={() => setMineOnly(value => !value)}
              className="rounded-md border border-border px-4 py-2 text-sm"
            >
              {mineOnly ? 'Ver revisión' : 'Mis documentos'}
            </button>
          )}
          <button
            type="button"
            onClick={() => showForm ? resetForm() : setShowForm(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            {showForm ? 'Cancelar' : '+ Subir documento'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab.state}
            type="button"
            onClick={() => setActiveState(tab.state)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              activeState === tab.state ? 'bg-primary text-primary-foreground' : 'bg-surface text-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={save} className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-6 sm:grid-cols-2">
          <input required placeholder="Título" value={form.titulo}
            onChange={event => setForm(current => ({ ...current, titulo: event.target.value }))}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm sm:col-span-2" />
          <input required placeholder="Categoría" value={form.categoria}
            onChange={event => setForm(current => ({ ...current, categoria: event.target.value }))}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
          <select value={form.visibilidad}
            onChange={event => setForm(current => ({ ...current, visibilidad: event.target.value as 'publica' | 'interna' }))}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm">
            <option value="interna">Interna</option>
            <option value="publica">Pública al aprobarse</option>
          </select>
          <input required type="url" placeholder="URL del archivo" value={form.archivo_url}
            onChange={event => setForm(current => ({ ...current, archivo_url: event.target.value }))}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm sm:col-span-2" />
          <textarea placeholder="Descripción" value={form.descripcion}
            onChange={event => setForm(current => ({ ...current, descripcion: event.target.value }))}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm sm:col-span-2" />
          <div className="sm:col-span-2 flex justify-end">
            <button disabled={saving} className="rounded-md bg-primary px-5 py-2 text-sm text-primary-foreground disabled:opacity-50">
              {saving ? 'Guardando...' : editing?.estado === 'requiere_correccion' ? 'Guardar y reenviar' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted">Cargando...</p>
      ) : documents.length === 0 ? (
        <EmptyState title="Sin documentos" description="No hay documentos en este estado." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3">Autor</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Visibilidad</th>
                <th className="px-4 py-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {documents.map(document => {
                const isOwner = document.creado_por === user?.id;
                return (
                  <tr key={document.id}>
                    <td className="px-4 py-3">
                      <a className="font-medium hover:underline" href={document.archivo_url} target="_blank" rel="noreferrer">
                        {document.titulo}
                      </a>
                      <p className="mt-1 text-xs text-muted">{document.categoria}</p>
                      {document.observacion_revision && (
                        <p className="mt-2 text-xs text-amber-700">Observación: {document.observacion_revision}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">{document.creado_por_email}</td>
                    <td className="px-4 py-3">{stateLabels[document.estado]}</td>
                    <td className="px-4 py-3 capitalize">{document.visibilidad}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2 text-xs">
                        {isOwner && editableStates.includes(document.estado) && (
                          <button onClick={() => startEdit(document)} className="text-primary hover:underline">Editar</button>
                        )}
                        {canReview && document.estado === 'pendiente_revision' && (
                          <>
                            <button onClick={() => void review(document, 'approve')} className="text-green-700">Aprobar</button>
                            <button onClick={() => void review(document, 'request_changes')} className="text-amber-700">Pedir corrección</button>
                            <button onClick={() => void review(document, 'reject')} className="text-red-600">Rechazar</button>
                          </>
                        )}
                        {canReview && document.estado === 'aprobado' && (
                          <button onClick={() => void review(document, 'archive')} className="text-muted">Archivar</button>
                        )}
                        {canDelete && (
                          <button onClick={() => void remove(document)} className="text-red-600">Eliminar</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
