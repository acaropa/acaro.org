'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, apiAssetUrl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { PERMISSIONS } from '@/lib/permissions';
import { ImageUploadField, UploadedFile } from '@/components/admin/ImageUploadField';
import { ProductorRecord, formatExperience, formatProducerDate } from '@/lib/producers';

const emptyForm = {
  nombre: '',
  comunidad: '',
  rol: '',
  anios_experiencia: '',
  descripcion: '',
  imagen_url: '',
  activo: true,
  destacado: false,
};

export default function AdminProductores() {
  const { can } = useAuth();
  const canCreate = can(PERMISSIONS.PRODUCTORES_CREATE);
  const canUpdate = can(PERMISSIONS.PRODUCTORES_UPDATE);
  const canDelete = can(PERMISSIONS.PRODUCTORES_DELETE);

  const [producers, setProducers] = useState<ProductorRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [imageMode, setImageMode] = useState<'url' | 'file'>('url');
  const [image, setImage] = useState<UploadedFile | null>(null);
  const [editing, setEditing] = useState<ProductorRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setProducers(await api.get<ProductorRecord[]>('/productores'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los productores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  function resetForm() {
    setForm(emptyForm);
    setImageMode('url');
    setImage(null);
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(item: ProductorRecord) {
    setEditing(item);
    setForm({
      nombre: item.nombre,
      comunidad: item.comunidad || '',
      rol: item.rol || '',
      anios_experiencia: item.anios_experiencia != null ? String(item.anios_experiencia) : '',
      descripcion: item.descripcion || '',
      imagen_url: item.imagen_url || '',
      activo: item.activo,
      destacado: item.destacado,
    });
    setImageMode('url');
    setImage(null);
    setShowForm(true);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, unknown> = {
        nombre: form.nombre,
        comunidad: form.comunidad,
        rol: form.rol,
        anios_experiencia: form.anios_experiencia,
        descripcion: form.descripcion,
        activo: form.activo,
        destacado: form.destacado,
      };
      if (imageMode === 'file' && image) {
        payload.imagen_base64 = image.base64;
        payload.imagen_nombre = image.fileName;
      } else {
        payload.imagen_url = form.imagen_url.trim() || null;
      }
      if (editing) {
        await api.put(`/productores/${editing.id}`, payload);
      } else {
        await api.post('/productores', payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el productor');
    } finally {
      setSaving(false);
    }
  }

  async function toggleField(item: ProductorRecord, field: 'activo' | 'destacado') {
    try {
      await api.put(`/productores/${item.id}`, { [field]: !item[field] });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el productor');
    }
  }

  async function remove(item: ProductorRecord) {
    if (!confirm(`¿Eliminar a "${item.nombre}"?`)) return;
    try {
      await api.delete(`/productores/${item.id}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el productor');
    }
  }

  return (
    <>
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
          <div className="max-w-2xl">
            <h1 className="font-headline-lg text-[40px] md:text-[56px] text-foreground leading-tight mb-3 tracking-tight">
              Productores
            </h1>
            <p className="font-body-lg text-[16px] md:text-[18px] text-muted">
              Administra los perfiles de productores asociados que se muestran en el sitio público.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            {canCreate && (
              <button
                onClick={() => (showForm ? resetForm() : setShowForm(true))}
                className="px-6 py-3 font-label-caps text-label-caps bg-primary text-primary-foreground hover:bg-accent transition-colors uppercase tracking-widest"
              >
                + Nuevo productor
              </button>
            )}
          </div>
        </div>
      </section>

      <Modal isOpen={showForm} onClose={resetForm} title={editing ? 'Editar Productor' : 'Nuevo Productor'}>
        <form onSubmit={save} className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="md:col-span-2">
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Nombre</label>
              <input
                required
                placeholder="Nombre del productor"
                value={form.nombre}
                onChange={event => setForm(current => ({ ...current, nombre: event.target.value }))}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Comunidad / Ubicación (Opcional)</label>
              <input
                placeholder="Ej. Changuinola"
                value={form.comunidad}
                onChange={event => setForm(current => ({ ...current, comunidad: event.target.value }))}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Rol en la asociación (Opcional)</label>
              <input
                placeholder="Ej. Productor asociado"
                value={form.rol}
                onChange={event => setForm(current => ({ ...current, rol: event.target.value }))}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Años de experiencia (Opcional)</label>
              <input
                type="number"
                min={0}
                placeholder="Ej. 12"
                value={form.anios_experiencia}
                onChange={event => setForm(current => ({ ...current, anios_experiencia: event.target.value }))}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Historia / Descripción (Opcional)</label>
              <textarea
                placeholder="Historia o descripción personal del productor..."
                value={form.descripcion}
                onChange={event => setForm(current => ({ ...current, descripcion: event.target.value }))}
                className="min-h-32 w-full bg-background border border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors resize-y"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Imagen / Foto (Opcional)</label>
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-4 py-2 font-label-caps text-[11px] uppercase tracking-widest border transition-colors ${imageMode === 'url' ? 'border-primary text-primary bg-primary/5' : 'border-border text-muted hover:bg-surface'}`}
                >
                  URL externa
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('file')}
                  className={`px-4 py-2 font-label-caps text-[11px] uppercase tracking-widest border transition-colors ${imageMode === 'file' ? 'border-primary text-primary bg-primary/5' : 'border-border text-muted hover:bg-surface'}`}
                >
                  Subir archivo
                </button>
              </div>
              {imageMode === 'url' ? (
                <input
                  type="url"
                  placeholder="https://..."
                  value={form.imagen_url}
                  onChange={event => setForm(current => ({ ...current, imagen_url: event.target.value }))}
                  className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              ) : (
                <ImageUploadField
                  value={image}
                  onChange={setImage}
                  existingUrl={editing?.imagen_url}
                  helperText="Formatos JPG, PNG o WEBP, máximo 4 MB."
                />
              )}
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
                  Visible en el sitio público
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.destacado}
                  onChange={event => setForm(current => ({ ...current, destacado: event.target.checked }))}
                  className="h-4 w-4 accent-primary"
                />
                <span className="font-label-caps text-[11px] uppercase tracking-widest text-foreground">
                  Destacado
                </span>
              </label>
            </div>

            <div className="md:col-span-2 flex justify-end mt-4">
              <button disabled={saving} className="px-8 py-3 bg-primary text-primary-foreground font-label-caps text-[12px] uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar productor'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {error && <p className="rounded border-l-4 border-red-600 bg-red-50 p-4 font-body-md text-sm text-red-700 mb-8">{error}</p>}

      {loading ? (
        <div className="py-12 text-center text-muted font-body-md animate-pulse">Cargando productores...</div>
      ) : producers.length === 0 ? (
        <div className="bg-surface/30 border border-border border-dashed p-16 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-[48px] text-muted mb-4 opacity-50">groups</span>
          <h3 className="font-headline-md text-xl font-bold text-foreground mb-2">Sin productores</h3>
          <p className="font-body-md text-muted max-w-md">Aún no se han registrado perfiles de productores.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {producers.map(item => (
            <article key={item.id} className="bg-card p-6 border border-border hover:border-primary/30 transition-colors flex flex-col group">
              {item.imagen_url && (
                <div className="w-full h-40 mb-4 overflow-hidden bg-surface">
                  <img src={apiAssetUrl(item.imagen_url)} alt={item.nombre} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-label-caps text-[10px] tracking-widest uppercase px-2 py-1 rounded ${item.activo ? 'bg-brand-green/10 text-brand-green' : 'bg-muted/10 text-muted'}`}>
                      {item.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    {item.destacado && (
                      <span className="font-label-caps text-[10px] tracking-widest uppercase text-accent bg-accent/10 px-2 py-1 rounded">
                        Destacado
                      </span>
                    )}
                    {(item.rol || item.comunidad) && (
                      <span className="text-xs text-muted font-mono">
                        {[item.rol, item.comunidad].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </div>
                  <h2 className="font-headline-md text-xl font-bold text-foreground group-hover:text-primary transition-colors">{item.nombre}</h2>
                  <p className="text-xs text-muted font-mono">
                    {formatExperience(item.anios_experiencia) || 'Experiencia no especificada'} · Registrado el {formatProducerDate(item.created_at)}
                  </p>
                </div>
              </div>
              {item.descripcion && (
                <p className="mt-1 text-sm text-muted font-body-md flex-1 mb-6 line-clamp-3">{item.descripcion}</p>
              )}

              <div className="flex flex-wrap gap-4 justify-end mt-auto pt-4 border-t border-border/50">
                {canUpdate && (
                  <button onClick={() => startEdit(item)} className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[16px]">edit</span> Editar
                  </button>
                )}
                {canUpdate && (
                  <button onClick={() => void toggleField(item, 'destacado')} className="flex items-center gap-1 text-sm font-medium text-accent hover:underline">
                    <span className="material-symbols-outlined text-[16px]">star</span> {item.destacado ? 'Quitar destacado' : 'Destacar'}
                  </button>
                )}
                {canUpdate && (
                  <button onClick={() => void toggleField(item, 'activo')} className="flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground">
                    <span className="material-symbols-outlined text-[16px]">{item.activo ? 'visibility_off' : 'visibility'}</span> {item.activo ? 'Ocultar' : 'Publicar'}
                  </button>
                )}
                {canDelete && (
                  <button onClick={() => void remove(item)} className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800">
                    <span className="material-symbols-outlined text-[16px]">delete</span> Eliminar
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
