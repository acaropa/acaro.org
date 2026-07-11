'use client';

import { AppIcon } from "@/components/ui/AppIcon";
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { PERMISSIONS } from '@/lib/permissions';

interface ActorRecord {
  id: number;
  nombre: string;
  tipo_entidad: 'persona' | 'empresa' | 'organizacion' | 'institucion';
  distrito_id: number;
  comunidad: string | null;
  activo: boolean;
  creado_por: number | null;
  created_at: string;
  updated_at: string;
  provincia: string;
  distrito: string;
  tipos: string[];
  tipos_nombres: string[];
}

const emptyForm = {
  nombre: '',
  tipo_entidad: 'persona',
  distrito_id: '',
  comunidad: '',
  activo: true,
  tipos: [] as string[],
};

const ENTITY_TYPES = [
  { code: 'persona', label: 'Persona' },
  { code: 'empresa', label: 'Empresa' },
  { code: 'organizacion', label: 'Organización' },
  { code: 'institucion', label: 'Institución' },
];

const ACTOR_TYPES = [
  { code: 'comercializador', label: 'Comercializador' },
  { code: 'procesador', label: 'Procesador' },
  { code: 'viverista', label: 'Viverista' },
  { code: 'tostador', label: 'Tostador' },
  { code: 'transportista', label: 'Transportista' },
  { code: 'proveedor', label: 'Proveedor' },
  { code: 'investigador', label: 'Investigador' },
  { code: 'institucion', label: 'Institución (Aliado)' },
  { code: 'aliado', label: 'Aliado' },
];

export default function AdminCadenaValor() {
  const { can } = useAuth();
  const canCreate = can(PERMISSIONS.PRODUCTORES_CREATE);
  const canUpdate = can(PERMISSIONS.PRODUCTORES_UPDATE);
  const canDelete = can(PERMISSIONS.PRODUCTORES_DELETE);

  const [actores, setActores] = useState<ActorRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<ActorRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [provincias, setProvincias] = useState<string[]>([]);
  const [distritos, setDistritos] = useState<{ id: number; distrito: string }[]>([]);
  const [selectedProvincia, setSelectedProvincia] = useState<string>('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setActores(await api.get<ActorRecord[]>(`/mapa/actores?status=${statusFilter}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los actores');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    api.get<string[]>('/mapa/provincias')
      .then(setProvincias)
      .catch(err => console.error('Error al cargar provincias:', err));
  }, []);

  useEffect(() => {
    if (!selectedProvincia) {
      setDistritos([]);
      return;
    }
    api.get<{ id: number; distrito: string }[]>(`/mapa/provincias/${encodeURIComponent(selectedProvincia)}/distritos`)
      .then(setDistritos)
      .catch(err => console.error('Error al cargar distritos:', err));
  }, [selectedProvincia]);

  function resetForm() {
    setForm(emptyForm);
    setSelectedProvincia('');
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(item: ActorRecord) {
    setEditing(item);
    setSelectedProvincia(item.provincia || '');
    setForm({
      nombre: item.nombre,
      tipo_entidad: item.tipo_entidad,
      distrito_id: String(item.distrito_id),
      comunidad: item.comunidad || '',
      activo: item.activo,
      tipos: item.tipos || [],
    });
    setShowForm(true);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (form.tipos.length === 0) {
      setError('Debe seleccionar al menos un tipo de actor en la cadena de valor');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        nombre: form.nombre.trim(),
        tipo_entidad: form.tipo_entidad,
        distrito_id: Number(form.distrito_id),
        comunidad: form.comunidad.trim() || null,
        activo: form.activo,
        tipos: form.tipos,
      };

      if (editing) {
        await api.put(`/mapa/actores/${editing.id}`, payload);
      } else {
        await api.post('/mapa/actores', payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el registro');
    } finally {
      setSaving(false);
    }
  }

  async function toggleField(item: ActorRecord, field: 'activo') {
    try {
      await api.put(`/mapa/actores/${item.id}`, { [field]: !item[field] });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el estado del registro');
    }
  }

  async function deactivate(item: ActorRecord) {
    if (!confirm(`¿Desactivar a "${item.nombre}"? Dejará de sumarse en el mapa.`)) return;
    try {
      await api.delete(`/mapa/actores/${item.id}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo desactivar el registro');
    }
  }

  function handleCheckboxChange(code: string, checked: boolean) {
    setForm(current => {
      const nextTipos = checked 
        ? [...current.tipos, code] 
        : current.tipos.filter(t => t !== code);
      return { ...current, tipos: nextTipos };
    });
  }

  return (
    <>
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
          <div className="max-w-2xl">
            <h1 className="font-headline-lg text-[40px] md:text-[56px] text-foreground leading-tight mb-3 tracking-tight">
              Cadena de Valor
            </h1>
            <p className="font-body-lg text-[16px] md:text-[18px] text-muted">
              Administra los perfiles de los eslabones y actores territoriales que operan en la cadena de valor del café robusta.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            {canCreate && (
              <button
                onClick={() => (showForm ? resetForm() : setShowForm(true))}
                className="px-6 py-3 font-label-caps text-label-caps bg-primary text-primary-foreground hover:bg-accent transition-colors uppercase tracking-widest"
              >
                + Nuevo Actor
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filtros de estado */}
      <div className="flex items-center gap-2 mb-6 bg-surface/30 p-2 border border-border w-fit">
        <span className="font-label-caps text-[10px] text-muted px-2 uppercase tracking-widest">Filtrar por estado:</span>
        {(['todos', 'activos', 'inactivos'] as const).map(option => (
          <button
            key={option}
            onClick={() => setStatusFilter(option)}
            className={`px-3 py-1 font-label-caps text-[11px] uppercase tracking-widest transition-colors ${statusFilter === option ? 'bg-primary text-primary-foreground' : 'text-muted hover:text-foreground'}`}
          >
            {option === 'todos' ? 'Todos' : option === 'activos' ? 'Activos' : 'Desactivados'}
          </button>
        ))}
      </div>

      <Modal isOpen={showForm} onClose={resetForm} title={editing ? 'Editar Actor' : 'Nuevo Actor'}>
        <form onSubmit={save} className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="md:col-span-2">
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Nombre del actor / entidad</label>
              <input
                required
                placeholder="Nombre completo o razón social"
                value={form.nombre}
                onChange={event => setForm(current => ({ ...current, nombre: event.target.value }))}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Tipo de Entidad</label>
              <select
                value={form.tipo_entidad}
                onChange={event => setForm(current => ({ ...current, tipo_entidad: event.target.value as any }))}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors"
              >
                {ENTITY_TYPES.map(type => (
                  <option key={type.code} value={type.code}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Provincia</label>
              <select
                required
                value={selectedProvincia}
                onChange={event => {
                  setSelectedProvincia(event.target.value);
                  setForm(current => ({ ...current, distrito_id: '' }));
                }}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">Selecciona una provincia</option>
                {provincias.map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Distrito</label>
              <select
                required
                disabled={!selectedProvincia}
                value={form.distrito_id}
                onChange={event => setForm(current => ({ ...current, distrito_id: event.target.value }))}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
              >
                <option value="">Selecciona un distrito</option>
                {distritos.map(dist => (
                  <option key={dist.id} value={dist.id}>{dist.distrito}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Comunidad / Localidad (Opcional)</label>
              <input
                placeholder="Comunidad específica"
                value={form.comunidad}
                onChange={event => setForm(current => ({ ...current, comunidad: event.target.value }))}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-label-caps text-[10px] text-muted mb-3 uppercase tracking-widest">Eslabones en la Cadena de Valor (Selección Múltiple)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-surface/30 p-4 border border-border">
                {ACTOR_TYPES.map(type => {
                  const isChecked = form.tipos.includes(type.code);
                  return (
                    <label key={type.code} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={event => handleCheckboxChange(type.code, event.target.checked)}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="font-body-sm text-sm text-foreground">{type.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={event => setForm(current => ({ ...current, activo: event.target.checked }))}
                  className="h-4 w-4 accent-primary"
                />
                <span className="font-label-caps text-[11px] uppercase tracking-widest text-foreground">
                  Visible e incluido en el conteo del mapa público
                </span>
              </label>
            </div>

            <div className="md:col-span-2 flex justify-end mt-4">
              <button disabled={saving} className="px-8 py-3 bg-primary text-primary-foreground font-label-caps text-[12px] uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar Actor'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {error && <p className="rounded border-l-4 border-red-600 bg-red-50 p-4 font-body-md text-sm text-red-700 mb-8">{error}</p>}

      {loading ? (
        <div className="py-12 text-center text-muted font-body-md animate-pulse">Cargando actores...</div>
      ) : actores.length === 0 ? (
        <div className="bg-surface/30 border border-border border-dashed p-16 flex flex-col items-center justify-center text-center">
          <AppIcon name="map" className="text-[48px] text-muted mb-4 opacity-50" />
          <h3 className="font-headline-md text-xl font-bold text-foreground mb-2">Sin actores registrados</h3>
          <p className="font-body-md text-muted max-w-md">No se encontraron actores registrados en esta categoría de estado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {actores.map(item => (
            <article key={item.id} className="bg-card p-6 border border-border hover:border-primary/30 transition-colors flex flex-col group justify-between">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-label-caps text-[10px] tracking-widest uppercase px-2 py-1 rounded ${item.activo ? 'bg-brand-green/10 text-brand-green' : 'bg-muted/10 text-muted'}`}>
                    {item.activo ? 'Activo' : 'Desactivado'}
                  </span>
                  <span className="font-label-caps text-[10px] tracking-widest uppercase bg-surface/50 text-[#855845] px-2 py-1 rounded">
                    {ENTITY_TYPES.find(e => e.code === item.tipo_entidad)?.label || item.tipo_entidad}
                  </span>
                  <span className="text-xs text-muted font-mono">
                    {item.provincia} · {item.distrito} {item.comunidad && `(${item.comunidad})`}
                  </span>
                </div>

                <h2 className="font-headline-md text-xl font-bold text-foreground group-hover:text-primary transition-colors">{item.nombre}</h2>

                {item.tipos_nombres && item.tipos_nombres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {item.tipos_nombres.map((tipo, idx) => (
                      <span key={idx} className="bg-primary/5 text-primary border border-primary/10 rounded px-2.5 py-0.5 text-[11px] font-medium tracking-wide">
                        {tipo}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 justify-end mt-6 pt-4 border-t border-border/50">
                {canUpdate && (
                  <button onClick={() => startEdit(item)} className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
                    <AppIcon name="edit" className="text-[16px]" /> Editar
                  </button>
                )}
                {canUpdate && (
                  <button onClick={() => void toggleField(item, 'activo')} className="flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground">
                    <AppIcon name={item.activo ? 'visibility_off' : 'visibility'} className="text-[16px]" /> {item.activo ? 'Desactivar' : 'Activar'}
                  </button>
                )}
                {canDelete && item.activo && (
                  <button onClick={() => void deactivate(item)} className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800">
                    <AppIcon name="delete" className="text-[16px]" /> Desactivar
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
