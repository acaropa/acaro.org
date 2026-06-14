'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';

interface Project {
  id: number;
  nombre: string;
  descripcion: string | null;
  tipo: 'publico' | 'privado';
  clasificacion: string | null;
  estado: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  supervisor_id: number | null;
  supervisor_email: string | null;
}

const emptyForm = {
  nombre: '', descripcion: '', tipo: 'privado', clasificacion: '',
  estado: 'pendiente', fecha_inicio: '', fecha_fin: '', supervisor_id: '',
};

export default function AdminProyectos() {
  const { user, can } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [supervisors, setSupervisors] = useState<Array<{ id: number; email: string }>>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('todos');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setError('');
      setProjects(await api.get<Project[]>('/proyectos'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los proyectos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  useEffect(() => {
    if (user?.role !== 'admin') return;
    api.get<Array<{ id: number; email: string; role: string; activo: boolean | number }>>('/usuarios')
      .then(rows => setSupervisors(rows.filter(row => row.role === 'supervisor' && Boolean(row.activo))))
      .catch(() => setSupervisors([]));
  }, [user?.role]);

  const visible = useMemo(() => projects.filter(project => {
    const haystack = `${project.nombre} ${project.descripcion || ''} ${project.clasificacion || ''}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (status === 'todos' || project.estado === status);
  }), [projects, query, status]);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    try {
      await api.post('/proyectos', {
        ...form,
        supervisor_id: form.supervisor_id ? Number(form.supervisor_id) : null,
        fecha_inicio: form.fecha_inicio || null,
        fecha_fin: form.fecha_fin || null,
      });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el proyecto');
    }
  }

  async function assignSupervisor(projectId: number, supervisorId: string) {
    try {
      await api.put(`/proyectos/${projectId}`, { supervisor_id: supervisorId ? Number(supervisorId) : null });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo asignar el supervisor');
    }
  }

  return (
    <>
      <section className="mb-8 border-b border-border pb-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="font-label-caps text-[11px] uppercase tracking-[0.22em] text-accent">Portafolio institucional</p>
            <h1 className="mt-3 font-headline-lg text-[40px] leading-none tracking-[-0.04em] text-foreground md:text-[56px]">Gestión de proyectos</h1>
            <p className="mt-4 max-w-2xl font-body-lg text-muted">Planifica, ejecuta y documenta cada iniciativa desde un expediente operativo con trazabilidad completa.</p>
          </div>
          {can(PERMISSIONS.PROYECTOS_CREATE) && (
            <button onClick={() => setShowForm(true)} className="bg-primary px-6 py-3 font-label-caps text-[11px] uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-accent">
              Nuevo proyecto
            </button>
          )}
        </div>
      </section>

      <div className="mb-7 grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-[1fr_220px]">
        <label className="flex items-center gap-3 rounded-xl bg-background px-4">
          <span className="material-symbols-outlined text-[20px] text-muted">search</span>
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por nombre, descripción o categoría" className="w-full bg-transparent py-3 text-sm outline-none" />
        </label>
        <select value={status} onChange={event => setStatus(event.target.value)} className="border border-border bg-background px-4 py-3 text-sm outline-none">
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendientes</option>
          <option value="en_progreso">En progreso</option>
          <option value="completado">Completados</option>
          <option value="cancelado">Cancelados</option>
        </select>
      </div>

      {error && <p className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading ? (
        <div className="py-20 text-center text-muted">Cargando portafolio...</div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <span className="material-symbols-outlined text-[48px] text-muted">folder_open</span>
          <h2 className="mt-3 font-headline-md text-xl">No hay proyectos para mostrar</h2>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {visible.map(project => (
            <article key={project.id} className="group flex min-h-[280px] flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_24px_60px_rgba(43,23,16,0.09)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="font-label-caps text-[10px] uppercase tracking-[0.18em] text-accent">{project.clasificacion || 'Proyecto ACARO'}</span>
                  <h2 className="mt-2 font-headline-md text-2xl tracking-tight text-foreground">{project.nombre}</h2>
                </div>
                <span className="rounded-full border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">{project.tipo}</span>
              </div>
              <p className="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-muted">{project.descripcion || 'Sin descripción registrada.'}</p>
              <div className="mt-6 grid grid-cols-2 gap-3 border-y border-border/70 py-4 text-xs">
                <div><span className="block uppercase tracking-wider text-muted">Estado</span><strong className="mt-1 block capitalize text-foreground">{project.estado.replace('_', ' ')}</strong></div>
                <div><span className="block uppercase tracking-wider text-muted">Periodo</span><strong className="mt-1 block text-foreground">{project.fecha_inicio?.slice(0, 10) || 'Por definir'}{project.fecha_fin ? ` — ${project.fecha_fin.slice(0, 10)}` : ''}</strong></div>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {user?.role === 'admin' ? (
                  <select value={project.supervisor_id || ''} onChange={event => void assignSupervisor(project.id, event.target.value)} className="max-w-[230px] border border-border bg-background px-3 py-2 text-xs">
                    <option value="">Sin supervisor</option>
                    {supervisors.map(supervisor => <option key={supervisor.id} value={supervisor.id}>{supervisor.email}</option>)}
                  </select>
                ) : <span className="text-xs text-muted">{project.supervisor_email || 'Sin supervisor asignado'}</span>}
                <Link href={`/admin/proyectos/gestion?id=${project.id}`} className="inline-flex items-center gap-2 font-label-caps text-[11px] uppercase tracking-[0.16em] text-primary transition-all group-hover:gap-3">
                  Abrir expediente <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nuevo proyecto" maxWidth="max-w-3xl">
        <form onSubmit={create} className="grid gap-5 md:grid-cols-2">
          <Field label="Nombre" wide><input required value={form.nombre} onChange={event => setForm({ ...form, nombre: event.target.value })} className="form-control" /></Field>
          <Field label="Descripción" wide><textarea rows={4} value={form.descripcion} onChange={event => setForm({ ...form, descripcion: event.target.value })} className="form-control resize-y" /></Field>
          <Field label="Categoría"><input value={form.clasificacion} onChange={event => setForm({ ...form, clasificacion: event.target.value })} className="form-control" /></Field>
          <Field label="Visibilidad"><select value={form.tipo} onChange={event => setForm({ ...form, tipo: event.target.value })} className="form-control"><option value="privado">Privado</option><option value="publico">Público</option></select></Field>
          <Field label="Estado"><select value={form.estado} onChange={event => setForm({ ...form, estado: event.target.value })} className="form-control"><option value="pendiente">Pendiente</option><option value="en_progreso">En progreso</option><option value="completado">Completado</option></select></Field>
          {user?.role === 'admin' && <Field label="Supervisor"><select value={form.supervisor_id} onChange={event => setForm({ ...form, supervisor_id: event.target.value })} className="form-control"><option value="">Sin supervisor</option>{supervisors.map(item => <option key={item.id} value={item.id}>{item.email}</option>)}</select></Field>}
          <Field label="Fecha de inicio"><input type="date" value={form.fecha_inicio} onChange={event => setForm({ ...form, fecha_inicio: event.target.value })} className="form-control" /></Field>
          <Field label="Fecha estimada de cierre"><input type="date" value={form.fecha_fin} onChange={event => setForm({ ...form, fecha_fin: event.target.value })} className="form-control" /></Field>
          <div className="md:col-span-2 flex justify-end"><button className="bg-primary px-7 py-3 font-label-caps text-[11px] uppercase tracking-widest text-primary-foreground">Crear expediente</button></div>
        </form>
      </Modal>
    </>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={wide ? 'md:col-span-2' : ''}><span className="mb-2 block font-label-caps text-[10px] uppercase tracking-widest text-muted">{label}</span>{children}</label>;
}
