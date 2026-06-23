'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Newspaper } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/LandingMotion';
import { api, apiAssetUrl } from '@/lib/api';
import { NoticiaRecord, formatNoticiaDate } from '@/lib/news';

export function LatestNews() {
  const [news, setNews] = useState<NoticiaRecord[]>([]);

  useEffect(() => {
    api.get<NoticiaRecord[]>('/noticias')
      .then(data => setNews(data.slice(0, 3)))
      .catch(() => setNews([]));
  }, []);

  if (news.length === 0) return null;

  const [featured, ...secondary] = news;

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <ScrollReveal className="premium-project group relative flex min-h-[500px] flex-col justify-end overflow-hidden rounded-[10px] bg-[#2b1710]" direction="left">
        <Link href={`/noticias/detalle/?slug=${featured.slug}`} className="absolute inset-0 z-10" />
        <div className="absolute inset-0">
          <img
            src={apiAssetUrl(featured.imagen_portada) || '/assets/library-hero-v2.png'}
            alt=""
            className="scene-scale h-full w-full object-cover"
          />
        </div>
        {/* Gradient overlay to ensure text contrast at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0c07] via-[#1a0c07]/40 to-transparent opacity-90" />
        <div className="relative p-8 sm:p-10 z-20">
          <h3 className="scene-drift-side font-serif text-3xl font-semibold leading-[1.2] tracking-[-0.015em] sm:text-4xl text-[#fffaf1] text-balance">
            {featured.titulo}
          </h3>
        </div>
      </ScrollReveal>

      {secondary.length > 0 && (
        <div className="scene-drift-up grid gap-4">
          {secondary.map((item, index) => (
            <ScrollReveal key={item.id} delay={index * 120} className="premium-project group flex min-h-[238px] flex-col rounded-[10px] border border-[#d8cabb] bg-[#f6efe5]/65 p-6 hover:border-[#b57931]/60 hover:bg-[#f6efe5]" direction="right">
              <Link href={`/noticias/detalle/?slug=${item.slug}`} className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <Newspaper className="h-6 w-6 text-[#b57931]" strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a755c]">{formatNoticiaDate(item)}</span>
                </div>
                <div className="mt-6 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#a66f2e]">{item.categoria}</p>
                  <h3 className="mt-3 font-serif text-2xl font-semibold leading-tight tracking-[-0.01em] transition-colors group-hover:text-[#a66f2e]">{item.titulo}</h3>
                  {item.resumen && <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#806b5f]">{item.resumen}</p>}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[#d8cabb] pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8e705e]">Comunicado 0{index + 2}</span>
                  <ArrowRight className="h-4 w-4 text-[#9d7145] transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
