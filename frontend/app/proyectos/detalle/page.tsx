'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Download, FileText } from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ScrollReveal } from '@/components/landing/LandingMotion';
import { EmptyState } from '@/components/ui/EmptyState';
import { api, apiAssetUrl } from '@/lib/api';
import { ProyectoRecord, STATUS_MAP, formatProjectDate } from '@/lib/projects';

const FASE_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  completado: 'Completado',
};

function ProyectoDetalle() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') || '';

  const [proyecto, setProyecto] = useState<ProyectoRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    api.get<ProyectoRecord>(`/proyectos/slug/${slug}`)
      .then(setProyecto)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <PublicLayout className="landing-typography">
      <main className="flex-grow pt-32 pb-[120px] px-[20px] md:px-[64px] max-w-[1280px] mx-auto w-full">
        <div className="mb-12">
          <Link href="/proyectos" className="text-xs font-bold tracking-widest uppercase text-primary border-b border-accent w-max pb-1">
            ← Volver a proyectos
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-muted">Cargando proyecto...</div>
        ) : notFound || !proyecto ? (
          <EmptyState
            title="Proyecto no encontrado"
            description="Es posible que este proyecto ya no esté disponible públicamente."
          />
        ) : (
          <ScrollReveal delay={0} distance="md">
            <article>
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
              </div>

              <h1 className={`landing-hero-title font-serif text-[40px] leading-[1.1] md:text-[64px] tracking-[-0.04em] text-primary ${(proyecto.responsable_nombre || proyecto.responsable_email) ? 'mb-[16px]' : 'mb-[40px]'}`}>
                {proyecto.nombre}
              </h1>

              {(proyecto.responsable_nombre || proyecto.responsable_email) && (
                <p className="text-xs font-semibold tracking-wider text-muted mb-[40px]">
                  Responsable: <span className="text-primary">{proyecto.responsable_nombre || proyecto.responsable_email}</span>
                </p>
              )}

              {proyecto.imagen_portada && (
                <div className="w-full h-[320px] md:h-[480px] bg-surface overflow-hidden mb-[48px]">
                  <img
                    alt={proyecto.nombre}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    src={apiAssetUrl(proyecto.imagen_portada)}
                  />
                </div>
              )}

              {proyecto.descripcion && (
                <p className="text-[18px] leading-[1.8] text-muted max-w-3xl mb-[64px]">{proyecto.descripcion}</p>
              )}

              {/* Fases */}
              {proyecto.fases && proyecto.fases.length > 0 && (
                <section className="mb-[64px]">
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
                          <p className="text-[15px] leading-[1.6] text-muted mb-[16px]">{fase.descripcion}</p>
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
