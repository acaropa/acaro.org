'use client';

import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/landing/LandingMotion";

const CONTACT = { whatsapp: "50763207461", email: "contacto@acaro.org" };

const SERVICIOS = [
  { t: "Elaboración de ficha técnica de finca", d: "Documentación y caracterización de tu finca." },
  { t: "Estudio de suelo", d: "Muestreo, análisis e interpretación." },
  { t: "Asesoría agronómica", d: "Acompañamiento técnico en tu finca." },
  { t: "Perfil de taza y catación", d: "Evaluación de la calidad de tu café." },
];

const PRODUCTOS = [
  { t: "Café tostado", d: "Sujeto a disponibilidad." },
  { t: "Café verde (oro)", d: "Sujeto a disponibilidad." },
  { t: "Lotes especiales", d: "Selecciones limitadas." },
  { t: "Plantines de café", d: "Material vegetal." },
  { t: "Abono orgánico", d: "Sujeto a disponibilidad." },
];

export default function SolucionesPage() {
  const num = CONTACT.whatsapp.replace(/[^0-9]/g, "");
  const wa = (t: string) => `https://wa.me/${num}?text=${encodeURIComponent("Hola ACARO 👋 " + t)}`;
  const generalWa = wa("quiero más información sobre lo que ofrecen.");

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative flex min-h-[74vh] items-center overflow-hidden bg-[#120c08] text-[#f4f4f0]">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(16,17,10,0.9) 0%, rgba(16,17,10,0.55) 42%, rgba(16,17,10,0.15) 75%),
              url('/assets/landing-hero-v2.jpg'),
              radial-gradient(70% 90% at 80% 40%, rgba(120,150,70,0.5), transparent 60%),
              linear-gradient(135deg, #2f4a24, #152016)
            `
          }}
        />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
          <ScrollReveal className="max-w-2xl">
            <div className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#C6A15B]">
              Soluciones · ACARO OBC
            </div>
            <h1 className="mt-4 font-serif text-[clamp(2.4rem,6.5vw,4.4rem)] font-extrabold leading-[1.02] tracking-tight">
              Soluciones ACARO
            </h1>
            <p className="mt-5 mb-8 max-w-[46ch] text-[clamp(1.05rem,1.6vw,1.24rem)] text-[#e9e2d3]">
              Servicios agronómicos, café e insumos de la asociación. Cuéntanos qué necesitas y lo coordinamos.
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href={generalWa} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded bg-[#f4f4f0] px-6 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[#120c08] transition-all hover:-translate-y-0.5 hover:bg-white"
              >
                Escribir por WhatsApp
              </a>
              <a 
                href="#servicios-sec"
                className="inline-flex items-center gap-2 rounded border-2 border-current bg-transparent px-6 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.12em] transition-all hover:-translate-y-0.5"
              >
                Ver lo que ofrecemos
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios-sec" className="bg-[#faf9f5] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <ScrollReveal>
            <div className="mb-6 flex items-baseline gap-3">
              <h2 className="font-serif text-[clamp(1.6rem,4vw,2.3rem)] font-bold tracking-tight text-[#271310]">Servicios</h2>
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#C6A15B]">Lo que hacemos</span>
            </div>
            <ul className="mt-6 border-t border-[#271310]">
              {SERVICIOS.map((item, idx) => (
                <li key={idx} className="group flex flex-col gap-2 border-b border-[#271310]/15 py-6 pl-1 pr-1 transition-all duration-250 hover:bg-[#C6A15B]/5 hover:pl-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col">
                    <div className="text-[1.22rem] font-bold leading-tight text-[#271310]">{item.t}</div>
                    {item.d && <div className="mt-0.5 text-[0.98rem] text-[#504442]">{item.d}</div>}
                  </div>
                  <a 
                    href={wa(`me interesa: ${item.t}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex shrink-0 items-center gap-2 text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-[#3f6b3a] transition-colors hover:text-[#2b4a28] sm:mt-0"
                  >
                    Consultar →
                  </a>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </section>

      {/* PRODUCTOS */}
      <section className="bg-[#faf9f5] pb-16 pt-0 sm:pb-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <ScrollReveal>
            <div className="mb-6 flex items-baseline gap-3">
              <h2 className="font-serif text-[clamp(1.6rem,4vw,2.3rem)] font-bold tracking-tight text-[#271310]">Café e insumos</h2>
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#C6A15B]">Lo que vendemos</span>
            </div>
            <ul className="mt-6 border-t border-[#271310]">
              {PRODUCTOS.map((item, idx) => (
                <li key={idx} className="group flex flex-col gap-2 border-b border-[#271310]/15 py-6 pl-1 pr-1 transition-all duration-250 hover:bg-[#C6A15B]/5 hover:pl-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col">
                    <div className="text-[1.22rem] font-bold leading-tight text-[#271310]">{item.t}</div>
                    {item.d && <div className="mt-0.5 text-[0.98rem] text-[#504442]">{item.d}</div>}
                  </div>
                  <a 
                    href={wa(`me interesa: ${item.t}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex shrink-0 items-center gap-2 text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-[#3f6b3a] transition-colors hover:text-[#2b4a28] sm:mt-0"
                  >
                    Consultar →
                  </a>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#120c08] text-[#f4f4f0]">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 sm:py-24">
          <ScrollReveal>
            <div className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#C6A15B]">
              Escríbenos
            </div>
            <h2 className="mb-4 font-serif text-[clamp(1.7rem,4.5vw,2.8rem)] font-extrabold tracking-tight">
              ¿Te interesa algo?
            </h2>
            <p className="mx-auto mb-8 max-w-[44ch] text-[#e0d9c8]">
              Cuéntanos qué necesitas y te respondemos.
            </p>
            <a 
              href={generalWa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded bg-[#f4f4f0] px-6 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[#120c08] transition-all hover:-translate-y-0.5 hover:bg-white"
            >
              Contactar a ACARO
            </a>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-[0.92rem] font-semibold">
              <a href={wa("hola")} target="_blank" rel="noopener noreferrer" className="text-[#C6A15B] transition-opacity hover:opacity-80">
                WhatsApp +{num}
              </a>
              <a href={`mailto:${CONTACT.email}`} className="text-[#C6A15B] transition-opacity hover:opacity-80">
                {CONTACT.email}
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PublicLayout>
  );
}
