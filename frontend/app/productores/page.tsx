'use client';

import { DataLoadingState } from "@/components/ui/TypingIndicator";

import { AppIcon } from "@/components/ui/AppIcon"

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ScrollReveal } from '@/components/landing/LandingMotion';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
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
          <OptimizedImage
            alt={producer.nombre}
            className="w-full h-full object-cover transition-all duration-500"
            src={producerImage(producer)}
            sizes="(max-width: 768px) 100vw, 33vw"
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
          <span>{experience || 'Cadena de valor'}</span>
          <span className="inline-flex items-center gap-1">
            Ver perfil
            <AppIcon name="arrow_forward" className="text-[14px] transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </ScrollReveal>
  );
}

const PanamaValueChainMap = dynamic(
  () => import("@/components/mapa-cadena-valor").then(mod => mod.PanamaValueChainMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid min-h-[360px] place-items-center text-sm text-muted">
        Preparando el territorio...
      </div>
    ),
  },
);

function LazyTerritoryMap() {
  const containerRef = useRef<HTMLElement | null>(null);
  const [shouldRenderMap, setShouldRenderMap] = useState(false);

  useEffect(() => {
    if (shouldRenderMap) return;

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldRenderMap(true);
        observer.disconnect();
      },
      { rootMargin: "520px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [shouldRenderMap]);

  return (
    <section ref={containerRef} className="px-[20px] md:px-[40px] lg:px-[48px] pb-20 md:pb-28 max-w-[1440px] mx-auto w-full">
      {shouldRenderMap ? (
        <PanamaValueChainMap
          eyebrow="01 / TERRITORIO"
          title="Presencia territorial del café robusta en Panamá"
          description=""
        />
      ) : (
        <div className="grid min-h-[430px] place-items-center text-sm text-muted">
          Preparando el territorio...
        </div>
      )}
    </section>
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
      <main className="flex-grow w-full">

        {/* ── Hero con imagen de fondo tenue ── */}
        <section className="relative pt-32 pb-20 md:pb-28 px-[20px] md:px-[64px] overflow-hidden">
          {/* Imagen de fondo reutilizada del landing */}
          <div className="absolute inset-0 -z-10">
            <OptimizedImage
              src="/assets/landing-hero-main.jpg"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover object-center"
              priority
              sizes="100vw"
            />
            {/* Overlay crema cálido */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(175deg, rgba(250,249,245,0.92) 0%, rgba(248,245,237,0.88) 40%, rgba(250,249,245,0.95) 100%)',
            }} />
          </div>

          <div className="max-w-[1280px] mx-auto">
            <header className="grid grid-cols-1 md:grid-cols-12 gap-[24px] items-end">
              <ScrollReveal delay={0} distance="sm" className="md:col-span-8">
                <h1 className="font-serif font-semibold text-[32px] leading-[1.2] md:text-[52px] md:leading-[1.15] tracking-[-0.015em] text-primary">
                  Gente del<br />café robusta.
                </h1>
              </ScrollReveal>
              <ScrollReveal delay={200} distance="sm" className="md:col-span-4 pb-2">
                <p className="text-[18px] leading-[1.6] text-muted">
                  Personas que participan en la cadena de valor, desde la finca hasta la taza, y hacen posible el café robusta de Panamá.
                </p>
              </ScrollReveal>
            </header>
          </div>
        </section>

        {/* Mapa territorial: carga diferida para mantener la navegacion fluida */}
        <LazyTerritoryMap />

        {/* ── Transición editorial ── */}
        <section className="py-16 md:py-24 px-[20px] md:px-[64px]">
          <div className="max-w-[1280px] mx-auto">
            <ScrollReveal delay={0} distance="sm">
              <div className="w-full h-[1px] bg-primary/10 mb-12 md:mb-16"></div>
              <p className="font-serif text-[28px] md:text-[40px] leading-[1.2] tracking-[-0.02em] text-primary/80 text-center max-w-3xl mx-auto">
                Los números representan personas.
              </p>
              <div className="w-full h-[1px] bg-primary/10 mt-12 md:mt-16"></div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Listado de perfiles ── */}
        <section className="pb-[120px] px-[20px] md:px-[64px] max-w-[1280px] mx-auto w-full">
          {loading ? (
            <DataLoadingState label="Cargando historias..." className="py-24" />
          ) : producers.length === 0 ? (
            <EmptyState
              title="Sin perfiles publicados"
              description="Aún no se han publicado perfiles. Vuelve a consultar más adelante."
            />
          ) : (
            <>
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
            </>
          )}
        </section>

      </main>
    </PublicLayout>
  );
}
