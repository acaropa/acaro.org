'use client';

import { DataLoadingState } from "@/components/ui/TypingIndicator";

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ScrollReveal } from '@/components/landing/LandingMotion';
import { EmptyState } from '@/components/ui/EmptyState';
import { api, apiAssetUrl } from '@/lib/api';
import { NoticiaRecord, formatNoticiaDate, getNoticiaAutor } from '@/lib/news';

function NoticiaDetalle() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') || '';

  const [noticia, setNoticia] = useState<NoticiaRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const frame = window.requestAnimationFrame(() => {
      setLoading(true);
      setNotFound(false);
      api.get<NoticiaRecord>(`/noticias/slug/${slug}`)
      .then(setNoticia)
      .catch(() => setNotFound(true))
        .finally(() => setLoading(false));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [slug]);

  const secondaryImages: string[] = (() => {
    if (!noticia || !noticia.imagenes) return [];
    if (typeof noticia.imagenes === 'string') {
      try { return JSON.parse(noticia.imagenes); } catch { return []; }
    }
    return Array.isArray(noticia.imagenes) ? noticia.imagenes : [];
  })();

  const paragraphs = noticia ? noticia.contenido.split(/\n+/).filter(Boolean) : [];
  const inlineImagesCount = Math.min(secondaryImages.length, Math.floor(paragraphs.length / 2));
  const remainingImages = secondaryImages.slice(inlineImagesCount);

  return (
    <PublicLayout className="landing-typography">
      <main className="flex-grow max-w-[960px] mx-auto w-full px-[20px] md:px-[64px] py-[80px]">
        <div className="mb-[48px]">
          <Link href="/noticias" className="text-xs font-bold tracking-widest uppercase text-primary border-b border-accent w-max pb-1">
            ← Volver a noticias
          </Link>
        </div>

        {loading && slug ? (
          <DataLoadingState label="Cargando noticia..." className="py-24" />
        ) : notFound || !noticia ? (
          <EmptyState
            title="Noticia no encontrada"
            description="Es posible que esta noticia ya no esté disponible o haya sido retirada."
          />
        ) : (
          <ScrollReveal delay={0} distance="md">
            <article>
              <div className="flex items-center gap-[16px] mb-[24px]">
                <span className="text-xs font-bold tracking-widest uppercase text-accent">{noticia.categoria}</span>
                <span className="w-1 h-1 rounded-full bg-primary/30"></span>
                <span className="text-xs font-bold tracking-widest uppercase text-muted">{formatNoticiaDate(noticia)}</span>
              </div>

              <h1 className="font-serif font-semibold text-[32px] md:text-[52px] leading-[1.2] tracking-[-0.015em] text-primary mb-[16px]">
                {noticia.titulo}
              </h1>

              <p className="text-xs font-semibold tracking-wider text-muted mb-[40px]">
                Publicado por <span className="text-primary">{getNoticiaAutor(noticia)}</span>
              </p>

              {noticia.imagen_portada && (
                <div className="w-full h-[320px] md:h-[480px] bg-surface overflow-hidden mb-[48px]">
                  <img
                    alt={noticia.titulo}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    src={apiAssetUrl(noticia.imagen_portada)}
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className="block flow-root">
                {paragraphs.map((paragraph, index) => {
                  // Muestra imagen inline antes del párrafo:
                  // Primera imagen antes del párrafo 1 (index 1),
                  // Segunda antes del párrafo 3 (index 3), etc.
                  const imageIndex = index > 0 && index % 2 === 1 ? Math.floor(index / 2) : -1;
                  const hasImage = imageIndex >= 0 && imageIndex < inlineImagesCount;
                  const imageUrl = hasImage ? secondaryImages[imageIndex] : null;
                  const floatClass = imageIndex % 2 === 0 ? "float-right md:ml-8" : "float-left md:mr-8";

                  return (
                    <div key={index} className="contents">
                      {hasImage && imageUrl && (
                        <div className={`w-full md:w-[45%] lg:w-[40%] h-[240px] md:h-[300px] mb-6 rounded-lg overflow-hidden border border-[#ded6cc] bg-[#fbf9f5] dark:border-border dark:bg-surface ${floatClass}`}>
                          <img
                            src={apiAssetUrl(imageUrl)}
                            alt={`Imagen del comunicado ${imageIndex + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <p className="text-justify text-[18px] leading-[1.8] text-muted mb-[24px] [hyphens:auto]">
                        {paragraph}
                      </p>
                    </div>
                  );
                })}
              </div>

              {remainingImages.length > 0 && (
                <div className="mt-16 pt-8 border-t border-border">
                  <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-accent mb-6">Galería del Comunicado</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {remainingImages.map((imgUrl, i) => (
                      <div key={i} className="h-[200px] bg-surface rounded-lg overflow-hidden border border-border group relative">
                        <a href={apiAssetUrl(imgUrl)} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                          <img
                            src={apiAssetUrl(imgUrl)}
                            alt={`Imagen de galería ${inlineImagesCount + i + 1}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </ScrollReveal>
        )}
      </main>
    </PublicLayout>
  );
}

export default function NoticiaDetallePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <NoticiaDetalle />
    </Suspense>
  );
}
