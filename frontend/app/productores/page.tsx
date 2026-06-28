'use client';

import { AppIcon } from "@/components/ui/AppIcon"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ScrollReveal } from '@/components/landing/LandingMotion';
import { EmptyState } from '@/components/ui/EmptyState';
import { api } from '@/lib/api';
import { ProductorRecord, producerImage, formatExperience } from '@/lib/producers';

function ProducerCard({ producer, index }: { producer: ProductorRecord; index: number }) {
  const experience = formatExperience(producer.anios_experiencia);

  return (
    <ScrollReveal delay={Math.min(index, 4) * 50} distance="sm" className="md:col-span-4 flex flex-col mb-8">
      <Link
        href={`/productores/detalle?slug=${encodeURIComponent(producer.slug)}`}
        className="flex flex-col w-full h-full group"
      >
        <div className="h-80 bg-surface mb-6 overflow-hidden relative">
          <img
            alt={producer.nombre}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-500"
            src={producerImage(producer)}
          />
          {producer.destacado && (
            <div className="absolute top-4 left-4 bg-accent text-primary-foreground px-3 py-1 text-[12px] font-semibold tracking-[0.1em] leading-none uppercase">
              Destacado
            </div>
          )}
        </div>

        <span className="font-serif text-[14px] font-medium leading-none text-primary/60 mb-3">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h4 className="font-serif text-[24px] font-semibold leading-[1.3] text-primary mb-1">
          {producer.nombre}
        </h4>
        {(producer.rol || producer.comunidad) && (
          <p className="text-[12px] font-semibold tracking-[0.1em] leading-none text-accent uppercase mb-4">
            {[producer.rol, producer.comunidad].filter(Boolean).join(' · ')}
          </p>
        )}
        {producer.descripcion && (
          <p className="text-[16px] leading-[1.6] text-muted flex-grow mb-6 line-clamp-4">
            {producer.descripcion}
          </p>
        )}

        <div className="h-[1px] bg-primary/10 mb-4 mt-auto"></div>
        <div className="flex justify-between items-center text-[12px] font-semibold tracking-[0.1em] leading-none text-primary/80 uppercase">
          <span>{experience || 'Productor asociado'}</span>
          <span className="inline-flex items-center gap-1">
            Ver perfil
            <AppIcon name="arrow_forward" className="text-[14px] transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </ScrollReveal>
  );
}

const PAGE_SIZE = 9;

export default function Productores() {
  const [producers, setProducers] = useState<ProductorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    api.get<ProductorRecord[]>('/productores')
      .then(data => setProducers(data.filter(p => p.activo)))
      .catch(() => setProducers([]))
      .finally(() => setLoading(false));
  }, []);

  const visibleProducers = producers.slice(0, visibleCount);
  const hasMore = producers.length > visibleCount;

  return (
    <PublicLayout className="landing-typography">
      <main className="flex-grow pt-32 pb-[120px] px-[20px] md:px-[64px] max-w-[1280px] mx-auto w-full">
        <header className="mb-24 grid grid-cols-1 md:grid-cols-12 gap-[24px] items-end">
          <ScrollReveal delay={0} distance="sm" className="md:col-span-8">
            <h1 className="font-serif font-semibold text-[32px] leading-[1.2] md:text-[52px] md:leading-[1.2] tracking-[-0.015em] text-primary mb-6">
              Nuestros<br />Productores.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={200} distance="sm" className="md:col-span-4 pb-2">
            <p className="text-[18px] leading-[1.6] text-muted">
              Hombres y mujeres que cultivan café robusta con dedicación y arraigo comunitario, miembros de la Asociación Café Robusta OBC.
            </p>
          </ScrollReveal>
        </header>

        <div className="w-full h-[1px] bg-primary/10 mb-12"></div>

        {loading ? (
          <div className="py-24 text-center text-muted">Cargando productores...</div>
        ) : producers.length === 0 ? (
          <EmptyState
            title="Sin productores publicados"
            description="Aún no se han publicado perfiles de productores. Vuelve a consultar más adelante."
          />
        ) : (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-[24px] gap-y-16 items-stretch">
              {visibleProducers.map((producer, i) => (
                <ProducerCard key={producer.id} producer={producer} index={i} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-16 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount(count => count + PAGE_SIZE)}
                  className="px-8 py-3 border border-primary text-primary text-xs font-bold tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Cargar más
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </PublicLayout>
  );
}
