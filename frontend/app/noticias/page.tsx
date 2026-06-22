'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ScrollReveal } from '@/components/landing/LandingMotion';
import { EmptyState } from '@/components/ui/EmptyState';
import { api, apiAssetUrl } from '@/lib/api';
import { NoticiaRecord, formatNoticiaDate, getNoticiaAutor } from '@/lib/news';

const PAGE_SIZE = 9;

export default function Noticias() {
  const [news, setNews] = useState<NoticiaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Todas');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    api.get<NoticiaRecord[]>('/noticias')
      .then(setNews)
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(news.map(item => item.categoria)));
    return ['Todas', ...unique];
  }, [news]);

  const filtered = useMemo(() => {
    return category === 'Todas' ? news : news.filter(item => item.categoria === category);
  }, [news, category]);

  const [featured, ...rest] = filtered;
  const visibleRest = rest.slice(0, visibleCount);
  const hasMore = rest.length > visibleCount;

  function selectCategory(next: string) {
    setCategory(next);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <PublicLayout className="landing-typography">
      <main className="flex-grow max-w-[1280px] mx-auto w-full px-[20px] md:px-[64px] py-[80px]">

        {/* Header Section */}
        <header className="mb-[40px]">
          <ScrollReveal delay={0} distance="sm">
            <h1 className="font-serif font-semibold text-[36px] md:text-[56px] leading-[1.2] tracking-[-0.015em] text-primary max-w-4xl mb-[32px]">
              Noticias y novedades de la Asociación
            </h1>
            <p className="text-[20px] leading-[1.6] text-muted max-w-3xl">
              Explora los últimos avances, eventos y proyectos que están transformando la industria del café robusta. Una mirada profunda a nuestra comunidad y sus logros.
            </p>
          </ScrollReveal>
        </header>

        <div className="h-[1px] bg-primary/20 w-full mb-[32px]"></div>

        {/* Filters */}
        {categories.length > 1 && (
          <section className="mb-[80px]">
            <ScrollReveal delay={100} distance="sm" className="flex flex-wrap gap-[12px]">
              {categories.map(item => (
                <button
                  key={item}
                  onClick={() => selectCategory(item)}
                  className={`px-4 py-2 border text-xs font-bold tracking-widest uppercase transition-colors ${
                    category === item
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-primary text-primary bg-transparent hover:bg-primary/5'
                  }`}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </ScrollReveal>
          </section>
        )}

        {loading ? (
          <div className="py-24 text-center text-muted">Cargando noticias...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Sin noticias disponibles"
            description="Aún no se han publicado noticias en esta categoría. Vuelve a consultar más adelante."
          />
        ) : (
          <>
            {/* Hero Editorial Story */}
            {featured && (
              <section className="mb-[120px]">
                <ScrollReveal delay={200} distance="md">
                  <Link href={`/noticias/detalle/?slug=${featured.slug}`} className="group grid grid-cols-1 lg:grid-cols-12 gap-[32px]">
                    <div className="lg:col-span-7 h-[500px] bg-surface relative overflow-hidden">
                      {featured.imagen_portada && (
                        <img
                          alt={featured.titulo}
                          loading="lazy"
                          className="w-full h-full object-cover filter brightness-95 grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                          src={apiAssetUrl(featured.imagen_portada)}
                        />
                      )}
                    </div>

                    <div className="lg:col-span-5 flex flex-col justify-center bg-background p-[24px] md:p-[40px] relative border border-primary/20">
                      <div className="flex items-center gap-[16px] mb-[16px]">
                        <span className="text-xs font-bold tracking-widest uppercase text-accent">{featured.categoria}</span>
                        <span className="w-1 h-1 rounded-full bg-primary/30"></span>
                        <span className="text-xs font-bold tracking-widest uppercase text-muted">{formatNoticiaDate(featured)}</span>
                      </div>
                      <h2 className="font-serif font-semibold text-[26px] md:text-[34px] leading-[1.25] tracking-[-0.015em] text-primary mb-[20px]">
                        {featured.titulo}
                      </h2>
                      {featured.resumen && (
                        <p className="text-[15px] leading-[1.6] text-muted mb-[24px]">
                          {featured.resumen}
                        </p>
                      )}
                      <p className="text-xs font-semibold tracking-wider text-muted mb-[16px]">
                        Publicado por <span className="text-primary">{getNoticiaAutor(featured)}</span>
                      </p>
                      <span className="mt-auto text-xs font-bold tracking-widest uppercase text-primary border-b border-accent w-max pb-1 group-hover:border-b-2 transition-all">
                        Leer noticia
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              </section>
            )}

            {/* Grid of remaining news */}
            {visibleRest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[32px]">
                {visibleRest.map((item, index) => (
                  <ScrollReveal key={item.id} delay={100 * (index % 3)} distance="sm">
                    <Link href={`/noticias/detalle/?slug=${item.slug}`} className="group flex flex-col h-full bg-background border border-primary/20">
                      <div className="h-[220px] bg-surface overflow-hidden">
                        {item.imagen_portada && (
                          <img
                            alt={item.titulo}
                            loading="lazy"
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                            src={apiAssetUrl(item.imagen_portada)}
                          />
                        )}
                      </div>
                      <div className="flex flex-col flex-grow p-[24px]">
                        <span className="text-xs font-semibold tracking-wider uppercase text-accent block mb-[12px]">
                          {item.categoria} · {formatNoticiaDate(item)}
                        </span>
                        <h3 className="font-serif font-semibold text-[20px] md:text-[22px] leading-[1.3] tracking-[-0.01em] text-primary mb-[12px]">{item.titulo}</h3>
                        {item.resumen && (
                          <p className="text-[15px] leading-[1.6] text-muted flex-grow line-clamp-3">{item.resumen}</p>
                        )}
                        <p className="mt-[16px] text-xs font-semibold tracking-wider text-muted">
                          Publicado por <span className="text-primary">{getNoticiaAutor(item)}</span>
                        </p>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            )}

            {hasMore && (
              <div className="mt-[48px] flex justify-center">
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
      </main>
    </PublicLayout>
  );
}
