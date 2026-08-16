'use client';

import { DataLoadingState } from "@/components/ui/TypingIndicator";

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Download, FileText } from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ScrollReveal } from '@/components/landing/LandingMotion';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppIcon } from '@/components/ui/AppIcon';
import { api, apiAssetUrl } from '@/lib/api';
import { ProyectoRecord, STATUS_MAP, formatProjectDate, formatProjectDuration } from '@/lib/projects';

const FASE_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  completado: 'Completado',
};

function ProyectoDetalle() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') || '';

  const [proyecto, setProyecto] = useState<ProyectoRecord | null>(null);
  const [loading, setLoading] = useState(Boolean(slug));
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) return;

      setLoading(true);
      setNotFound(false);
      setProyecto(null);

      api.get<ProyectoRecord>(`/proyectos/slug/${slug}`)
        .then(data => {
          if (!cancelled) setProyecto(data);
        })
        .catch(() => {
          if (!cancelled) setNotFound(true);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const hasProjectMeta = Boolean(
    proyecto?.responsable_nombre ||
    proyecto?.responsable_email ||
    proyecto?.fecha_inicio ||
    proyecto?.fecha_fin
  );

  return (
    <PublicLayout className="landing-typography">
      <main className="flex-grow pt-32 pb-[120px] px-[20px] md:px-[56px] lg:px-[72px] max-w-[1440px] mx-auto w-full">
        <div className="mb-12">
          <Link href="/proyectos" className="text-xs font-bold tracking-widest uppercase text-primary border-b border-accent w-max pb-1">
            ← Volver a proyectos
          </Link>
        </div>

        {loading ? (
          <DataLoadingState label="Cargando proyecto..." className="py-24" />
        ) : notFound || !proyecto ? (
          <EmptyState
            title="Proyecto no encontrado"
            description="Es posible que este proyecto ya no esté disponible públicamente."
          />
        ) : (
          <ScrollReveal delay={0} distance="md">
            <article className="space-y-[64px]">
              <header className="mx-auto max-w-[920px]">
                <div className="flex flex-wrap items-center gap-[16px] mb-[24px]">
                  {proyecto.clasificacion && (
                    <span className="inline-block bg-accent text-primary-foreground px-3 py-1 text-[12px] font-semibold tracking-[0.1em] leading-none uppercase">
                      {proyecto.clasificacion}
                    </span>
                  )}
                  <span className="text-xs font-bold tracking-widest uppercase text-primary/60">
                    {STATUS_MAP[proyecto.estado]}
                  </span>
                  {formatProjectDate(proyecto) && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-primary/30"></span>
                      <span className="text-xs font-bold tracking-widest uppercase text-muted">{formatProjectDate(proyecto)}</span>
                    </>
                  )}
                  {formatProjectDuration(proyecto) && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-primary/30"></span>
                      <span className="text-xs font-bold tracking-widest uppercase text-muted">Duración: {formatProjectDuration(proyecto)}</span>
                    </>
                  )}
                </div>

                <h1 className="font-serif font-semibold text-[32px] md:text-[52px] leading-[1.2] tracking-[-0.015em] text-primary">
                  {proyecto.nombre}
                </h1>
              </header>

              <div className="mx-auto max-w-[920px]">
                {proyecto.imagen_portada && (
                  <div className="w-full aspect-[16/9] min-h-[220px] max-h-[420px] bg-white overflow-hidden border border-primary/10">
                    <img
                      alt={proyecto.nombre}
                      loading="lazy"
                      className="w-full h-full object-contain p-[18px] md:p-[32px]"
                      src={apiAssetUrl(proyecto.imagen_portada)}
                    />
                  </div>
                )}

                {proyecto.descripcion && (
                  <section className={`${proyecto.imagen_portada ? 'mt-[32px]' : ''} border-y border-primary/10 py-[28px]`}>
                    <p className="text-left md:text-justify text-[17px] leading-[1.8] text-muted [hyphens:auto]">{proyecto.descripcion}</p>
                  </section>
                )}

                {hasProjectMeta && (
                  <dl className={`${proyecto.descripcion ? 'mt-[24px]' : proyecto.imagen_portada ? 'mt-[28px]' : ''} grid grid-cols-1 gap-[16px] border-b border-primary/10 pb-[28px] md:grid-cols-3`}>
                    {(proyecto.responsable_nombre || proyecto.responsable_email) && (
                      <div>
                        <dt className="text-[11px] font-bold tracking-widest uppercase text-muted">Responsable</dt>
                        <dd className="mt-1 text-[15px] font-semibold text-primary">{proyecto.responsable_nombre || proyecto.responsable_email}</dd>
                      </div>
                    )}
                    {formatProjectDate(proyecto) && (
                      <div>
                        <dt className="text-[11px] font-bold tracking-widest uppercase text-muted">Periodo</dt>
                        <dd className="mt-1 text-[15px] font-semibold text-primary">{formatProjectDate(proyecto)}</dd>
                      </div>
                    )}
                    {formatProjectDuration(proyecto) && (
                      <div>
                        <dt className="text-[11px] font-bold tracking-widest uppercase text-muted">Duración</dt>
                        <dd className="mt-1 text-[15px] font-semibold text-primary">{formatProjectDuration(proyecto)}</dd>
                      </div>
                    )}
                  </dl>
                )}
              </div>

              {/* Indicadores destacados */}
              {proyecto.indicadores && proyecto.indicadores.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-[24px]">
                  {proyecto.indicadores.map(indicador => (
                    <div key={indicador.id} className="border border-primary/10 bg-surface p-[24px] text-center">
                      <AppIcon name={indicador.icono} className="text-[32px] text-accent" decorative={false} />
                      <strong className="mt-3 block font-serif text-[28px] leading-[1.2] text-primary">{indicador.valor}</strong>
                      <span className="mt-1 block text-[13px] leading-[1.4] text-muted">{indicador.etiqueta}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Fases */}
              {proyecto.fases && proyecto.fases.length > 0 && (
                <section>
                  <h2 className="font-serif text-[28px] font-semibold text-primary mb-[32px]">Avance del proyecto</h2>
                  <div className="flex flex-col gap-[40px]">
                    {proyecto.fases.map(fase => (
                      <div key={fase.id} className="border-l-2 border-primary/20 pl-[24px]">
                        <div className="flex flex-wrap items-center justify-between gap-[12px] mb-[8px]">
                          <h3 className="font-serif text-[22px] font-semibold text-primary">{fase.nombre}</h3>
                          <span className="text-xs font-bold tracking-widest uppercase text-accent">
                            {FASE_LABELS[fase.estado] || fase.estado}
                          </span>
                        </div>
                        {fase.descripcion && (
                          <p className="mb-[16px] text-justify text-[15px] leading-[1.6] text-muted [hyphens:auto]">{fase.descripcion}</p>
                        )}
                        <div className="h-[6px] w-full bg-surface mb-[8px]">
                          <div
                            className="h-full bg-accent"
                            style={{ width: `${Math.min(100, Math.max(0, fase.porcentaje_avance))}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted mb-[16px]">{fase.porcentaje_avance}% completado</p>

                        {fase.imagenes && fase.imagenes.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-[12px]">
                            {fase.imagenes.map(imagen => (
                              <div key={imagen.id} className="h-[140px] bg-surface overflow-hidden">
                                <img
                                  alt={imagen.descripcion || fase.nombre}
                                  loading="lazy"
                                  className="w-full h-full object-cover"
                                  src={apiAssetUrl(imagen.url)}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Impacto */}
              {proyecto.impacto && (
                <div className="bg-primary p-[32px] text-primary-foreground">
                  <p className="text-[16px] leading-[1.6]">{proyecto.impacto}</p>
                </div>
              )}

              {/* Evidencias públicas */}
              {proyecto.evidencias && proyecto.evidencias.length > 0 && (
                <section>
                  <h2 className="font-serif text-[28px] font-semibold text-primary mb-[32px]">Documentos y evidencias</h2>
                  <div className="flex flex-col gap-[1px] border border-primary/20">
                    {proyecto.evidencias.map(archivo => (
                      <a
                        key={archivo.id}
                        href={apiAssetUrl(archivo.archivo_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="group flex items-center gap-[16px] p-[20px] bg-background hover:bg-surface transition-colors"
                      >
                        <FileText className="h-5 w-5 text-accent shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-primary truncate">{archivo.titulo}</p>
                          <p className="text-xs text-muted uppercase">{archivo.tipo}</p>
                        </div>
                        <Download className="h-4 w-4 text-primary shrink-0" />
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </article>
          </ScrollReveal>
        )}
      </main>
    </PublicLayout>
  );
}

export default function ProyectoDetallePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ProyectoDetalle />
    </Suspense>
  );
}
