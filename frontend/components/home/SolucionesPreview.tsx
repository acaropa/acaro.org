'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/LandingMotion';

const SERVICE_ITEMS = [
  {
    title: 'Servicios agronómicos',
    description: 'Estudios de suelo, fichas técnicas y acompañamiento.',
  },
  {
    title: 'Perfil de taza',
    description: 'Evaluación y catación de la calidad de tu café.',
  },
  {
    title: 'Lotes especiales',
    description: 'Café tostado y verde (oro) de selecciones limitadas.',
  },
  {
    title: 'Insumos y plantines',
    description: 'Material vegetal selecto y abono orgánico.',
  },
];

export function SolucionesPreview() {
  return (
    <section className="bg-[#120c08] text-[#f4f4f0] overflow-hidden py-16 sm:py-24 lg:py-32 relative">
      <div
        className="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url('/assets/landing-hero-v2.jpg')` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(18,12,8,0.95),rgba(47,74,36,0.85))]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <ScrollReveal className="lg:col-span-5" direction="left" distance="lg">
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-[#C6A15B]">
              Servicios ACARO
            </span>
            <h2 className="mb-6 font-serif text-3xl font-bold leading-tight tracking-[-0.025em] text-white sm:text-5xl">
              Servicios, café e insumos
            </h2>
            <div className="mb-8 h-px bg-[#f4f4f0]/20" />
            <p className="mb-8 max-w-[42ch] text-base leading-7 text-[#d8c9bb]">
              Acompañamiento agronómico, asesoría técnica especializada, material vegetal de alta calidad y la mejor selección de café robusta para tu proyecto o negocio.
            </p>
            <Link
              href="/servicios"
              className="group inline-flex items-center gap-2 bg-[#f4f4f0] px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-[#120c08] transition-all hover:bg-white"
            >
              Ver catálogo completo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </ScrollReveal>

          <ScrollReveal className="lg:col-span-7" direction="right" delay={180}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              {SERVICE_ITEMS.map((item, index) => (
                <article
                  key={item.title}
                  className="flex min-h-[148px] flex-col justify-between rounded-[6px] border border-white/12 bg-white/[0.06] p-6 backdrop-blur-sm transition-colors hover:border-[#C6A15B]/50 hover:bg-white/[0.09]"
                >
                  <span className="mb-5 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#C6A15B]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="mb-3 font-serif text-xl font-bold leading-tight text-white">{item.title}</h3>
                    <p className="text-sm leading-6 text-[#d8c9bb]">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
