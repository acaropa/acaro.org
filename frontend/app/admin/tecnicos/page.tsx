'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS } from '@/lib/permissions';

interface Tecnico {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  especialidad: string | null;
  telefono: string | null;
  disponible: boolean;
  supervisor_id: number | null;
  supervisor_email: string | null;
}

const empty = { nombre: '', apellido: '', email: '', password: '', especialidad: '', telefono: '' };

export default function TecnicosPage() {
  const { can } = useAuth();
  const canCreate = can(PERMISSIONS.TECNICOS_CREATE);
  const canWrite = can(PERMISSIONS.TECNICOS_UPDATE);
  const canAssign = can(PERMISSIONS.TECNICOS_ASSIGN);
  const canDelete = can(PERMISSIONS.TECNICOS_DELETE);

  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [supervisors, setSupervisors] = useState<Array<{ id: number; email: string }>>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(empty);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  async function load() {
    setLoading(true);
    const data = await api.get<Tecnico[]>('/tecnicos').catch(() => []);
    setTecnicos(data);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  useEffect(() => {
    if (!canAssign) return;
    api.get<Array<{ id: number; email: string; role: string; activo: boolean | number }>>('/usuarios')
      .then(records => setSupervisors(records.filter(record => record.role === 'supervisor' && Boolean(record.activo))))
      .catch(() => setSupervisors([]));
  }, [canAssign]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/tecnicos', form);
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
    if (!confirm('¿Eliminar este técnico y su cuenta de usuario?')) return;
    await api.delete(`/tecnicos/${id}`).catch(() => {});
    load();
  }

  async function toggleDisponible(t: Tecnico) {
    await api.put(`/tecnicos/${t.id}`, { disponible: !t.disponible }).catch(() => {});
    load();
  }

  async function assignSupervisor(tecnicoId: number, supervisorId: string) {
    if (!supervisorId) return;
    try {
      await api.put(`/tecnicos/${tecnicoId}/supervisor`, { supervisor_id: Number(supervisorId) });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo asignar el supervisor');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Técnicos</h1>
        {canCreate && (
          <button onClick={() => setShowForm(v => !v)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition-colors">
            {showForm ? 'Cancelar' : '+ Registrar técnico'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: 'nombre',       label: 'Nombre *',     type: 'text',     required: true },
            { name: 'apellido',     label: 'Apellido *',   type: 'text',     required: true },
            { name: 'email',        label: 'Email *',      type: 'email',    required: true },
            { name: 'password',     label: 'Contraseña * (mínimo 12 caracteres)', type: 'password', required: true },
            { name: 'especialidad', label: 'Especialidad', type: 'text',     required: false },
            { name: 'telefono',     label: 'Teléfono',     type: 'text',     required: false },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
              <input type={f.type} required={f.required} minLength={f.name === 'password' ? 12 : undefined}
                value={(form as Record<string, string>)[f.name]}
                onChange={e => setForm(v => ({ ...v, [f.name]: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-6 py-2 rounded-md">
              {saving ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : tecnicos.length === 0 ? (
        <p className="text-sm text-gray-500">No hay técnicos registrados.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                {['Nombre', 'Email', 'Especialidad', 'Supervisor', 'Disponible', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tecnicos.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{t.apellido}, {t.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{t.email}</td>
                  <td className="px-4 py-3 text-gray-500">{t.especialidad ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {canAssign ? (
                      <select
                        value={t.supervisor_id || ''}
                        onChange={event => void assignSupervisor(t.id, event.target.value)}
                        className="rounded border border-gray-300 px-2 py-1 text-xs"
                      >
                        <option value="">Sin asignar</option>
                        {supervisors.map(supervisor => (
                          <option key={supervisor.id} value={supervisor.id}>{supervisor.email}</option>
                        ))}
                      </select>
                    ) : (t.supervisor_email || '—')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.disponible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {t.disponible ? 'Disponible' : 'Ocupado'}
                    </span>
                  </td>
                  {canWrite && (
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <button onClick={() => toggleDisponible(t)} className="text-xs text-blue-600 hover:underline">
                        {t.disponible ? 'Marcar ocupado' : 'Marcar disponible'}
                      </button>
                      {canDelete && (
                        <button onClick={() => handleDelete(t.id)} className="text-xs text-red-500 hover:underline">
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
