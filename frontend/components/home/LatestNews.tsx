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
      <ScrollReveal className="premium-project group relative flex min-h-[500px] flex-col overflow-hidden rounded-[10px] bg-[#2b1710] p-8 text-[#fffaf1] sm:p-10" direction="left">
        <div className="absolute inset-0 opacity-30">
          <img
            src={apiAssetUrl(featured.imagen_portada) || '/assets/library-hero-v2.png'}
            alt=""
            className="scene-scale h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(31,17,11,0.98),rgba(31,17,11,0.25))]" />
        <div className="relative flex flex-1 flex-col">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-[#e7c792]">
            <span>{featured.categoria}</span><span>{formatNoticiaDate(featured)}</span>
          </div>
          <div className="mt-auto pt-10">
            <h3 className="scene-drift-side max-w-2xl font-serif text-3xl font-semibold leading-[1.2] tracking-[-0.015em] sm:text-4xl">{featured.titulo}</h3>
            {featured.resumen && <p className="mt-6 max-w-xl text-base leading-7 text-[#f3e8d8]/78">{featured.resumen}</p>}
            <Link href={`/noticias/detalle/?slug=${featured.slug}`} className="group/link mt-8 inline-flex items-center gap-2 border-b border-[#e7c792]/55 pb-1 text-sm font-semibold text-[#e7c792]">
              Leer comunicado <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>
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
