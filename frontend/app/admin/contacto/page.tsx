'use client';

import { useCallback, useEffect, useState } from 'react';
import { Mail, MailOpen, Reply, Trash2, X, Send, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { AppIcon } from '@/components/ui/AppIcon';

type Mensaje = {
  id: number;
  nombre: string;
  correo: string;
  asunto: string;
  mensaje: string;
  leido: number;
  respondido: number;
  created_at: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-PA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ContactoAdminPage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [selected, setSelected] = useState<Mensaje | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await api.get<Mensaje[]>('/contacto/mensajes');
      setMensajes(data);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function openMensaje(msg: Mensaje) {
    try {
      const full = await api.get<Mensaje>(`/contacto/mensajes/${msg.id}`);
      setSelected(full);
      setReply('');
      setError('');
      setSuccess('');
      setMensajes(prev => prev.map(m => m.id === full.id ? { ...m, leido: 1 } : m));
    } catch {
      setSelected({ ...msg, leido: 1 });
    }
  }

  async function handleReply() {
    if (!selected || !reply.trim()) return;
    setSending(true);
    setError('');
    setSuccess('');
    try {
      await api.post(`/contacto/mensajes/${selected.id}/responder`, { respuesta: reply });
      setSuccess('Respuesta enviada correctamente.');
      setReply('');
      setMensajes(prev => prev.map(m => m.id === selected.id ? { ...m, respondido: 1 } : m));
      setSelected(prev => prev ? { ...prev, respondido: 1 } : null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al enviar la respuesta.');
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este mensaje?')) return;
    setDeleting(true);
    try {
      await api.delete(`/contacto/mensajes/${id}`);
      setMensajes(prev => prev.filter(m => m.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {
      // silencioso
    } finally {
      setDeleting(false);
    }
  }

  const noLeidos = mensajes.filter(m => !m.leido).length;

  return (
    <>
      <section className="mb-8">
        <div className="flex flex-col gap-5 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-headline-lg text-[40px] md:text-[56px] text-foreground leading-tight mb-3 tracking-tight">
              Bandeja de Contacto
            </h1>
            <p className="font-body-lg text-[16px] md:text-[18px] text-muted">
              Mensajes recibidos desde el formulario público.
              {noLeidos > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
                  {noLeidos} sin leer
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 border border-border px-5 py-3 font-label-caps text-label-caps uppercase tracking-widest text-foreground transition-colors hover:bg-surface disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Lista de mensajes */}
        <div className="md:col-span-4 rounded-xl border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="space-y-3 p-4">
              {[0,1,2,3].map(i => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-surface" />
              ))}
            </div>
          ) : mensajes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <Mail className="mb-3 h-10 w-10 text-muted" />
              <p className="text-sm text-muted">No hay mensajes recibidos.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {mensajes.map(msg => (
                <li key={msg.id}>
                  <button
                    type="button"
                    onClick={() => void openMensaje(msg)}
                    className={`w-full text-left px-4 py-4 transition-colors hover:bg-surface ${selected?.id === msg.id ? 'bg-surface' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {msg.leido
                          ? <MailOpen className="h-4 w-4 text-muted" />
                          : <Mail className="h-4 w-4 text-primary" />
                        }
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`truncate text-sm ${msg.leido ? 'font-medium text-foreground' : 'font-bold text-foreground'}`}>
                            {msg.nombre}
                          </span>
                          {msg.respondido === 1 && (
                            <span className="shrink-0 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">
                              Respondido
                            </span>
                          )}
                        </div>
                        <p className={`mt-0.5 truncate text-xs ${msg.leido ? 'text-muted' : 'font-semibold text-foreground'}`}>
                          {msg.asunto}
                        </p>
                        <p className="mt-1 text-[10px] text-muted">
                          {formatDate(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Panel de mensaje */}
        <div className="md:col-span-8">
          {!selected ? (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card text-center">
              <AppIcon name="mail" className="mb-3 text-[42px] text-muted" />
              <p className="text-sm text-muted">Selecciona un mensaje para leerlo</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card">
              {/* Cabecera del mensaje */}
              <div className="flex items-start justify-between gap-4 border-b border-border p-6">
                <div className="min-w-0">
                  <h2 className="font-headline-md text-xl font-bold text-foreground">{selected.asunto}</h2>
                  <p className="mt-1 text-sm text-muted">
                    <span className="font-semibold text-foreground">{selected.nombre}</span>
                    {' — '}
                    <a href={`mailto:${selected.correo}`} className="text-primary hover:underline">
                      {selected.correo}
                    </a>
                  </p>
                  <p className="mt-1 text-xs text-muted">{formatDate(selected.created_at)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleDelete(selected.id)}
                    disabled={deleting}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    title="Eliminar mensaje"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-surface"
                    title="Cerrar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Cuerpo del mensaje */}
              <div className="p-6">
                <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">{selected.mensaje}</p>
              </div>

              {/* Panel de respuesta */}
              <div className="border-t border-border p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Reply className="h-4 w-4 text-muted" />
                  <span className="text-sm font-semibold text-foreground">
                    Responder a {selected.correo}
                  </span>
                </div>

                {success && (
                  <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
                    {success}
                  </div>
                )}
                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                    {error}
                  </div>
                )}

                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  rows={5}
                  placeholder="Escribe tu respuesta aquí..."
                  className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => void handleReply()}
                    disabled={sending || !reply.trim()}
                    className="inline-flex items-center gap-2 bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    {sending ? 'Enviando...' : 'Enviar respuesta'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
