'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ScrollReveal } from '@/components/landing/LandingMotion';
import { EmptyState } from '@/components/ui/EmptyState';
import { api } from '@/lib/api';
import { ProductorRecord, formatExperience, formatProducerDate, producerImage } from '@/lib/producers';

function ProductorDetalle() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') || '';
  const hasSlug = Boolean(slug);

  const [producer, setProducer] = useState<ProductorRecord | null>(null);
  const [loading, setLoading] = useState(hasSlug);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!hasSlug) return;

    api.get<ProductorRecord>(`/productores/slug/${slug}`)
      .then(setProducer)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [hasSlug, slug]);

  const experience = formatExperience(producer?.anios_experiencia);
  const details = [
    producer?.rol,
    producer?.comunidad,
    experience,
    producer ? `Publicado desde ${formatProducerDate(producer.created_at)}` : null,
  ].filter(Boolean);

  return (
    <PublicLayout className="landing-typography">
      <main className="flex-grow max-w-[1280px] mx-auto w-full px-[20px] md:px-[64px] py-[80px]">
        <div className="mb-[48px]">
          <Link href="/productores" className="text-xs font-bold tracking-widest uppercase text-primary border-b border-accent w-max pb-1">
            ← Volver a productores
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-muted">Cargando productor...</div>
        ) : !hasSlug || notFound || !producer ? (
          <EmptyState
            title="Productor no encontrado"
            description="Es posible que este perfil ya no esté disponible o haya sido retirado."
          />
        ) : (
          <ScrollReveal delay={0} distance="md">
            <article className="grid grid-cols-1 lg:grid-cols-12 gap-[48px] items-start">
              <div className="lg:col-span-5">
                <div className="sticky top-28 bg-surface overflow-hidden">
                  <img
                    alt={producer.nombre}
                    loading="lazy"
                    className="w-full h-[420px] md:h-[620px] object-cover"
                    src={producerImage(producer)}
                  />
                </div>
              </div>

              <div className="lg:col-span-7">
                {producer.destacado && (
                  <span className="inline-flex mb-6 bg-accent text-primary-foreground px-3 py-1 text-[12px] font-semibold tracking-[0.1em] leading-none uppercase">
                    Destacado
                  </span>
                )}

                <h1 className="landing-hero-title text-[40px] md:text-[64px] leading-[1.1] tracking-[-0.04em] text-primary mb-[24px]">
                  {producer.nombre}
                </h1>

                {details.length > 0 && (
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mb-[40px] text-xs font-bold tracking-widest uppercase text-muted">
                    {details.map((detail, index) => (
                      <span key={`${detail}-${index}`} className="inline-flex items-center gap-4">
                        {index > 0 && <span className="h-1 w-1 rounded-full bg-primary/30" />}
                        {detail}
                      </span>
                    ))}
                  </div>
                )}

                {producer.descripcion ? (
                  <div className="flex flex-col gap-[24px]">
                    {producer.descripcion.split(/\n+/).filter(Boolean).map((paragraph, index) => (
                      <p key={index} className="text-justify text-[18px] leading-[1.8] text-muted [hyphens:auto]">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-justify text-[18px] leading-[1.8] text-muted [hyphens:auto]">
                    Este productor forma parte de la Asociación Café Robusta OBC.
                  </p>
                )}
              </div>
            </article>
          </ScrollReveal>
        )}
      </main>
    </PublicLayout>
  );
}

export default function ProductorDetallePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ProductorDetalle />
    </Suspense>
  );
}
