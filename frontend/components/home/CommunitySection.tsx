'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/landing/LandingMotion';
import { api } from '@/lib/api';
import { ProductorRecord, producerImage } from '@/lib/producers';

const PREVIEW: ProductorRecord[] = [
  {
    id: 1,
    nombre: 'Don Manuel Espinoza',
    slug: '',
    descripcion: 'El café que cultivamos no es solo un producto, es la historia de nuestra familia y nuestra tierra.',
    imagen_url: 'https://i.pravatar.cc/400?img=56',
    comunidad: 'Comunidad Las Palmas',
    rol: 'Productor líder',
    anios_experiencia: 24,
    activo: true,
    destacado: true,
    created_at: '',
  },
  {
    id: 2,
    nombre: 'María Elena Solano',
    slug: '',
    descripcion: 'Con ACARO no solo aprendí a mejorar mi tierra, aprendí que mi voz como productora tiene un impacto global.',
    imagen_url: 'https://i.pravatar.cc/400?img=47',
    comunidad: 'Comunidad Río Verde',
    rol: 'Productora Líder',
    anios_experiencia: 18,
    activo: true,
    destacado: true,
    created_at: '',
  },
  {
    id: 3,
    nombre: 'Carlos Herrera',
    slug: '',
    descripcion: 'La tecnificación nos abrió puertas que nunca imaginamos. Hoy exportamos con orgullo panameño.',
    imagen_url: 'https://i.pravatar.cc/400?img=32',
    comunidad: 'Comunidad El Cerro',
    rol: 'Joven Caficultor',
    anios_experiencia: 7,
    activo: true,
    destacado: true,
    created_at: '',
  },
  {
    id: 4,
    nombre: 'Rosa Pineda',
    slug: '',
    descripcion: 'Ser parte de ACARO me dio herramientas y una comunidad que camina junta hacia el futuro.',
    imagen_url: 'https://i.pravatar.cc/400?img=25',
    comunidad: 'Comunidad Santa Ana',
    rol: 'Productora Activa',
    anios_experiencia: 12,
    activo: true,
    destacado: true,
    created_at: '',
  },
];

export function CommunitySection() {
  const [producers, setProducers] = useState<ProductorRecord[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api.get<ProductorRecord[]>('/productores')
      .then(data => {
        const active = data.filter(p => p.activo).slice(0, 6);
        setProducers(active.length > 0 ? active : PREVIEW);
      })
      .catch(() => setProducers(PREVIEW));
  }, []);

  useEffect(() => {
    if (producers.length <= 1) return;
    const id = setInterval(() => setCurrent(prev => (prev + 1) % producers.length), 4500);
    return () => clearInterval(id);
  }, [producers.length]);

  return (
    <section className="overflow-hidden bg-[#120c08] py-24 text-white sm:py-32">
      <div className="mx-auto max-w-7xl items-center gap-16 px-5 sm:px-8 lg:px-10 md:grid md:grid-cols-12">

        {/* Left: title + blockquote + CTA */}
        <ScrollReveal className="md:col-span-5" direction="left" distance="lg">
          <h2 className="mb-8 font-serif text-4xl font-bold leading-tight tracking-[-0.025em] sm:text-5xl">
            Las personas son el corazón de nuestro trabajo
          </h2>
          <blockquote className="relative mb-12 border-l border-[#ae8d87]/30 pl-10 font-serif text-lg italic leading-8 text-[#c9b5b0]">
            &ldquo;Con ACARO no solo aprendí a mejorar mi tierra, aprendí que mi voz como productora tiene un impacto global.&rdquo;
            <span className="mt-4 block font-sans not-italic text-sm font-bold uppercase tracking-widest text-white">
              &mdash; María Elena Solano, Productora Líder
            </span>
          </blockquote>
          <Link
            href="/productores"
            className="inline-flex items-center gap-3 bg-white px-8 py-4 text-sm font-semibold text-[#271310] transition-all hover:bg-[#faf9f5]"
          >
            Conocer sus Historias
          </Link>
        </ScrollReveal>

        {/* Right: auto-rotating carousel */}
        {producers.length > 0 && (
          <ScrollReveal className="mt-16 md:col-span-6 md:col-start-7 md:mt-0" direction="right" delay={200}>

            {/* Slides container */}
            <div className="relative min-h-[420px] sm:min-h-[460px]">
              {producers.map((producer, index) => (
                <div
                  key={producer.id}
                  className={`absolute inset-0 flex flex-col justify-center transition-opacity duration-700 ${
                    index === current ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="flex items-start gap-8">
                    {/* Square photo */}
                    <div className="h-52 w-52 shrink-0 overflow-hidden shadow-xl sm:h-64 sm:w-64">
                      <img
                        src={producerImage(producer)}
                        alt={producer.nombre}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Right: quote + name */}
                    <div className="flex flex-col justify-center">
                      {producer.descripcion && (
                        <p
                          className="mb-6 text-lg leading-relaxed text-[#c9b5b0] sm:text-xl"
                          style={{ fontFamily: 'var(--font-handwritten)' }}
                        >
                          &ldquo;{producer.descripcion}&rdquo;
                        </p>
                      )}

                      <h4 className="font-serif text-xl font-semibold text-white">{producer.nombre}</h4>

                      {(producer.rol || producer.comunidad) && (
                        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#b38f4a]">
                          {[producer.rol, producer.comunidad].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation dots */}
            {producers.length > 1 && (
              <div className="mt-6 flex justify-start gap-2">
                {producers.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    aria-label={`Productor ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === current ? 'w-8 bg-white' : 'w-1.5 bg-white/25 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}

          </ScrollReveal>
        )}

      </div>
    </section>
  );
}
