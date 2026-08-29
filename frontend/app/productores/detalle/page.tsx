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
  const [producers, setProducers] = useState<ProductorRecord[]>([]);
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

  useEffect(() => {
    api.get<ProductorRecord[]>('/productores')
      .then(data => setProducers(data.filter(item => item.activo)))
      .catch(() => setProducers([]));
  }, []);

  const detailRows = producer ? [
    { label: 'Rol', value: producer.rol },
    { label: 'Comunidad', value: producer.comunidad },
    { label: 'Experiencia', value: formatExperience(producer.anios_experiencia) },
    { label: 'Perfil', value: `Publicado desde ${formatProducerDate(producer.created_at)}` },
  ].filter(item => item.value) : [];
  const gallery = producer
    ? Array.from(new Set([producerImage(producer), ...producerGallery(producer).map(apiAssetUrl).filter(Boolean)]))
    : [];
  const relatedProducers = producer
    ? producers.filter(item => item.id !== producer.id).slice(0, 3)
    : [];

  return (
    <PublicLayout className="landing-typography">
      <main className="mx-auto w-full max-w-[1280px] flex-grow px-5 py-10 md:px-16 md:py-16">
        <div className="mb-8"><Link href="/productores" className="inline-flex items-center gap-2 border-b border-accent pb-1 text-xs font-bold uppercase tracking-widest text-primary">← Todas las historias</Link></div>

        {loading ? <DataLoadingState label="Cargando perfil..." className="py-24" /> : !hasSlug || notFound || !producer ? (
          <EmptyState title="Perfil no encontrado" description="Es posible que este perfil ya no esté disponible o haya sido retirado." />
        ) : (
          <ScrollReveal>
            <article className="overflow-hidden border border-border bg-background">
              <header className="grid bg-[#120c08] text-white lg:grid-cols-[1.05fr_0.95fr]">
                <div className="relative min-h-[430px] overflow-hidden sm:min-h-[560px] lg:min-h-[680px]">
                  <OptimizedImage alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl" src={selectedImage || producerImage(producer)} sizes="(min-width: 1024px) 55vw, 100vw" />
                  <div className="absolute inset-0 bg-black/20" />
                  <OptimizedImage alt={`Retrato de ${producer.nombre}`} className="relative h-full min-h-[430px] w-full object-contain sm:min-h-[560px] lg:min-h-[680px]" src={selectedImage || producerImage(producer)} sizes="(min-width: 1024px) 55vw, 100vw" priority />
                </div>
                <div className="flex flex-col justify-end p-7 sm:p-10 lg:p-14">
                    {producer.destacado && <span className="mb-5 inline-flex bg-[#C28A3A] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#2b1710]">Historia destacada</span>}
                    <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.24em] text-[#e2b86f]">Gente del Robusta</p>
                    <h1 className="font-serif text-[clamp(2.7rem,5vw,5.2rem)] font-bold leading-[0.94] tracking-[-0.04em]">{producer.nombre}</h1>
                    {(producer.rol || producer.comunidad) && <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#e2b86f]">{[producer.rol, producer.comunidad].filter(Boolean).join(' · ')}</p>}
                </div>
              </header>

              {gallery.length > 1 && (
                <section className="border-b border-border bg-[#f7f3ec] p-4 sm:px-6" aria-label="Galería de imágenes">
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    <span className="mr-2 shrink-0 text-[9px] font-bold uppercase tracking-[0.18em] text-muted">Más fotos</span>
                    {gallery.map((image, index) => (
                      <button key={`${image}-${index}`} type="button" onClick={() => setSelectedImage(image)} className={`relative h-20 w-28 shrink-0 overflow-hidden border-2 transition sm:h-24 sm:w-36 ${selectedImage === image ? 'border-[#C28A3A] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`} aria-label={`Mostrar imagen ${index + 1}`} aria-pressed={selectedImage === image}>
                        <OptimizedImage src={image} alt="" className="h-full w-full object-cover" sizes="144px" />
                        <span className="absolute bottom-1 right-1 bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">{String(index + 1).padStart(2, '0')}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <div className="grid gap-12 px-6 py-12 sm:px-10 lg:grid-cols-[0.7fr_1.3fr] lg:px-14 lg:py-20">
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

              {relatedProducers.length > 0 && (
                <section className="border-t border-border bg-[#f7f3ec] px-6 py-12 sm:px-10 lg:px-14 lg:py-16" aria-labelledby="otras-historias">
                  <div className="mb-8 flex items-end justify-between gap-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">Continúa conociéndonos</p>
                      <h2 id="otras-historias" className="mt-3 font-serif text-3xl font-semibold text-primary">Otras historias del Robusta</h2>
                    </div>
                    <Link href="/productores" className="hidden border-b border-accent pb-1 text-xs font-bold uppercase tracking-widest text-primary sm:block">Ver todas</Link>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {relatedProducers.map(item => (
                      <Link key={item.id} href={`/productores/detalle?slug=${encodeURIComponent(item.slug)}`} className="group bg-background">
                        <div className="relative aspect-[4/3] overflow-hidden bg-[#d9d1c4]">
                          <OptimizedImage src={producerImage(item)} alt={`Retrato de ${item.nombre}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw" />
                        </div>
                        <div className="border border-t-0 border-border p-5">
                          <h3 className="font-serif text-xl font-semibold text-primary">{item.nombre}</h3>
                          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-accent">{[item.rol, item.comunidad].filter(Boolean).join(' · ') || 'Cadena de valor'}</p>
                          <span className="mt-5 inline-block text-xs font-bold uppercase tracking-widest text-primary">Leer su historia →</span>
                        </div>
                      </Link>
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

export default function ProductorDetallePage() {
  return <Suspense fallback={<div className="min-h-screen bg-background" />}><ProductorDetalle /></Suspense>;
}
