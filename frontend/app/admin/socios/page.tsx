'use client';

import { AppIcon } from "@/components/ui/AppIcon"

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
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
    <>
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
          <div className="max-w-2xl">
            <h1 className="font-headline-lg text-[40px] md:text-[56px] text-foreground leading-tight mb-3 tracking-tight">
              Socios
            </h1>
            <p className="font-body-lg text-[16px] md:text-[18px] text-muted">
              Directorio de miembros y productores de la asociación.
            </p>
          </div>
          <div className="flex shrink-0">
            {canCreate && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 font-label-caps text-label-caps bg-primary text-primary-foreground hover:bg-accent transition-colors uppercase tracking-widest"
              >
                + Nuevo socio
              </button>
            )}
          </div>
        </div>
      </section>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nuevo Socio">
        <form onSubmit={handleSubmit} className="relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
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
                <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">{f.label}</label>
                <input type={f.type} required={f.required}
                  value={(form as Record<string, string>)[f.name]}
                  onChange={e => setForm(v => ({ ...v, [f.name]: e.target.value }))}
                  className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors" />
              </div>
            ))}
            {error && <p className="sm:col-span-2 rounded border-l-4 border-red-600 bg-red-50 p-4 font-body-md text-sm text-red-700">{error}</p>}
            
            <div className="sm:col-span-2 flex justify-end mt-4">
              <button type="submit" disabled={saving}
                className="px-8 py-3 bg-primary text-primary-foreground font-label-caps text-[12px] uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar socio'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {loading ? (
        <div className="py-12 text-center text-muted font-body-md animate-pulse">Cargando directorio...</div>
      ) : socios.length === 0 ? (
        <div className="bg-surface/30 border border-border border-dashed p-16 flex flex-col items-center justify-center text-center">
          <AppIcon name="groups" className="text-[48px] text-muted mb-4 opacity-50" />
          <h3 className="font-headline-md text-xl font-bold text-foreground mb-2">Sin socios registrados</h3>
          <p className="font-body-md text-muted max-w-md">El directorio de la asociación está vacío.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {socios.map(s => (
            <article key={s.id} className="bg-card p-6 border border-border hover:border-primary/30 transition-colors flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface text-primary font-headline-md font-bold text-lg">
                  {s.nombre.charAt(0)}{s.apellido.charAt(0)}
                </div>
                <span className={`font-label-caps text-[10px] tracking-widest uppercase px-2 py-1 rounded shrink-0 ${s.estado === 'activo' ? 'bg-brand-green/10 text-brand-green' : 'bg-muted/10 text-muted'}`}>
                  {s.estado}
                </span>
              </div>
              
              <h2 className="font-headline-md text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                {s.apellido}, {s.nombre}
              </h2>
              <p className="text-sm text-muted font-body-md mb-4 font-mono">DNI: {s.dni ?? 'N/A'}</p>
              
              <div className="flex flex-col gap-2 mb-6 flex-1">
                <div className="flex items-center gap-2">
                  <AppIcon name="call" className="text-[16px] text-muted" />
                  <span className="text-sm text-foreground font-body-md">{s.telefono ?? 'No registrado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AppIcon name="mail" className="text-[16px] text-muted" />
                  <span className="text-sm text-foreground font-body-md">{s.email ?? 'No registrado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AppIcon name="calendar_today" className="text-[16px] text-muted" />
                  <span className="text-sm text-foreground font-body-md">Ingreso: {new Date(s.fecha_ingreso).toLocaleDateString('es-EC')}</span>
                </div>
              </div>
              
              {(canUpdate || canDelete) && (
                <div className="flex justify-end gap-4 pt-4 border-t border-border/50">
                  {canUpdate && (
                    <button onClick={() => toggleEstado(s)} className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
                      <AppIcon name="power_settings_new" className="text-[16px]" />
                      {s.estado === 'activo' ? 'Desactivar' : 'Activar'}
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(s.id)} className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800 transition-colors">
                      <AppIcon name="delete" className="text-[16px]" /> Eliminar
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
