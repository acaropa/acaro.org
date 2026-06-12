'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Noticias</h1>
        <button onClick={() => setShowForm(value => !value)} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
          {showForm ? 'Cancelar' : '+ Nueva noticia'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={create} className="grid gap-4 rounded-lg border border-border bg-card p-6">
          <input required placeholder="Título" value={form.titulo}
            onChange={event => setForm(current => ({ ...current, titulo: event.target.value }))}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
          <input placeholder="Resumen" value={form.resumen}
            onChange={event => setForm(current => ({ ...current, resumen: event.target.value }))}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
          <textarea required placeholder="Contenido" value={form.contenido}
            onChange={event => setForm(current => ({ ...current, contenido: event.target.value }))}
            className="min-h-40 rounded-md border border-border bg-background px-3 py-2 text-sm" />
          <select value={form.visibilidad} onChange={event => setForm(current => ({ ...current, visibilidad: event.target.value }))}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm">
            <option value="publica">Pública</option>
            <option value="interna">Interna</option>
          </select>
          <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Guardar borrador</button>
        </form>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {news.length === 0 ? <EmptyState title="No hay noticias" description="Aún no se han creado noticias." /> : (
        <div className="grid gap-4">
          {news.map(item => (
            <article key={item.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div><h2 className="font-semibold">{item.titulo}</h2><p className="mt-1 text-sm text-muted">{item.resumen}</p></div>
                <span className="text-xs capitalize text-muted">{item.estado}</span>
              </div>
              {canPublish && item.estado === 'borrador' && (
                <button onClick={() => void publish(item.id)} className="mt-4 text-sm font-medium text-primary">Publicar</button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
