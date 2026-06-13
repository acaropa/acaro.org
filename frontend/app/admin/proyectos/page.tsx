'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
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
    <>
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
          <div className="max-w-2xl">
            <h1 className="font-headline-lg text-[40px] md:text-[56px] text-foreground leading-tight mb-3 tracking-tight">
              Proyectos asignados
            </h1>
            <p className="font-body-lg text-[16px] md:text-[18px] text-muted">
              La lista respeta las asignaciones del usuario actual.
            </p>
          </div>
          <div className="flex shrink-0">
            {canCreate && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 font-label-caps text-label-caps bg-primary text-primary-foreground hover:bg-accent transition-colors uppercase tracking-widest"
              >
                + Nuevo proyecto
              </button>
            )}
          </div>
        </div>
      </section>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nuevo Proyecto">
        <form onSubmit={create} className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="md:col-span-2">
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Nombre del Proyecto</label>
              <input required placeholder="Escribe el nombre aquí..." value={form.nombre}
                onChange={event => setForm(current => ({ ...current, nombre: event.target.value }))}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Descripción</label>
              <textarea placeholder="Detalles del proyecto..." value={form.descripcion}
                onChange={event => setForm(current => ({ ...current, descripcion: event.target.value }))}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors resize-y" />
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Tipo</label>
              <select value={form.tipo} onChange={event => setForm(current => ({ ...current, tipo: event.target.value }))}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors">
                <option value="privado">Privado</option>
                <option value="publico">Público</option>
              </select>
            </div>
            {user?.role === 'admin' && (
              <div>
                <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Supervisor</label>
                <select value={form.supervisor_id}
                  onChange={event => setForm(current => ({ ...current, supervisor_id: event.target.value }))}
                  className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors">
                  <option value="">Sin supervisor asignado</option>
                  {supervisors.map(supervisor => (
                    <option key={supervisor.id} value={supervisor.id}>{supervisor.email}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="md:col-span-2 flex justify-end mt-4">
              <button className="px-8 py-3 bg-primary text-primary-foreground font-label-caps text-[12px] uppercase tracking-widest hover:bg-accent transition-colors">
                Guardar proyecto
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {error && <p className="rounded border-l-4 border-red-600 bg-red-50 p-4 font-body-md text-sm text-red-700 mb-8">{error}</p>}

      {projects.length === 0 ? (
        <div className="bg-surface/30 border border-border border-dashed p-16 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-[48px] text-muted mb-4 opacity-50">folder_open</span>
          <h3 className="font-headline-md text-xl font-bold text-foreground mb-2">Sin proyectos asignados</h3>
          <p className="font-body-md text-muted max-w-md">No tienes proyectos disponibles actualmente en tu bandeja.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map(project => (
            <article key={project.id} className="bg-card p-6 border border-border hover:border-primary/30 transition-colors flex flex-col group">
              <div className="flex justify-between items-start gap-4 mb-3">
                <h2 className="font-headline-md text-xl font-bold text-foreground group-hover:text-primary transition-colors">{project.nombre}</h2>
                <span className={`font-label-caps text-[10px] tracking-widest uppercase px-2 py-1 rounded shrink-0 ${project.tipo === 'publico' ? 'bg-brand-green/10 text-brand-green' : 'bg-muted/10 text-muted'}`}>
                  {project.tipo}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted font-body-md flex-1 mb-6">{project.descripcion || 'Sin descripción'}</p>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-border/50 gap-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-muted">info</span>
                  <span className="font-label-caps text-[11px] uppercase tracking-widest text-muted">
                    Estado: <span className="text-foreground">{project.estado}</span>
                  </span>
                </div>
                
                {user?.role === 'admin' ? (
                  <select
                    value={project.supervisor_id || ''}
                    onChange={event => void assignSupervisor(project.id, event.target.value)}
                    className="rounded border-b border-border bg-background px-3 py-1 font-body-md text-xs focus:outline-none focus:border-primary text-foreground"
                  >
                    <option value="">Sin supervisor</option>
                    {supervisors.map(supervisor => (
                      <option key={supervisor.id} value={supervisor.id}>{supervisor.email}</option>
                    ))}
                  </select>
                ) : project.supervisor_email ? (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-muted">person</span>
                    <span className="font-label-caps text-[11px] uppercase tracking-widest text-muted">{project.supervisor_email}</span>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
