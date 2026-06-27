'use client';

import { useEffect, useState } from 'react';
import { ScrollReveal } from '@/components/landing/LandingMotion';
import { api } from '@/lib/api';
import { ProductorRecord, producerImage } from '@/lib/producers';

export function FeaturedProducers() {
  const [producers, setProducers] = useState<ProductorRecord[]>([]);

  useEffect(() => {
    api.get<ProductorRecord[]>('/productores')
      .then(data => {
        const active = data.filter(p => p.activo);
        const featured = active.filter(p => p.destacado);
        setProducers((featured.length >= 2 ? featured : active).slice(0, 2));
      })
      .catch(() => setProducers([]));
  }, []);

  if (producers.length === 0) return null;

  return (
    <div className="flex flex-col gap-24">
      {producers.map((producer, index) => {
        const isReversed = index % 2 === 1;
        return (
          <ScrollReveal key={producer.id} delay={index * 120}>
            <div className="grid items-center gap-12 md:grid-cols-2">

              <div className={`relative aspect-square w-full overflow-hidden border-4 border-white shadow-xl grayscale transition-all duration-700 hover:grayscale-0 ${isReversed ? 'md:order-2' : ''}`}>
                <img
                  src={producerImage(producer)}
                  alt={producer.nombre}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className={`${isReversed ? 'md:order-1 md:text-right' : ''} md:px-8`}>
                {producer.descripcion && (
                  <p
                    className="mb-6 text-4xl leading-relaxed text-[#705a4c]"
                    style={{ fontFamily: 'var(--font-handwritten)' }}
                  >
                    &ldquo;{producer.descripcion}&rdquo;
                  </p>
                )}
                <h4 className="text-[32px] font-semibold leading-tight text-[#2b1710]">
                  {producer.nombre}
                </h4>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#8a5925]">
                  {[producer.rol, producer.comunidad].filter(Boolean).join(', ')}
                </p>

                {(producer.anios_experiencia != null || producer.comunidad) && (
                  <div className={`mt-8 flex gap-6 ${isReversed ? 'md:justify-end' : ''}`}>
                    {producer.anios_experiencia != null && (
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-[#2b1710]">{producer.anios_experiencia}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-[#765e50] opacity-60">Años de cultivo</p>
                      </div>
                    )}
                    {producer.anios_experiencia != null && producer.comunidad && (
                      <div className="h-10 w-px self-center bg-[#d8cabb]" />
                    )}
                    {producer.comunidad && (
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-[#2b1710]">{producer.comunidad}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-[#765e50] opacity-60">Comunidad</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </ScrollReveal>
        );
      })}
    </div>
  );
}
