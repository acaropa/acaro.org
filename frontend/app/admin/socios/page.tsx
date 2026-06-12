'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS } from '@/lib/permissions';

interface Socio {
  id: number;
  nombre: string;
  apellido: string;
  dni: string | null;
  telefono: string | null;
  email: string | null;
  estado: 'activo' | 'inactivo';
  fecha_ingreso: string;
}

const empty = { nombre: '', apellido: '', dni: '', telefono: '', email: '', direccion: '', fecha_ingreso: '' };

export default function SociosPage() {
  const { can } = useAuth();
  const canCreate = can(PERMISSIONS.SOCIOS_CREATE);
  const canUpdate = can(PERMISSIONS.SOCIOS_UPDATE);
  const canDelete = can(PERMISSIONS.SOCIOS_DELETE);

  const [socios, setSocios]     = useState<Socio[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(empty);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  async function load() {
    setLoading(true);
    const data = await api.get<Socio[]>('/socios').catch(() => []);
    setSocios(data);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/socios', form);
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
    if (!confirm('¿Eliminar este socio?')) return;
    await api.delete(`/socios/${id}`).catch(() => {});
    load();
  }

  async function toggleEstado(socio: Socio) {
    const estado = socio.estado === 'activo' ? 'inactivo' : 'activo';
    await api.put(`/socios/${socio.id}`, { estado }).catch(() => {});
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Socios</h1>
        {canCreate && (
          <button onClick={() => setShowForm(v => !v)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition-colors">
            {showForm ? 'Cancelar' : '+ Nuevo socio'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: 'nombre',        label: 'Nombre *',           type: 'text',  required: true },
            { name: 'apellido',      label: 'Apellido *',         type: 'text',  required: true },
            { name: 'fecha_ingreso', label: 'Fecha de ingreso *', type: 'date',  required: true },
            { name: 'dni',           label: 'DNI',                type: 'text',  required: false },
            { name: 'telefono',      label: 'Teléfono',           type: 'text',  required: false },
            { name: 'email',         label: 'Email',              type: 'email', required: false },
            { name: 'direccion',     label: 'Dirección',          type: 'text',  required: false },
          ].map(f => (
            <div key={f.name} className={f.name === 'direccion' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
              <input type={f.type} required={f.required}
                value={(form as Record<string, string>)[f.name]}
                onChange={e => setForm(v => ({ ...v, [f.name]: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
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
      ) : socios.length === 0 ? (
        <p className="text-sm text-gray-500">No hay socios registrados.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                {['Nombre', 'DNI', 'Teléfono', 'Email', 'Ingreso', 'Estado', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {socios.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.apellido}, {s.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{s.dni ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{s.telefono ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{s.email ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(s.fecha_ingreso).toLocaleDateString('es-EC')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.estado}
                    </span>
                  </td>
                  {(canUpdate || canDelete) && (
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      {canUpdate && (
                        <button onClick={() => toggleEstado(s)} className="text-xs text-blue-600 hover:underline">
                          {s.estado === 'activo' ? 'Desactivar' : 'Activar'}
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(s.id)} className="text-xs text-red-500 hover:underline">
                          Eliminar
                        </button>
                      )}
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
