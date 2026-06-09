'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Documento {
  id: number;
  titulo: string;
  descripcion: string | null;
  autor: string;
  fecha: string;
  link: string;
  activo: boolean;
}

const empty = { titulo: '', descripcion: '', autor: '', fecha: '', link: '' };

export default function BibliotecaDashboardPage() {
  const { user } = useAuth();
  const canWrite = user?.role === 'admin' || user?.role === 'supervisor';
  const isAdmin  = user?.role === 'admin';

  const [docs, setDocs]         = useState<Documento[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(empty);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  async function load() {
    setLoading(true);
    const data = await api.get<Documento[]>('/biblioteca').catch(() => []);
    setDocs(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/biblioteca', form);
      setShowForm(false);
      setForm(empty);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este documento?')) return;
    await api.delete(`/biblioteca/${id}`).catch(() => {});
    load();
  }

  async function toggleActivo(doc: Documento) {
    await api.put(`/biblioteca/${doc.id}`, { activo: !doc.activo }).catch(() => {});
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Biblioteca</h1>
        {canWrite && (
          <button onClick={() => setShowForm(v => !v)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition-colors">
            {showForm ? 'Cancelar' : '+ Nuevo documento'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Título *</label>
            <input required type="text" value={form.titulo}
              onChange={e => setForm(v => ({ ...v, titulo: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Autor *</label>
            <input required type="text" value={form.autor}
              onChange={e => setForm(v => ({ ...v, autor: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha *</label>
            <input required type="date" value={form.fecha}
              onChange={e => setForm(v => ({ ...v, fecha: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Link del documento *</label>
            <input required type="url" value={form.link} placeholder="https://drive.google.com/..."
              onChange={e => setForm(v => ({ ...v, link: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
            <textarea value={form.descripcion} rows={2}
              onChange={e => setForm(v => ({ ...v, descripcion: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-6 py-2 rounded-md">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : docs.length === 0 ? (
        <p className="text-sm text-gray-500">No hay documentos registrados.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                {['Título', 'Autor', 'Fecha', 'Estado', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {docs.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{doc.titulo}</p>
                    {doc.descripcion && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{doc.descripcion}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{doc.autor}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(doc.fecha).toLocaleDateString('es-EC')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${doc.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {doc.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  {canWrite && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <a href={doc.link} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline">Ver</a>
                        <button onClick={() => toggleActivo(doc)} className="text-xs text-gray-500 hover:underline">
                          {doc.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        {isAdmin && (
                          <button onClick={() => handleDelete(doc.id)} className="text-xs text-red-500 hover:underline">
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
