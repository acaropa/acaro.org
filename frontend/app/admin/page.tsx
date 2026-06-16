'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { ProyectoRecord } from '@/lib/projects';
import type { ProductorRecord } from '@/lib/producers';
import type { NoticiaRecord } from '@/lib/news';

type SocioRecord = {
  id: number;
  estado: string;
  fecha_ingreso: string | null;
  created_at: string;
};

type LibraryRecord = {
  id: number;
  estado: 'borrador' | 'pendiente_revision' | 'requiere_correccion' | 'aprobado' | 'rechazado' | 'archivado';
  fecha_creacion: string;
};

type ConceptNoteRecord = {
  id: number;
  created_at: string;
};

type DashboardData = {
  projects: ProyectoRecord[];
  socios: SocioRecord[];
  producers: ProductorRecord[];
  library: LibraryRecord[];
  news: NoticiaRecord[];
  notes: ConceptNoteRecord[];
};

const emptyData: DashboardData = {
  projects: [],
  socios: [],
  producers: [],
  library: [],
  news: [],
  notes: [],
};

const projectStateLabels: Record<string, string> = {
  pendiente: 'Planificacion',
  en_progreso: 'En curso',
  completado: 'Completados',
  cancelado: 'Cancelados',
};

async function settle<T>(request: Promise<T[]>) {
  try {
    return await request;
  } catch {
    return [];
  }
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-PA').format(value);
}

function percent(value: number) {
  return `${Math.round(value)}%`;
}

function isCurrentMonth(value: string | null | undefined) {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleDateString('es-PA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    const [projects, socios, producers, library, news, notes] = await Promise.all([
      settle(api.get<ProyectoRecord[]>('/proyectos')),
      settle(api.get<SocioRecord[]>('/socios')),
      settle(api.get<ProductorRecord[]>('/productores')),
      settle(api.get<LibraryRecord[]>('/biblioteca')),
      settle(api.get<NoticiaRecord[]>('/noticias')),
      settle(api.get<ConceptNoteRecord[]>('/notas-conceptuales')),
    ]);

    setData({ projects, socios, producers, library, news, notes });
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const activeProjects = data.projects.filter(project => project.estado === 'en_progreso');
    const completedProjects = data.projects.filter(project => project.estado === 'completado');
    const projectProgressValues = data.projects
      .map(project => Number(project.progreso || 0))
      .filter(value => Number.isFinite(value));
    const averageProgress = projectProgressValues.length
      ? projectProgressValues.reduce((total, value) => total + value, 0) / projectProgressValues.length
      : 0;
    const activeSocios = data.socios.filter(socio => socio.estado !== 'inactivo').length;
    const activeProducers = data.producers.filter(producer => Boolean(producer.activo)).length;
    const newCommunityThisMonth =
      data.socios.filter(socio => isCurrentMonth(socio.fecha_ingreso || socio.created_at)).length +
      data.producers.filter(producer => isCurrentMonth(producer.created_at)).length;
    const pendingDocuments = data.library.filter(document => document.estado === 'pendiente_revision').length;
    const approvedDocuments = data.library.filter(document => document.estado === 'aprobado').length;
    const pendingNews = data.news.filter(item => item.estado === 'pendiente').length;
    const publishedNews = data.news.filter(item => item.estado === 'publicada').length;

    return {
      averageProgress,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      activeCommunity: activeSocios + activeProducers,
      newCommunityThisMonth,
      pendingDocuments,
      approvedDocuments,
      pendingNews,
      publishedNews,
      notes: data.notes.length,
    };
  }, [data]);

  const projectStates = useMemo(() => {
    const total = Math.max(data.projects.length, 1);
    return ['pendiente', 'en_progreso', 'completado', 'cancelado'].map(state => {
      const count = data.projects.filter(project => project.estado === state).length;
      return {
        state,
        count,
        height: Math.max(10, Math.round((count / total) * 100)),
      };
    });
  }, [data.projects]);

  const currentProjects = useMemo(() => {
    return [...data.projects]
      .filter(project => project.estado !== 'cancelado')
      .sort((a, b) => Number(b.progreso || 0) - Number(a.progreso || 0))
      .slice(0, 3);
  }, [data.projects]);

  return (
    <>
      <section className="mb-8">
        <div className="flex flex-col gap-5 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h1 className="font-headline-lg text-[40px] md:text-[56px] text-foreground leading-tight mb-3 tracking-tight">
              Panorama Institucional
            </h1>
            <p className="font-body-lg text-[16px] md:text-[18px] text-muted">
              Supervisa proyectos, comunidad, documentos, noticias y notas conceptuales con datos reales de la plataforma.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 border border-border px-5 py-3 font-label-caps text-label-caps uppercase tracking-widest text-foreground transition-colors hover:bg-surface disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]">{refreshing ? 'progress_activity' : 'refresh'}</span>
            Actualizar
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-8 md:col-span-8">
          <div className="mb-12 flex items-start justify-between gap-6">
            <div>
              <span className="font-label-caps text-label-caps text-muted mb-2 block">Avance promedio de proyectos</span>
              <div className="font-display-number text-display-number text-foreground">
                {loading ? '...' : percent(stats.averageProgress)}
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-data-mono text-data-mono text-primary">
              <span className="material-symbols-outlined text-[16px]">account_tree</span>
              {formatNumber(data.projects.length)} total
            </div>
          </div>
          <div className="relative flex h-48 w-full items-end gap-4 border-b border-border">
            {projectStates.map(item => (
              <div key={item.state} className="flex h-full flex-1 flex-col justify-end">
                <div
                  className="w-full rounded-t bg-primary/70 transition-all"
                  style={{ height: loading ? '18%' : `${item.height}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 font-data-mono text-[10px] uppercase text-muted md:grid-cols-4">
            {projectStates.map(item => (
              <div key={item.state} className="flex items-center justify-between gap-2">
                <span>{projectStateLabels[item.state]}</span>
                <span className="text-foreground">{loading ? '-' : item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 md:col-span-4">
          <div className="flex-1 rounded-xl border border-border bg-card p-8">
            <span className="font-label-caps text-label-caps text-muted mb-2 block">Comunidad activa</span>
            <div className="font-headline-lg text-headline-lg text-foreground mb-4">
              {loading ? '...' : formatNumber(stats.activeCommunity)}
            </div>
            <div className="flex items-center gap-2 font-data-mono text-data-mono text-muted">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Nuevos este mes: {loading ? '-' : formatNumber(stats.newCommunityThisMonth)}
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-between rounded-xl bg-primary p-8 text-primary-foreground">
            <div>
              <span className="font-label-caps text-label-caps text-primary-foreground/70 mb-2 block">Pendientes por atender</span>
              <div className="font-headline-lg text-headline-lg mb-4">
                {loading ? '...' : formatNumber(stats.pendingDocuments + stats.pendingNews)}
              </div>
              <p className="text-sm leading-6 text-primary-foreground/75">
                Biblioteca: {stats.pendingDocuments} · Noticias: {stats.pendingNews}
              </p>
            </div>
            <Link
              href="/admin/biblioteca"
              className="mt-4 w-full rounded-lg bg-primary-foreground px-4 py-3 text-center font-label-caps text-label-caps uppercase tracking-widest text-primary transition-colors hover:bg-accent hover:text-primary-foreground"
            >
              Revisar
            </Link>
          </div>
        </div>
      </div>

      <section>
        <div className="mt-12 mb-8 flex items-end justify-between border-b border-border pb-4">
          <div>
            <h2 className="font-headline-md text-headline-md text-foreground">Proyectos en curso</h2>
            <p className="mt-2 text-sm text-muted">Ordenados por avance registrado.</p>
          </div>
          <Link href="/admin/proyectos" className="font-label-caps text-label-caps text-muted hover:text-primary flex items-center gap-1 transition-colors">
            Ver todos <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[0, 1, 2].map(item => (
              <div key={item} className="h-44 animate-pulse rounded-xl border border-border bg-surface" />
            ))}
          </div>
        ) : currentProjects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <span className="material-symbols-outlined mb-3 text-[42px] text-muted">account_tree_off</span>
            <h3 className="font-headline-md text-xl text-foreground">Sin proyectos disponibles</h3>
            <p className="mt-2 text-sm text-muted">Cuando existan proyectos, apareceran aqui automaticamente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {currentProjects.map(project => {
              const progress = Math.max(0, Math.min(100, Number(project.progreso || 0)));
              return (
                <Link
                  key={project.id}
                  href={`/admin/proyectos/gestion?id=${project.id}`}
                  className="rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <span className="font-label-caps text-[10px] uppercase tracking-widest text-muted">
                      {project.clasificacion || projectStateLabels[project.estado] || 'General'}
                    </span>
                    <span className={`h-2 w-2 rounded-full ${project.estado === 'en_progreso' ? 'bg-primary' : 'bg-primary/40'}`} />
                  </div>
                  <h3 className="font-body-lg text-body-lg mb-2 font-semibold text-foreground">{project.nombre}</h3>
                  <p className="line-clamp-2 min-h-[44px] text-sm leading-6 text-muted">{project.descripcion || 'Sin descripcion registrada.'}</p>
                  <div className="mt-6 mb-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between font-data-mono text-[12px] text-muted">
                    <span>{formatDate(project.fecha_inicio || project.created_at)}</span>
                    <span>{progress}%</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <MetricTile label="Documentos aprobados" value={stats.approvedDocuments} href="/admin/biblioteca" />
        <MetricTile label="Noticias publicadas" value={stats.publishedNews} href="/admin/noticias" />
        <MetricTile label="Notas conceptuales" value={stats.notes} href="/admin/notas-conceptuales" />
        <MetricTile label="Proyectos completados" value={stats.completedProjects} href="/admin/proyectos" />
      </section>
    </>
  );
}

function MetricTile({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
      <span className="font-label-caps text-[10px] uppercase tracking-widest text-muted">{label}</span>
      <span className="mt-4 block font-headline-lg text-3xl text-foreground">{formatNumber(value)}</span>
    </Link>
  );
}
