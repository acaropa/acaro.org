'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { EmptyState } from '@/components/ui/EmptyState';

interface Project {
  id: number;
  nombre: string;
  descripcion: string | null;
  tipo: 'publico' | 'privado';
  estado: string;
  supervisor_id: number | null;
  supervisor_email: string | null;
}

export default function AdminProyectos() {
  const { user, can } = useAuth();
  const canCreate = can(PERMISSIONS.PROYECTOS_CREATE);
  const [projects, setProjects] = useState<Project[]>([]);
  const [supervisors, setSupervisors] = useState<Array<{ id: number; email: string }>>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', descripcion: '', tipo: 'privado', supervisor_id: '' });
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setProjects(await api.get<Project[]>('/proyectos'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los proyectos');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    api.get<Array<{ id: number; email: string; role: string; activo: boolean | number }>>('/usuarios')
      .then(records => setSupervisors(records.filter(record => record.role === 'supervisor' && Boolean(record.activo))))
      .catch(() => setSupervisors([]));
  }, [user?.role]);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    try {
      await api.post('/proyectos', {
        ...form,
        supervisor_id: form.supervisor_id ? Number(form.supervisor_id) : null,
      });
      setForm({ nombre: '', descripcion: '', tipo: 'privado', supervisor_id: '' });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el proyecto');
    }
  }

  async function assignSupervisor(projectId: number, supervisorId: string) {
    try {
      await api.put(`/proyectos/${projectId}`, {
        supervisor_id: supervisorId ? Number(supervisorId) : null,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo asignar el supervisor');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Proyectos asignados</h1>
          <p className="mt-1 text-sm text-muted">La lista respeta las asignaciones del usuario actual.</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowForm(value => !value)} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
            {showForm ? 'Cancelar' : '+ Nuevo proyecto'}
          </button>
        )}
      </div>
      {showForm && (
        <form onSubmit={create} className="grid gap-4 rounded-lg border border-border bg-card p-6">
          <input required placeholder="Nombre" value={form.nombre}
            onChange={event => setForm(current => ({ ...current, nombre: event.target.value }))}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
          <textarea placeholder="Descripción" value={form.descripcion}
            onChange={event => setForm(current => ({ ...current, descripcion: event.target.value }))}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
          <select value={form.tipo} onChange={event => setForm(current => ({ ...current, tipo: event.target.value }))}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm">
            <option value="privado">Privado</option>
            <option value="publico">Público</option>
          </select>
          {user?.role === 'admin' && (
            <select value={form.supervisor_id}
              onChange={event => setForm(current => ({ ...current, supervisor_id: event.target.value }))}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm">
              <option value="">Sin supervisor asignado</option>
              {supervisors.map(supervisor => (
                <option key={supervisor.id} value={supervisor.id}>{supervisor.email}</option>
              ))}
            </select>
          )}
          <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Guardar proyecto</button>
        </form>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {projects.length === 0 ? (
        <EmptyState title="No hay proyectos asignados" description="No tienes proyectos disponibles actualmente." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map(project => (
            <article key={project.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex justify-between gap-4">
                <h2 className="font-semibold">{project.nombre}</h2>
                <span className="text-xs capitalize text-muted">{project.tipo}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{project.descripcion || 'Sin descripción'}</p>
              <p className="mt-4 text-xs text-muted">Estado: {project.estado}</p>
              {user?.role === 'admin' ? (
                <select
                  value={project.supervisor_id || ''}
                  onChange={event => void assignSupervisor(project.id, event.target.value)}
                  className="mt-3 rounded border border-border bg-background px-2 py-1 text-xs"
                >
                  <option value="">Sin supervisor</option>
                  {supervisors.map(supervisor => (
                    <option key={supervisor.id} value={supervisor.id}>{supervisor.email}</option>
                  ))}
                </select>
              ) : project.supervisor_email ? (
                <p className="mt-1 text-xs text-muted">Supervisor: {project.supervisor_email}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
