'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { PERMISSIONS } from '@/lib/permissions';
import { EmptyState } from '@/components/ui/EmptyState';

interface NewsRecord {
  id: number;
  titulo: string;
  resumen: string | null;
  contenido: string;
  estado: 'borrador' | 'publicada' | 'archivada';
  visibilidad: 'publica' | 'interna';
}

export default function AdminNoticias() {
  const { can } = useAuth();
  const canPublish = can(PERMISSIONS.NOTICIAS_PUBLISH);
  const [news, setNews] = useState<NewsRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titulo: '', resumen: '', contenido: '', visibilidad: 'publica' });
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setNews(await api.get<NewsRecord[]>('/noticias'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las noticias');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    try {
      await api.post('/noticias', form);
      setForm({ titulo: '', resumen: '', contenido: '', visibilidad: 'publica' });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la noticia');
    }
  }

  async function publish(id: number) {
    try {
      await api.post(`/noticias/${id}/publish`, {});
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo publicar la noticia');
    }
  }

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
          <div className="flex shrink-0">
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 font-label-caps text-label-caps bg-primary text-primary-foreground hover:bg-accent transition-colors uppercase tracking-widest"
            >
              + Nueva noticia
            </button>
          </div>
        </div>
      </section>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Redactar Noticia">
        <form onSubmit={create} className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="md:col-span-2">
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Título</label>
              <input required placeholder="Escribe el título aquí..." value={form.titulo}
                onChange={event => setForm(current => ({ ...current, titulo: event.target.value }))}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Resumen (Opcional)</label>
              <input placeholder="Breve descripción de la noticia..." value={form.resumen}
                onChange={event => setForm(current => ({ ...current, resumen: event.target.value }))}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Contenido</label>
              <textarea required placeholder="Cuerpo de la noticia..." value={form.contenido}
                onChange={event => setForm(current => ({ ...current, contenido: event.target.value }))}
                className="min-h-40 w-full bg-background border border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors resize-y" />
            </div>
            <div className="md:col-span-2">
              <label className="block font-label-caps text-[10px] text-muted mb-2 uppercase tracking-widest">Visibilidad</label>
              <select value={form.visibilidad} onChange={event => setForm(current => ({ ...current, visibilidad: event.target.value }))}
                className="w-full bg-background border-b border-border px-4 py-3 font-body-md text-foreground focus:outline-none focus:border-primary transition-colors">
                <option value="publica">Pública</option>
                <option value="interna">Interna</option>
              </select>
            </div>
            
            <div className="md:col-span-2 flex justify-end mt-4">
              <button className="px-8 py-3 bg-primary text-primary-foreground font-label-caps text-[12px] uppercase tracking-widest hover:bg-accent transition-colors">
                Guardar borrador
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {error && <p className="rounded border-l-4 border-red-600 bg-red-50 p-4 font-body-md text-sm text-red-700 mb-8">{error}</p>}

      {news.length === 0 ? (
        <div className="bg-surface/30 border border-border border-dashed p-16 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-[48px] text-muted mb-4 opacity-50">newspaper</span>
          <h3 className="font-headline-md text-xl font-bold text-foreground mb-2">No hay noticias</h3>
          <p className="font-body-md text-muted max-w-md">Aún no se han creado noticias en el sistema.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {news.map(item => (
            <article key={item.id} className="bg-card p-6 border border-border hover:border-primary/30 transition-colors flex flex-col group">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`font-label-caps text-[10px] tracking-widest uppercase px-2 py-1 rounded ${item.estado === 'publicada' ? 'bg-brand-green/10 text-brand-green' : 'bg-accent/10 text-accent'}`}>
                      {item.estado}
                    </span>
                    <span className="text-xs text-muted font-mono capitalize">{item.visibilidad}</span>
                  </div>
                  <h2 className="font-headline-md text-xl font-bold text-foreground group-hover:text-primary transition-colors">{item.titulo}</h2>
                </div>
              </div>
              <p className="mt-1 text-sm text-muted font-body-md flex-1 mb-6 line-clamp-3">{item.resumen || item.contenido}</p>
              
              <div className="flex justify-end mt-auto pt-4 border-t border-border/50">
                {canPublish && item.estado === 'borrador' && (
                  <button onClick={() => void publish(item.id)} className="flex items-center gap-1 text-sm font-medium text-brand-green hover:underline">
                    <span className="material-symbols-outlined text-[16px]">campaign</span> Publicar
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
