'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface AuditLog {
  id: number;
  modulo: string;
  accion: string;
  descripcion: string | null;
  entidad_id: number | null;
  ip_address: string | null;
  created_at: string;
  user_email: string | null;
  user_name: string | null;
  user_role: string | null;
}

interface SessionLog {
  id: number;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  expires_at: string;
  user_email: string | null;
  user_name: string | null;
  user_role: string | null;
}

type Tab = 'audit' | 'sessions';

const MODULE_COLORS: Record<string, string> = {
  proyectos:         'text-blue-400',
  biblioteca:        'text-cyan-400',
  noticias:          'text-yellow-300',
  usuarios:          'text-purple-400',
  auth:              'text-green-400',
  socios:            'text-orange-400',
  tecnicos:          'text-pink-400',
  productores:       'text-emerald-400',
  notas_conceptuales:'text-violet-400',
};

const ACTION_COLORS: Record<string, string> = {
  crear:    'text-green-400',
  crear_fase: 'text-green-400',
  actualizar: 'text-yellow-300',
  eliminar:   'text-red-400',
  archivar:   'text-orange-400',
  aprobar:    'text-green-400',
  rechazar:   'text-red-400',
  publicar:   'text-blue-400',
  subir:      'text-cyan-400',
  login:      'text-green-400',
  logout:     'text-gray-400',
  refresh:    'text-gray-400',
};

function moduleColor(mod: string) {
  return MODULE_COLORS[mod?.toLowerCase()] ?? 'text-gray-400';
}
function actionColor(action: string) {
  return ACTION_COLORS[action?.toLowerCase()] ?? 'text-gray-300';
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function fmtTs(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function LogsPage() {
  const [tab, setTab] = useState<Tab>('audit');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [limit, setLimit] = useState(200);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: String(limit) });
      if (moduleFilter) params.set('module', moduleFilter);
      if (search) params.set('search', search);

      if (tab === 'audit') {
        const data = await api.get<AuditLog[]>(`/logs/audit?${params}`);
        setAuditLogs(data);
      } else {
        const sParams = new URLSearchParams({ limit: String(limit) });
        const data = await api.get<SessionLog[]>(`/logs/sessions?${sParams}`);
        setSessionLogs(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar los logs');
    } finally {
      setLoading(false);
    }
  }, [tab, limit, moduleFilter, search]);

  useEffect(() => {
    void api.get<string[]>('/logs/modules')
      .then(setModules)
      .catch(() => {});
  }, []);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoRefresh) {
      intervalRef.current = setInterval(() => void fetchLogs(), 5000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, fetchLogs]);

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  const displayedAudit = auditLogs;
  const displayedSessions = sessionLogs;

  return (
    <>
      <section className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/admin/configuracion" className="text-muted hover:text-foreground transition-colors text-sm">
                Configuración
              </Link>
              <span className="text-muted">/</span>
              <span className="text-sm text-foreground font-medium">Logs</span>
            </div>
            <h1 className="font-headline-lg text-[40px] md:text-[56px] text-foreground leading-tight tracking-tight">
              Logs del sistema
            </h1>
            <p className="font-body-lg text-[16px] text-muted mt-1">
              Registro de actividad y sesiones de la plataforma.
            </p>
          </div>
        </div>
      </section>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Tab switcher */}
        <div className="flex rounded-md overflow-hidden border border-zinc-700 text-xs font-mono">
          <button
            onClick={() => setTab('audit')}
            className={`px-4 py-2 transition-colors ${tab === 'audit' ? 'bg-zinc-700 text-green-400' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
          >
            auditoria
          </button>
          <button
            onClick={() => setTab('sessions')}
            className={`px-4 py-2 transition-colors border-l border-zinc-700 ${tab === 'sessions' ? 'bg-zinc-700 text-green-400' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
          >
            sesiones
          </button>
        </div>

        {tab === 'audit' && (
          <>
            <select
              value={moduleFilter}
              onChange={e => setModuleFilter(e.target.value)}
              className="font-mono text-xs bg-zinc-900 border border-zinc-700 text-zinc-300 px-3 py-2 rounded-md focus:outline-none focus:border-zinc-500"
            >
              <option value="">-- todos los módulos --</option>
              {modules.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="font-mono text-xs bg-zinc-900 border border-zinc-700 text-zinc-300 px-3 py-2 rounded-md focus:outline-none focus:border-zinc-500 w-44"
            />
          </>
        )}

        <select
          value={limit}
          onChange={e => setLimit(Number(e.target.value))}
          className="font-mono text-xs bg-zinc-900 border border-zinc-700 text-zinc-300 px-3 py-2 rounded-md focus:outline-none focus:border-zinc-500"
        >
          <option value={50}>50 líneas</option>
          <option value={200}>200 líneas</option>
          <option value={500}>500 líneas</option>
          <option value={1000}>1000 líneas</option>
        </select>

        <button
          onClick={() => void fetchLogs()}
          disabled={loading}
          className="font-mono text-xs bg-zinc-900 border border-zinc-700 text-zinc-300 px-3 py-2 rounded-md hover:bg-zinc-800 disabled:opacity-50 transition-colors"
        >
          {loading ? '...' : '↺ refrescar'}
        </button>

        <label className="flex items-center gap-2 font-mono text-xs text-zinc-400 cursor-pointer select-none">
          <span
            onClick={() => setAutoRefresh(v => !v)}
            className={`w-8 h-4 rounded-full transition-colors flex items-center ${autoRefresh ? 'bg-green-600' : 'bg-zinc-700'}`}
          >
            <span className={`w-3 h-3 bg-white rounded-full shadow transition-transform mx-0.5 ${autoRefresh ? 'translate-x-4' : ''}`} />
          </span>
          auto (5s)
        </label>

        <button
          onClick={scrollToBottom}
          className="ml-auto font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ↓ ir al final
        </button>
      </div>

      {/* Terminal window */}
      <div className="rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-3 font-mono text-xs text-zinc-500 select-none">
            acaro@system ~ logs/{tab}
            {autoRefresh && <span className="ml-2 text-green-500 animate-pulse">● live</span>}
          </span>
          <span className="ml-auto font-mono text-xs text-zinc-600">
            {tab === 'audit' ? displayedAudit.length : displayedSessions.length} entradas
          </span>
        </div>

        {/* Log output */}
        <div
          className="bg-zinc-950 h-[60vh] overflow-y-auto px-4 py-3 font-mono text-xs leading-6 scroll-smooth"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#3f3f46 transparent' }}
        >
          {error && (
            <div className="text-red-400 mb-2">
              <span className="text-red-500">✗ ERROR</span> {error}
            </div>
          )}

          {!loading && tab === 'audit' && displayedAudit.length === 0 && (
            <span className="text-zinc-600">Sin registros de auditoría.</span>
          )}

          {tab === 'audit' && displayedAudit.map((log) => (
            <div key={log.id} className="flex flex-wrap gap-x-2 hover:bg-zinc-900/50 px-1 -mx-1 rounded group">
              <span className="text-zinc-600 select-none">[{fmtTs(log.created_at)}]</span>
              <span className={`uppercase font-bold ${moduleColor(log.modulo)}`}>{log.modulo}</span>
              <span className="text-zinc-600">›</span>
              <span className={`${actionColor(log.accion)}`}>{log.accion}</span>
              {log.entidad_id != null && (
                <span className="text-zinc-600">#{log.entidad_id}</span>
              )}
              {log.descripcion && (
                <span className="text-zinc-300">{log.descripcion}</span>
              )}
              {log.user_email && (
                <span className="text-zinc-500">
                  — <span className="text-zinc-400">{log.user_email}</span>
                  {log.user_role && <span className="text-zinc-600"> ({log.user_role})</span>}
                </span>
              )}
              {log.ip_address && (
                <span className="text-zinc-600 hidden group-hover:inline">from {log.ip_address}</span>
              )}
            </div>
          ))}

          {tab === 'sessions' && displayedSessions.length === 0 && (
            <span className="text-zinc-600">Sin registros de sesión.</span>
          )}

          {tab === 'sessions' && displayedSessions.map((s) => (
            <div key={s.id} className="flex flex-wrap gap-x-2 hover:bg-zinc-900/50 px-1 -mx-1 rounded group">
              <span className="text-zinc-600 select-none">[{fmtTs(s.created_at)}]</span>
              <span className="text-purple-400 font-bold uppercase">SESSION</span>
              <span className="text-zinc-600">›</span>
              <span className={s.revoked_at ? 'text-red-400' : s.last_used_at ? 'text-green-400' : 'text-yellow-300'}>
                {s.revoked_at ? 'revocada' : s.last_used_at ? 'activa' : 'nueva'}
              </span>
              {s.user_email && (
                <span className="text-zinc-400">
                  {s.user_email}
                  {s.user_role && <span className="text-zinc-600"> ({s.user_role})</span>}
                </span>
              )}
              {s.ip_address && (
                <span className="text-zinc-600">from {s.ip_address}</span>
              )}
              {s.last_used_at && (
                <span className="text-zinc-600 hidden group-hover:inline">
                  last: {fmtTs(s.last_used_at)}
                </span>
              )}
              {s.revoked_at && (
                <span className="text-zinc-600 hidden group-hover:inline">
                  revoked: {fmtTs(s.revoked_at)}
                </span>
              )}
            </div>
          ))}

          {loading && (
            <div className="text-zinc-500 animate-pulse mt-1">cargando...</div>
          )}

          {/* Blinking cursor */}
          <div className="mt-2 flex items-center gap-1 text-zinc-500">
            <span>$</span>
            <span className="inline-block w-2 h-4 bg-green-400 animate-[blink_1s_step-end_infinite]" />
          </div>
          <div ref={bottomRef} />
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </>
  );
}
