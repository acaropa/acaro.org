'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
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
    <>
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
          <div className="max-w-2xl">
            <h1 className="font-headline-lg text-[40px] md:text-[56px] text-foreground leading-tight mb-3 tracking-tight">
              Técnicos
            </h1>
            <p className="font-body-lg text-[16px] md:text-[18px] text-muted">
              Personal técnico de campo y sus asignaciones.
            </p>
          </div>
          <div className="flex shrink-0">
            {canCreate && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 font-label-caps text-label-caps bg-primary text-primary-foreground hover:bg-accent transition-colors uppercase tracking-widest"
              >
                + Registrar técnico
              </button>
            )}
          </div>
        </div>
      </section>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Registrar Técnico">
        <form onSubmit={handleSubmit} className="relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
            {[
              { name: 'nombre',       label: 'Nombre *',     type: 'text',     required: true },
              { name: 'apellido',     label: 'Apellido *',   type: 'text',     required: true },
              { name: 'email',        label: 'Email *',      type: 'email',    required: true },
              { name: 'password',     label: 'Contraseña * (mínimo 12 caracteres)', type: 'password', required: true },
              { name: 'especialidad', label: 'Especialidad', type: 'text',     required: false },
              { name: 'telefono',     label: 'Teléfono',     type: 'text',     required: false },
            ].map(f => (
              <div key={f.name}>
                <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">{f.label}</label>
                <input type={f.type} required={f.required} minLength={f.name === 'password' ? 12 : undefined}
                  value={(form as Record<string, string>)[f.name]}
                  onChange={e => setForm(v => ({ ...v, [f.name]: e.target.value }))}
                  className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors" />
              </div>
            ))}
            {error && <p className="sm:col-span-2 rounded border-l-4 border-red-600 bg-red-50 p-4 font-body-md text-sm text-red-700">{error}</p>}
            <div className="sm:col-span-2 flex justify-end mt-4">
              <button type="submit" disabled={saving}
                className="px-8 py-3 bg-primary text-primary-foreground font-label-caps text-[12px] uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {loading ? (
        <div className="py-12 text-center text-muted font-body-md animate-pulse">Cargando técnicos...</div>
      ) : tecnicos.length === 0 ? (
        <div className="bg-surface/30 border border-border border-dashed p-16 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-[48px] text-muted mb-4 opacity-50">engineering</span>
          <h3 className="font-headline-md text-xl font-bold text-foreground mb-2">Sin técnicos registrados</h3>
          <p className="font-body-md text-muted max-w-md">No hay personal técnico registrado en el sistema.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {tecnicos.map(t => (
            <article key={t.id} className="bg-card p-6 border border-border hover:border-primary/30 transition-colors flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface text-primary font-headline-md font-bold text-lg">
                  {t.nombre.charAt(0)}{t.apellido.charAt(0)}
                </div>
                <span className={`font-label-caps text-[10px] tracking-widest uppercase px-2 py-1 rounded shrink-0 ${t.disponible ? 'bg-brand-green/10 text-brand-green' : 'bg-muted/10 text-muted'}`}>
                  {t.disponible ? 'Disponible' : 'Ocupado'}
                </span>
              </div>
              
              <h2 className="font-headline-md text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                {t.apellido}, {t.nombre}
              </h2>
              <p className="text-sm text-primary font-label-caps tracking-widest uppercase mb-4">{t.especialidad ?? 'General'}</p>
              
              <div className="flex flex-col gap-2 mb-6 flex-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-muted">mail</span>
                  <span className="text-sm text-foreground font-body-md">{t.email}</span>
                </div>
                {t.telefono && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-muted">call</span>
                    <span className="text-sm text-foreground font-body-md">{t.telefono}</span>
                  </div>
                )}
                
                <div className="mt-2 pt-2 border-t border-border/30 flex flex-col gap-1">
                  <span className="font-label-caps text-[10px] uppercase tracking-widest text-muted">Supervisor</span>
                  {canAssign ? (
                    <select
                      value={t.supervisor_id || ''}
                      onChange={event => void assignSupervisor(t.id, event.target.value)}
                      className="rounded border-b border-border bg-background px-2 py-1 text-xs font-body-md text-foreground focus:outline-none focus:border-primary"
                    >
                      <option value="">Sin asignar</option>
                      {supervisors.map(supervisor => (
                        <option key={supervisor.id} value={supervisor.id}>{supervisor.email}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-sm text-foreground font-body-md">{t.supervisor_email || 'Sin supervisor asignado'}</span>
                  )}
                </div>
              </div>
              
              {canWrite && (
                <div className="flex justify-end gap-4 pt-4 border-t border-border/50">
                  <button onClick={() => toggleDisponible(t)} className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[16px]">
                      {t.disponible ? 'do_not_disturb_on' : 'check_circle'}
                    </span>
                    {t.disponible ? 'Marcar ocupado' : 'Marcar disponible'}
                  </button>
                  {canDelete && (
                    <button onClick={() => handleDelete(t.id)} className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800 transition-colors">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
