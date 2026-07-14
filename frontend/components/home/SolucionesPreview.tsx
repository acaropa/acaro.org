'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/LandingMotion';

export function SolucionesPreview() {
  return (
    <section className="bg-[#120c08] text-[#f4f4f0] overflow-hidden py-16 sm:py-24 lg:py-32 relative">
      <div 
        className="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url('/assets/landing-hero-v2.jpg')` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(18,12,8,0.95),rgba(47,74,36,0.85))]" />
      
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <ScrollReveal className="lg:col-span-5" direction="left" distance="lg">
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-[#C6A15B]">
              Servicios ACARO
            </span>
            <h2 className="mb-6 font-serif text-3xl font-bold leading-tight tracking-[-0.025em] text-white sm:text-5xl">
              Servicios, café e insumos
            </h2>
            <div className="mb-8 h-px bg-[#f4f4f0]/20" />
            <p className="mb-8 text-base leading-7 text-[#d8c9bb]">
              Acompañamiento agronómico, asesoría técnica especializada, material vegetal de alta calidad y la mejor selección de café robusta para tu proyecto o negocio. 
            </p>
            <Link
              href="/soluciones"
              className="group inline-flex items-center gap-2 bg-[#f4f4f0] px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-[#120c08] transition-all hover:bg-white"
            >
              Ver catálogo completo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </ScrollReveal>
          
          <ScrollReveal className="lg:col-span-7" direction="right" delay={180}>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <h3 className="mb-2 font-serif text-xl font-bold text-white">Servicios agronómicos</h3>
                  <p className="text-sm text-[#d8c9bb]">Estudios de suelo, fichas técnicas y acompañamiento.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <h3 className="mb-2 font-serif text-xl font-bold text-white">Lotes especiales</h3>
                  <p className="text-sm text-[#d8c9bb]">Café tostado y verde (oro) de selecciones limitadas.</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 mt-8">
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <h3 className="mb-2 font-serif text-xl font-bold text-white">Perfil de taza</h3>
                  <p className="text-sm text-[#d8c9bb]">Evaluación y catación de la calidad de tu café.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <h3 className="mb-2 font-serif text-xl font-bold text-white">Insumos y plantines</h3>
                  <p className="text-sm text-[#d8c9bb]">Material vegetal selecto y abono orgánico.</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
