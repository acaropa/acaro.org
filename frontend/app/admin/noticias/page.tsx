'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, apiAssetUrl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { PERMISSIONS } from '@/lib/permissions';
import { ImageUploadField, UploadedFile } from '@/components/admin/ImageUploadField';
import { NoticiaRecord, newsCategories, formatNoticiaDate } from '@/lib/news';

const emptyForm = {
  titulo: '',
  resumen: '',
  contenido: '',
  categoria: newsCategories[newsCategories.length - 1],
  visibilidad: 'publica' as 'publica' | 'interna',
  imagen_portada: '',
};

const stateLabels: Record<NoticiaRecord['estado'], string> = {
  borrador: 'Borrador',
  pendiente: 'Pendiente',
  publicada: 'Publicada',
  archivada: 'Archivada',
};

const stateTabs: Array<{ state: NoticiaRecord['estado']; label: string }> = [
  { state: 'pendiente', label: 'Pendientes' },
  { state: 'borrador', label: 'Borradores' },
  { state: 'publicada', label: 'Publicadas' },
  { state: 'archivada', label: 'Archivadas' },
];

export default function AdminNoticias() {
  const { user, can } = useAuth();
  const canCreate = can(PERMISSIONS.NOTICIAS_CREATE, PERMISSIONS.NOTICIAS_CREATE_OWN);
  const canUpdateAll = can(PERMISSIONS.NOTICIAS_UPDATE);
  const canPublish = can(PERMISSIONS.NOTICIAS_PUBLISH);
  const canDelete = can(PERMISSIONS.NOTICIAS_DELETE);

  const [news, setNews] = useState<NoticiaRecord[]>([]);
  const [activeTab, setActiveTab] = useState<NoticiaRecord['estado']>(canPublish ? 'pendiente' : 'borrador');
  const [mineOnly, setMineOnly] = useState(!canUpdateAll);
  const [form, setForm] = useState(emptyForm);
  const [imageMode, setImageMode] = useState<'url' | 'file'>('url');
  const [cover, setCover] = useState<UploadedFile | null>(null);
  const [editing, setEditing] = useState<NoticiaRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setNews(await api.get<NoticiaRecord[]>('/noticias'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las noticias');
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
    setCover(null);
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(item: NoticiaRecord) {
    setEditing(item);
    setForm({
      titulo: item.titulo,
      resumen: item.resumen || '',
      contenido: item.contenido,
      categoria: item.categoria,
      visibilidad: item.visibilidad,
      imagen_portada: item.imagen_portada || '',
    });
    setImageMode('url');
    setCover(null);
    setShowForm(true);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, unknown> = { ...form };
      if (imageMode === 'file' && cover) {
        delete payload.imagen_portada;
        payload.imagen_base64 = cover.base64;
        payload.imagen_nombre = cover.fileName;
      } else {
        payload.imagen_portada = form.imagen_portada.trim() || null;
      }
      if (editing) {
        await api.put(`/noticias/${editing.id}`, payload);
      } else {
        await api.post('/noticias', payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la noticia');
    } finally {
      setSaving(false);
    }
  }

  async function publish(item: NoticiaRecord) {
    try {
      await api.post(`/noticias/${item.id}/publish`, {});
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo publicar la noticia');
    }
  }

  async function archive(item: NoticiaRecord) {
    try {
      await api.put(`/noticias/${item.id}`, { estado: 'archivada' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo archivar la noticia');
    }
  }

  async function remove(item: NoticiaRecord) {
    if (!confirm(`¿Eliminar "${item.titulo}"?`)) return;
    try {
      await api.delete(`/noticias/${item.id}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la noticia');
    }
  }

  const filtered = useMemo(() => {
    return news.filter(item => {
      if (item.estado !== activeTab) return false;
      if (mineOnly && item.creado_por !== user?.id) return false;
      return true;
    });
  }, [news, activeTab, mineOnly, user?.id]);

  return (
    <>
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
          <div className="max-w-2xl">
            <h1 className="font-headline-lg text-[40px] md:text-[56px] text-foreground leading-tight mb-3 tracking-tight">
              Noticias
            </h1>
            <p className="font-body-lg text-[16px] md:text-[18px] text-muted">
              Gestiona los anuncios y noticias de la organización.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            {canUpdateAll && (
              <button
                type="button"
                onClick={() => setMineOnly(value => !value)}
                className="px-6 py-3 font-label-caps text-label-caps border border-border text-foreground hover:bg-surface transition-colors uppercase tracking-widest"
              >
                {mineOnly ? 'Ver todas' : 'Mis noticias'}
              </button>
            )}
            {canCreate && (
              <button
                onClick={() => (showForm ? resetForm() : setShowForm(true))}
                className="px-6 py-3 font-label-caps text-label-caps bg-primary text-primary-foreground hover:bg-accent transition-colors uppercase tracking-widest"
              >
                + Nueva noticia
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-6 mb-8 border-b border-border">
        {stateTabs.map(tab => {
          const isActive = activeTab === tab.state;
          return (
            <button
              key={tab.state}
              type="button"
              onClick={() => setActiveTab(tab.state)}
              className={`pb-3 font-label-caps text-[12px] tracking-widest uppercase transition-colors relative ${
                isActive ? 'text-primary' : 'text-muted hover:text-foreground'
              }`}
            >
              {tab.label}
              {isActive && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-primary"></span>}
            </button>
          );
        })}
      </div>

      <Modal isOpen={showForm} onClose={resetForm} title={editing ? 'Editar Noticia' : 'Redactar Noticia'}>
        <form onSubmit={save} className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="md:col-span-2">
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Título</label>
              <input
                required
                placeholder="Escribe el título aquí..."
                value={form.titulo}
                onChange={event => setForm(current => ({ ...current, titulo: event.target.value }))}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Resumen (Opcional)</label>
              <input
                placeholder="Breve descripción de la noticia..."
                value={form.resumen}
                onChange={event => setForm(current => ({ ...current, resumen: event.target.value }))}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Contenido</label>
              <textarea
                required
                placeholder="Cuerpo de la noticia..."
                value={form.contenido}
                onChange={event => setForm(current => ({ ...current, contenido: event.target.value }))}
                className="min-h-40 w-full bg-background border border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors resize-y"
              />
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Categoría</label>
              <select
                value={form.categoria}
                onChange={event => setForm(current => ({ ...current, categoria: event.target.value }))}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors"
              >
                {newsCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Visibilidad</label>
              <select
                value={form.visibilidad}
                onChange={event => setForm(current => ({ ...current, visibilidad: event.target.value as 'publica' | 'interna' }))}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors"
              >
                <option value="publica">Pública</option>
                <option value="interna">Interna</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Imagen de portada (Opcional)</label>
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
                  value={form.imagen_portada}
                  onChange={event => setForm(current => ({ ...current, imagen_portada: event.target.value }))}
                  className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              ) : (
                <ImageUploadField
                  value={cover}
                  onChange={setCover}
                  existingUrl={editing?.imagen_portada}
                  helperText="Formatos JPG, PNG o WEBP, máximo 4 MB."
                />
              )}
            </div>

            <div className="md:col-span-2 flex justify-end mt-4">
              <button disabled={saving} className="px-8 py-3 bg-primary text-primary-foreground font-label-caps text-[12px] uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar noticia'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {error && <p className="rounded border-l-4 border-red-600 bg-red-50 p-4 font-body-md text-sm text-red-700 mb-8">{error}</p>}

      {loading ? (
        <div className="py-12 text-center text-muted font-body-md animate-pulse">Cargando noticias...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface/30 border border-border border-dashed p-16 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-[48px] text-muted mb-4 opacity-50">newspaper</span>
          <h3 className="font-headline-md text-xl font-bold text-foreground mb-2">Sin noticias</h3>
          <p className="font-body-md text-muted max-w-md">No se encontraron noticias en este estado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map(item => {
            const isOwner = item.creado_por === user?.id;
            const canEdit = canUpdateAll || (isOwner && ['borrador', 'pendiente'].includes(item.estado));
            return (
              <article key={item.id} className="bg-card p-6 border border-border hover:border-primary/30 transition-colors flex flex-col group">
                {item.imagen_portada && (
                  <div className="w-full h-40 mb-4 overflow-hidden bg-surface">
                    <img src={apiAssetUrl(item.imagen_portada)} alt={item.titulo} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-label-caps text-[10px] tracking-widest uppercase px-2 py-1 rounded ${item.estado === 'publicada' ? 'bg-brand-green/10 text-brand-green' : 'bg-accent/10 text-accent'}`}>
                        {stateLabels[item.estado]}
                      </span>
                      <span className="text-xs text-muted font-mono capitalize">{item.visibilidad}</span>
                      <span className="font-label-caps text-[10px] tracking-widest uppercase text-accent bg-accent/10 px-2 py-1 rounded">
                        {item.categoria}
                      </span>
                    </div>
                    <h2 className="font-headline-md text-xl font-bold text-foreground group-hover:text-primary transition-colors">{item.titulo}</h2>
                    <p className="text-xs text-muted font-mono">
                      {item.creado_por_email} · {formatNoticiaDate(item)}
                    </p>
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted font-body-md flex-1 mb-6 line-clamp-3">{item.resumen || item.contenido}</p>

                <div className="flex flex-wrap gap-4 justify-end mt-auto pt-4 border-t border-border/50">
                  {canEdit && (
                    <button onClick={() => startEdit(item)} className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[16px]">edit</span> Editar
                    </button>
                  )}
                  {canPublish && ['borrador', 'pendiente'].includes(item.estado) && (
                    <button onClick={() => void publish(item)} className="flex items-center gap-1 text-sm font-medium text-brand-green hover:underline">
                      <span className="material-symbols-outlined text-[16px]">campaign</span> Publicar
                    </button>
                  )}
                  {canUpdateAll && item.estado !== 'archivada' && (
                    <button onClick={() => void archive(item)} className="flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground">
                      <span className="material-symbols-outlined text-[16px]">inventory_2</span> Archivar
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => void remove(item)} className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800">
                      <span className="material-symbols-outlined text-[16px]">delete</span> Eliminar
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
