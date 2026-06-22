'use client';

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
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    api.get<NoticiaRecord>(`/noticias/slug/${slug}`)
      .then(setNoticia)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <PublicLayout className="landing-typography">
      <main className="flex-grow max-w-[960px] mx-auto w-full px-[20px] md:px-[64px] py-[80px]">
        <div className="mb-[48px]">
          <Link href="/noticias" className="text-xs font-bold tracking-widest uppercase text-primary border-b border-accent w-max pb-1">
            ← Volver a noticias
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-muted">Cargando noticia...</div>
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
                  />
                </div>
              )}

              <div className="flex flex-col gap-[24px]">
                {noticia.contenido.split(/\n+/).filter(Boolean).map((paragraph, index) => (
                  <p key={index} className="text-[18px] leading-[1.8] text-muted">
                    {paragraph}
                  </p>
                ))}
              </div>
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
