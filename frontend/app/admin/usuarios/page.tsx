'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { PERMISSIONS } from '@/lib/permissions';

interface UserRecord {
  id: number;
  email: string;
  full_name: string | null;
  role: 'admin' | 'supervisor' | 'tecnico' | 'visitante';
  activo: boolean | number;
  created_at: string;
}

const empty = { email: '', password: '', role: 'visitante', full_name: '' };

export default function AdminUsuarios() {
  const { user, can } = useAuth();
  const canCreate = can(PERMISSIONS.USUARIOS_CREATE);
  const canUpdate = can(PERMISSIONS.USUARIOS_UPDATE);
  const canAssignRoles = can(PERMISSIONS.USUARIOS_ASSIGN_ROLES);
  const canDisable = can(PERMISSIONS.USUARIOS_DISABLE);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [nameDrafts, setNameDrafts] = useState<Record<number, string>>({});

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

  async function saveFullName(id: number, fullName: string) {
    try {
      await api.put(`/usuarios/${id}`, { full_name: fullName.trim() || null });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el nombre visible');
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
    <>
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
          <div className="max-w-2xl">
            <h1 className="font-headline-lg text-[40px] md:text-[56px] text-foreground leading-tight mb-3 tracking-tight">
              Usuarios
            </h1>
            <p className="font-body-lg text-[16px] md:text-[18px] text-muted">
              {canCreate ? 'Administración de accesos y roles del sistema.' : 'Consulta de usuarios en modo solo lectura.'}
            </p>
          </div>
          <div className="flex shrink-0">
            {canCreate && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 font-label-caps text-label-caps bg-primary text-primary-foreground hover:bg-accent transition-colors uppercase tracking-widest"
              >
                + Crear usuario
              </button>
            )}
          </div>
        </div>
      </section>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Crear Usuario" maxWidth="max-w-4xl">
        <form onSubmit={create} className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Correo Electrónico *</label>
              <input required type="email" placeholder="usuario@ejemplo.com" value={form.email}
                onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Nombre visible</label>
              <input type="text" placeholder="Nombre que verá el público" value={form.full_name}
                onChange={event => setForm(current => ({ ...current, full_name: event.target.value }))}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Contraseña *</label>
              <input required minLength={12} type="password" placeholder="Mínimo 12 caracteres" value={form.password}
                onChange={event => setForm(current => ({ ...current, password: event.target.value }))}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Rol asignado</label>
              <select value={form.role} onChange={event => setForm(current => ({ ...current, role: event.target.value }))}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors">
                <option value="visitante">Visitante</option>
                <option value="tecnico">Técnico</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="md:col-span-3 flex justify-end mt-4">
              <button className="px-8 py-3 bg-primary text-primary-foreground font-label-caps text-[12px] uppercase tracking-widest hover:bg-accent transition-colors">
                Crear usuario
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {error && <p className="rounded border-l-4 border-red-600 bg-red-50 p-4 font-body-md text-sm text-red-700 mb-8">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {users.map(record => (
          <article key={record.id} className="bg-card p-6 border border-border hover:border-primary/30 transition-colors flex flex-col group relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded bg-surface text-muted">
                <span className="material-symbols-outlined text-[24px]">
                  {record.role === 'admin' ? 'admin_panel_settings' : 
                   record.role === 'supervisor' ? 'manage_accounts' : 
                   record.role === 'tecnico' ? 'engineering' : 'person'}
                </span>
              </div>
              <span className={`font-label-caps text-[10px] tracking-widest uppercase px-2 py-1 rounded shrink-0 ${Boolean(record.activo) ? 'bg-brand-green/10 text-brand-green' : 'bg-red-500/10 text-red-600'}`}>
                {Boolean(record.activo) ? 'Activo' : 'Desactivado'}
              </span>
            </div>
            
            <h2 className="font-headline-md text-lg font-bold text-foreground mb-1 truncate" title={record.email}>
              {record.full_name || record.email}
            </h2>
            {record.full_name && (
              <p className="text-xs text-muted mb-3 truncate" title={record.email}>{record.email}</p>
            )}

            <div className="flex flex-col gap-2 mb-6 flex-1">
              <div className="flex flex-col gap-1">
                <span className="font-label-caps text-[10px] uppercase tracking-widest text-muted">Nombre visible (público)</span>
                {canUpdate ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      value={nameDrafts[record.id] ?? record.full_name ?? ''}
                      onChange={event => setNameDrafts(current => ({ ...current, [record.id]: event.target.value }))}
                      className="w-full bg-background border-b border-border py-2 text-sm font-body-md text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                    {nameDrafts[record.id] !== undefined && nameDrafts[record.id] !== (record.full_name ?? '') && (
                      <button
                        type="button"
                        onClick={() => void saveFullName(record.id, nameDrafts[record.id])}
                        className="shrink-0 px-3 py-1.5 font-label-caps text-[10px] uppercase tracking-widest bg-primary text-primary-foreground hover:bg-accent transition-colors"
                      >
                        Guardar
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-foreground font-body-md">{record.full_name || '—'}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-caps text-[10px] uppercase tracking-widest text-muted">Rol de sistema</span>
                {canAssignRoles && record.id !== user?.id ? (
                  <select value={record.role} onChange={event => void assignRole(record.id, event.target.value as UserRecord['role'])}
                    className="w-full bg-background border-b border-border py-2 text-sm font-body-md text-foreground focus:outline-none focus:border-primary transition-colors">
                    <option value="visitante">Visitante</option>
                    <option value="tecnico">Técnico</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Administrador</option>
                  </select>
                ) : (
                  <span className="text-sm text-foreground font-body-md capitalize font-medium">{record.role}</span>
                )}
              </div>
            </div>
            
            {canDisable && record.id !== user?.id && (
              <div className="flex justify-end pt-4 border-t border-border/50">
                {Boolean(record.activo) ? (
                  <button onClick={() => void disable(record.id)} className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">block</span> Desactivar cuenta
                  </button>
                ) : (
                  <span className="text-xs text-muted italic">Cuenta inactiva</span>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
