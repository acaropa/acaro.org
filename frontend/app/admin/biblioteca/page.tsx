'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/ui/EmptyState';

interface LibraryRecord {
  id: number;
  titulo: string;
  descripcion: string | null;
  autor: string;
  fecha: string;
  link: string;
  activo: boolean | number;
}

interface LibraryForm {
  titulo: string;
  descripcion: string;
  autor: string;
  fecha: string;
  link: string;
}

const emptyForm: LibraryForm = {
  titulo: '',
  descripcion: '',
  autor: '',
  fecha: '',
  link: '',
};

function dateValue(value: string) {
  return value.slice(0, 10);
}

export default function AdminBiblioteca() {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'supervisor';
  const canDelete = user?.role === 'admin';

  const [documents, setDocuments] = useState<LibraryRecord[]>([]);
  const [form, setForm] = useState<LibraryForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setDocuments(await api.get<LibraryRecord[]>('/biblioteca'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la biblioteca');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.get<LibraryRecord[]>('/biblioteca')
      .then(setDocuments)
      .catch(err => setError(err instanceof Error ? err.message : 'No se pudo cargar la biblioteca'))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(document: LibraryRecord) {
    setForm({
      titulo: document.titulo,
      descripcion: document.descripcion || '',
      autor: document.autor,
      fecha: dateValue(document.fecha),
      link: document.link,
    });
    setEditingId(document.id);
    setShowForm(true);
    setError('');
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/biblioteca/${editingId}`, form);
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

  async function toggleActive(document: LibraryRecord) {
    setError('');
    try {
      await api.put(`/biblioteca/${document.id}`, { activo: !Boolean(document.activo) });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar el estado');
    }
  }

  async function handleDelete(document: LibraryRecord) {
    if (!confirm(`¿Eliminar "${document.titulo}"?`)) return;
    setError('');
    try {
      await api.delete(`/biblioteca/${document.id}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el documento');
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Biblioteca</h1>
        {canManage && (
          <button
            type="button"
            onClick={() => showForm ? resetForm() : setShowForm(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            {showForm ? 'Cancelar' : '+ Nuevo documento'}
          </button>
        )}
      </div>

      {showForm && canManage && (
        <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted">Título *</label>
            <input
              required
              value={form.titulo}
              onChange={event => setForm(current => ({ ...current, titulo: event.target.value }))}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Autor *</label>
            <input
              required
              value={form.autor}
              onChange={event => setForm(current => ({ ...current, autor: event.target.value }))}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Fecha *</label>
            <input
              required
              type="date"
              value={form.fecha}
              onChange={event => setForm(current => ({ ...current, fecha: event.target.value }))}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted">Enlace *</label>
            <input
              required
              type="url"
              placeholder="https://..."
              value={form.link}
              onChange={event => setForm(current => ({ ...current, link: event.target.value }))}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted">Descripción</label>
            <textarea
              rows={3}
              value={form.descripcion}
              onChange={event => setForm(current => ({ ...current, descripcion: event.target.value }))}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      {!showForm && error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted">Cargando...</p>
      ) : documents.length === 0 ? (
        <EmptyState title="Gestión de documentos" description="No hay documentos cargados todavía." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Documento</th>
                <th className="px-4 py-3 font-medium">Autor</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {documents.map(document => (
                <tr key={document.id}>
                  <td className="px-4 py-3">
                    <a href={document.link} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                      {document.titulo}
                    </a>
                    {document.descripcion && <p className="mt-1 max-w-xl truncate text-xs text-muted">{document.descripcion}</p>}
                  </td>
                  <td className="px-4 py-3 text-muted">{document.autor}</td>
                  <td className="px-4 py-3 text-muted">{new Date(`${dateValue(document.fecha)}T00:00:00`).toLocaleDateString('es-PA')}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${Boolean(document.activo) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {Boolean(document.activo) ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {canManage && (
                      <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => startEdit(document)} className="text-xs text-primary hover:underline">Editar</button>
                        <button type="button" onClick={() => void toggleActive(document)} className="text-xs text-primary hover:underline">
                          {Boolean(document.activo) ? 'Desactivar' : 'Activar'}
                        </button>
                        {canDelete && (
                          <button type="button" onClick={() => void handleDelete(document)} className="text-xs text-red-600 hover:underline">Eliminar</button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
