'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { PERMISSIONS } from '@/lib/permissions';

interface UserRecord {
  id: number;
  email: string;
  role: 'admin' | 'supervisor' | 'tecnico' | 'visitante';
  activo: boolean | number;
  created_at: string;
}

const empty = { email: '', password: '', role: 'visitante' };

export default function AdminUsuarios() {
  const { user, can } = useAuth();
  const canCreate = can(PERMISSIONS.USUARIOS_CREATE);
  const canAssignRoles = can(PERMISSIONS.USUARIOS_ASSIGN_ROLES);
  const canDisable = can(PERMISSIONS.USUARIOS_DISABLE);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setUsers(await api.get<UserRecord[]>('/usuarios'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los usuarios');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    try {
      await api.post('/usuarios', form);
      setForm(empty);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el usuario');
    }
  }

  async function assignRole(id: number, role: UserRecord['role']) {
    try {
      await api.patch(`/usuarios/${id}/role`, { role });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar el rol');
    }
  }

  async function disable(id: number) {
    if (!confirm('¿Desactivar este usuario?')) return;
    try {
      await api.patch(`/usuarios/${id}/disable`, {});
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo desactivar el usuario');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          {!canCreate && <p className="mt-1 text-sm text-muted">Consulta de usuarios en modo solo lectura.</p>}
        </div>
        {canCreate && (
          <button onClick={() => setShowForm(value => !value)} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
            {showForm ? 'Cancelar' : '+ Crear usuario'}
          </button>
        )}
      </div>

      {showForm && canCreate && (
        <form onSubmit={create} className="grid gap-4 rounded-lg border border-border bg-card p-6 sm:grid-cols-3">
          <input required type="email" placeholder="Correo" value={form.email}
            onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
          <input required minLength={8} type="password" placeholder="Contraseña" value={form.password}
            onChange={event => setForm(current => ({ ...current, password: event.target.value }))}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
          <select value={form.role} onChange={event => setForm(current => ({ ...current, role: event.target.value }))}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm">
            <option value="visitante">Visitante</option>
            <option value="tecnico">Técnico</option>
            <option value="supervisor">Supervisor</option>
            <option value="admin">Admin</option>
          </select>
          <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground sm:col-span-3">Crear usuario</button>
        </form>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs uppercase text-muted">
            <tr><th className="px-4 py-3">Correo</th><th className="px-4 py-3">Rol</th><th className="px-4 py-3">Estado</th><th /></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map(record => (
              <tr key={record.id}>
                <td className="px-4 py-3">{record.email}</td>
                <td className="px-4 py-3">
                  {canAssignRoles && record.id !== user?.id ? (
                    <select value={record.role} onChange={event => void assignRole(record.id, event.target.value as UserRecord['role'])}
                      className="rounded border border-border bg-background px-2 py-1">
                      <option value="visitante">Visitante</option>
                      <option value="tecnico">Técnico</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : <span className="capitalize">{record.role}</span>}
                </td>
                <td className="px-4 py-3">{Boolean(record.activo) ? 'Activo' : 'Desactivado'}</td>
                <td className="px-4 py-3 text-right">
                  {canDisable && Boolean(record.activo) && record.id !== user?.id && (
                    <button onClick={() => void disable(record.id)} className="text-xs text-red-600">Desactivar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
