'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/LandingMotion';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { api, apiAssetUrl } from '@/lib/api';
import { NoticiaRecord, formatNoticiaDate } from '@/lib/news';

const FALLBACK = '/assets/coffee-beans-texture.png';

export function NewsGrid() {
  const [news, setNews] = useState<NoticiaRecord[]>([]);

  useEffect(() => {
    api.get<NoticiaRecord[]>('/noticias')
      .then(data => setNews(data.slice(0, 3)))
      .catch(() => setNews([]));
  }, []);

  if (news.length === 0) {
    return (
      <>
        <ScrollReveal className="mb-12 max-w-xl" distance="sm">
          <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-[#1b6d24]">Actualidad Institucional</span>
          <h2 className="font-serif text-3xl font-bold text-[#271310] sm:text-4xl">Noticias y comunicados</h2>
          <p className="mt-4 text-base leading-7 text-[#504442]">
            Aun no hay noticias publicadas. Los comunicados institucionales apareceran aqui cuando esten disponibles.
          </p>
        </ScrollReveal>
        <div className="border border-dashed border-[#d8cabb] bg-white p-8 text-center">
          <p className="text-sm leading-6 text-[#504442]">El equipo de ACARO OBC esta preparando nuevas actualizaciones.</p>
          <Link href="/noticias" className="mt-5 inline-flex border-b border-[#271310] pb-1 text-xs font-bold uppercase tracking-widest text-[#271310]">
            Ir a noticias
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Section header */}
      <ScrollReveal className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end" distance="sm">
        <div className="max-w-xl">
          <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-[#1b6d24]">Actualidad Institucional</span>
          <h2 className="font-serif text-3xl font-bold text-[#271310] sm:text-4xl">Noticias y comunicados</h2>
          <p className="mt-4 text-base leading-7 text-[#504442]">
            Mantente al día con los hitos técnicos y las alianzas estratégicas que están transformando la región.
          </p>
        </div>
        <Link href="/noticias" className="group flex items-center gap-2 text-sm font-semibold text-[#271310] transition-transform hover:translate-x-2">
          Ver todas las noticias <ArrowRight className="h-4 w-4" />
        </Link>
      </ScrollReveal>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {news.map((item, index) => (
          <ScrollReveal key={item.id} delay={index * 100}>
            <article className="group cursor-pointer">
              <Link href={`/noticias/detalle/?slug=${item.slug}`}>
                <div className="relative mb-6 aspect-video overflow-hidden">
                  <OptimizedImage
                    src={apiAssetUrl(item.imagen_portada) || FALLBACK}
                    alt={item.titulo}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-[#b38f4a]">
                  {formatNoticiaDate(item)}
                </span>
                <h4 className="mb-3 font-serif text-xl font-semibold leading-tight text-[#271310] transition-colors group-hover:text-[#1b6d24]">
                  {item.titulo}
                </h4>
                {item.resumen && (
                  <p className="line-clamp-2 text-sm leading-6 text-[#504442]">
                    {item.resumen}
                  </p>
                )}
              </Link>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </>
  );
}
