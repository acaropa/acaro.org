'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DataLoadingState } from '@/components/ui/TypingIndicator';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ScrollReveal } from '@/components/landing/LandingMotion';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { EmptyState } from '@/components/ui/EmptyState';
import { api, apiAssetUrl } from '@/lib/api';
import { ProductorRecord, formatExperience, formatProducerDate, producerGallery, producerImage } from '@/lib/producers';

function ProductorDetalle() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') || '';
  const hasSlug = Boolean(slug);
  const [producer, setProducer] = useState<ProductorRecord | null>(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(hasSlug);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!hasSlug) return;
    api.get<ProductorRecord>(`/productores/slug/${slug}`)
      .then(data => { setProducer(data); setSelectedImage(producerImage(data)); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [hasSlug, slug]);

  const detailRows = producer ? [
    { label: 'Rol', value: producer.rol },
    { label: 'Comunidad', value: producer.comunidad },
    { label: 'Experiencia', value: formatExperience(producer.anios_experiencia) },
    { label: 'Perfil', value: `Publicado desde ${formatProducerDate(producer.created_at)}` },
  ].filter(item => item.value) : [];
  const gallery = producer
    ? Array.from(new Set([producerImage(producer), ...producerGallery(producer).map(apiAssetUrl).filter(Boolean)]))
    : [];

  return (
    <PublicLayout className="landing-typography">
      <main className="mx-auto w-full max-w-[1280px] flex-grow px-5 py-16 md:px-16 md:py-20">
        <div className="mb-10"><Link href="/productores" className="w-max border-b border-accent pb-1 text-xs font-bold uppercase tracking-widest text-primary">← Volver a Gente del Robusta</Link></div>

        {loading ? <DataLoadingState label="Cargando perfil..." className="py-24" /> : !hasSlug || notFound || !producer ? (
          <EmptyState title="Perfil no encontrado" description="Es posible que este perfil ya no esté disponible o haya sido retirado." />
        ) : (
          <ScrollReveal>
            <article>
              <header className="relative overflow-hidden bg-[#120c08] text-white">
                <div className="relative h-[52svh] min-h-[420px] md:h-[68svh] md:min-h-[560px]">
                  <OptimizedImage alt={producer.nombre} className="h-full w-full object-cover" src={selectedImage || producerImage(producer)} sizes="100vw" priority />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120c08]/95 via-[#120c08]/15 to-black/5" />
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
                    {producer.destacado && <span className="mb-5 inline-flex bg-[#C28A3A] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#2b1710]">Historia destacada</span>}
                    <h1 className="max-w-4xl font-serif text-[clamp(2.8rem,7vw,6.5rem)] font-bold leading-[0.92] tracking-[-0.04em]">{producer.nombre}</h1>
                    {(producer.rol || producer.comunidad) && <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#e2b86f]">{[producer.rol, producer.comunidad].filter(Boolean).join(' · ')}</p>}
                  </div>
                </div>
              </header>

              {gallery.length > 1 && (
                <section className="border-x border-b border-border bg-[#f7f3ec] p-4 sm:p-6" aria-label="Galería de imágenes">
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {gallery.map((image, index) => (
                      <button key={`${image}-${index}`} type="button" onClick={() => setSelectedImage(image)} className={`relative h-20 w-28 shrink-0 overflow-hidden border-2 transition sm:h-24 sm:w-36 ${selectedImage === image ? 'border-[#C28A3A] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`} aria-label={`Mostrar imagen ${index + 1}`} aria-pressed={selectedImage === image}>
                        <OptimizedImage src={image} alt="" className="h-full w-full object-cover" sizes="144px" />
                        <span className="absolute bottom-1 right-1 bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">{String(index + 1).padStart(2, '0')}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <div className="grid gap-12 border-x border-b border-border bg-background px-6 py-12 sm:px-10 lg:grid-cols-[0.7fr_1.3fr] lg:px-14 lg:py-20">
                <aside>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">Perfil</p>
                  {detailRows.length > 0 && <dl className="mt-6 divide-y divide-border border-y border-border">{detailRows.map(item => <div key={item.label} className="py-4"><dt className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">{item.label}</dt><dd className="mt-1 font-serif text-lg font-semibold text-foreground">{item.value}</dd></div>)}</dl>}
                  {producer.frase_corta && <blockquote className="mt-8 border-l-2 border-[#C28A3A] pl-5 font-serif text-xl italic leading-8 text-primary">“{producer.frase_corta}”</blockquote>}
                </aside>

                <section>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">Su historia</p>
                  <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight text-primary sm:text-4xl">Una vida vinculada al café robusta.</h2>
                  {producer.descripcion ? <div className="mt-8 flex flex-col gap-6">{producer.descripcion.split(/\n+/).filter(Boolean).map((paragraph, index) => <p key={index} className="text-[17px] leading-8 text-muted">{paragraph}</p>)}</div> : <p className="mt-8 text-[17px] leading-8 text-muted">Esta persona forma parte de la cadena de valor del café robusta vinculada a la Asociación Café Robusta OBC.</p>}
                </section>
              </div>
            </article>
          </ScrollReveal>
        )}
      </main>
    </PublicLayout>
  );
}

export default function ProductorDetallePage() {
  return <Suspense fallback={<div className="min-h-screen bg-background" />}><ProductorDetalle /></Suspense>;
}
