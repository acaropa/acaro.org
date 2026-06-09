'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string | null;
  tipo: 'publico' | 'privado';
  clasificacion: string | null;
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
  fecha_inicio: string | null;
  fecha_fin: string | null;
}

const estadoColor: Record<string, string> = {
  pendiente:   'bg-yellow-100 text-yellow-800',
  en_progreso: 'bg-blue-100 text-blue-800',
  completado:  'bg-green-100 text-green-800',
  cancelado:   'bg-red-100 text-red-800',
};

const empty = { nombre: '', descripcion: '', tipo: 'publico', clasificacion: '', estado: 'pendiente', fecha_inicio: '', fecha_fin: '' };

export default function ProyectosPage() {
  const { user } = useAuth();
  const canWrite = user?.role === 'admin' || user?.role === 'supervisor';
  const isAdmin  = user?.role === 'admin';

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(empty);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  async function load() {
    setLoading(true);
    const data = await api.get<Proyecto[]>('/proyectos').catch(() => []);
    setProyectos(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/proyectos', form);
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
    if (!confirm('¿Eliminar este proyecto? También se eliminarán sus fases e imágenes.')) return;
    await api.delete(`/proyectos/${id}`).catch(() => {});
    load();
  }

  async function changeEstado(p: Proyecto, estado: string) {
    await api.put(`/proyectos/${p.id}`, { estado }).catch(() => {});
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
        {canWrite && (
          <button onClick={() => setShowForm(v => !v)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition-colors">
            {showForm ? 'Cancelar' : '+ Nuevo proyecto'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
            <input required type="text" value={form.nombre}
              onChange={e => setForm(v => ({ ...v, nombre: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
            <textarea value={form.descripcion} rows={3}
              onChange={e => setForm(v => ({ ...v, descripcion: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
            <select value={form.tipo} onChange={e => setForm(v => ({ ...v, tipo: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="publico">Público</option>
              <option value="privado">Privado</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Clasificación</label>
            <input type="text" value={form.clasificacion}
              onChange={e => setForm(v => ({ ...v, clasificacion: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha inicio</label>
            <input type="date" value={form.fecha_inicio}
              onChange={e => setForm(v => ({ ...v, fecha_inicio: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha fin</label>
            <input type="date" value={form.fecha_fin}
              onChange={e => setForm(v => ({ ...v, fecha_fin: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-6 py-2 rounded-md">
              {saving ? 'Guardando...' : 'Crear proyecto'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : proyectos.length === 0 ? (
        <p className="text-sm text-gray-500">No hay proyectos.</p>
      ) : (
        <div className="space-y-3">
          {proyectos.map(p => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="font-semibold text-gray-900">{p.nombre}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoColor[p.estado]}`}>
                      {p.estado.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full">
                      {p.tipo}
                    </span>
                  </div>
                  {p.clasificacion && <p className="text-xs text-gray-400">{p.clasificacion}</p>}
                  {p.descripcion   && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.descripcion}</p>}
                </div>
                {canWrite && (
                  <div className="flex gap-2 shrink-0 items-center">
                    <select value={p.estado} onChange={e => changeEstado(p, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none">
                      <option value="pendiente">Pendiente</option>
                      <option value="en_progreso">En progreso</option>
                      <option value="completado">Completado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                    {isAdmin && (
                      <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:underline">
                        Eliminar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
