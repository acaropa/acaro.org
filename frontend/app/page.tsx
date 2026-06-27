import Link from "next/link"
import { ArrowRight, ArrowUpRight, PlayCircle } from "lucide-react"

import { PublicLayout } from "@/components/layout/PublicLayout"
import { HeroParallaxImage, ScrollReveal } from "@/components/landing/LandingMotion"
import { ProjectsStoryline } from "@/components/home/ProjectsStoryline"
import { NewsGrid } from "@/components/home/NewsGrid"
import { CommunitySection } from "@/components/home/CommunitySection"
import { LibraryPreview } from "@/components/home/LibraryPreview"

export default function Home() {
  return (
    <PublicLayout className="landing-typography">
      <section className="relative isolate -mt-18 flex min-h-[100svh] items-end overflow-hidden bg-[#24130d] text-[#fffaf1]">
        <HeroParallaxImage />
        <div className="absolute inset-0 bg-[#120c08]/30" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(12,8,4,0.96)_0%,rgba(12,8,4,0.72)_22%,rgba(12,8,4,0.18)_52%,transparent_72%)]" />

        <div className="relative mx-auto w-full max-w-7xl px-5 pb-12 pt-32 sm:px-8 sm:pb-16 lg:px-10 lg:pb-20">
          <div className="max-w-4xl -translate-y-6 sm:-translate-y-8 lg:-translate-y-10">
            <div className="hero-reveal mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#e2b86f]" style={{ animationDelay: "80ms" }}>
              Café Robusta · Panamá
            </div>
            <h1 className="font-serif font-bold hero-reveal max-w-4xl text-5xl leading-[1.0] tracking-[-0.02em] sm:text-6xl lg:text-[5rem]" style={{ animationDelay: "170ms" }}>
              Asociación Café
              <span className="block text-[#fffaf1]">Robusta OBC</span>
            </h1>
            <p className="hero-reveal mt-7 max-w-2xl text-lg leading-8 text-[#f3e8d8]/85 sm:text-xl" style={{ animationDelay: "320ms" }}>
              Impulsamos el desarrollo del café robusta con organización, conocimiento técnico y visión productiva.
            </p>
            <div className="hero-reveal mt-9 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "460ms" }}>
              <Link href="/nosotros" className="group inline-flex items-center gap-2 bg-[#fffaf1] px-8 py-4 text-xs font-bold uppercase tracking-widest text-[#271310] transition-all hover:bg-white">
                Conocer la asociación <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/biblioteca" className="inline-flex items-center border border-[#fffaf1]/40 px-8 py-4 text-xs font-bold uppercase tracking-widest text-[#fffaf1] transition-all hover:bg-[#fffaf1]/10">
                Explorar biblioteca
              </Link>
            </div>
          </div>
          <div className="hero-reveal mt-24 text-xs uppercase tracking-[0.25em] text-[#f3e8d8]/30 font-medium" style={{ animationDelay: "620ms" }}>
            Organización · Conocimiento · Producción
          </div>
        </div>
      </section>

      {/* Línea de transición */}
      <div className="relative h-28 w-full overflow-hidden pointer-events-none bg-[#faf9f5]">
        <svg className="h-full w-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1000 100">
          <path className="growth-path" d="M0,50 C200,10 400,90 600,50 C800,10 1000,50" stroke="#E0DCD0" strokeWidth="1" opacity="0.7" />
        </svg>
      </div>

      {/* Una asociación creada para crecer juntos */}
      <section className="bg-[#faf9f5] pb-32 pt-24 sm:pb-40 sm:pt-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">

            {/* Left: editorial content */}
            <ScrollReveal className="lg:col-span-5" direction="left" distance="lg">
              <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-[#1b6d24]">
                Nuestra Identidad
              </span>
              <h2 className="mb-6 font-serif text-4xl font-bold leading-tight tracking-[-0.025em] text-[#271310] sm:text-5xl">
                Una asociación creada para crecer juntos.
              </h2>
              <div className="mb-8 h-px bg-[#E0DCD0]" />
              <p className="mb-6 text-base leading-7 text-[#504442]">
                Desde nuestra fundación, ACARO OBC ha operado bajo la premisa de que la tecnificación no es un fin, sino una herramienta de justicia social. No solo producimos café; cultivamos comunidades resilientes que lideran el mercado de robusta con estándares internacionales.
              </p>
              <Link
                href="/nosotros"
                className="inline-block border-b border-[#271310] pb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#271310] transition-opacity hover:opacity-60"
              >
                Conoce nuestra misión
              </Link>
            </ScrollReveal>

            {/* Right: asymmetric image + editorial callout */}
            <ScrollReveal className="relative lg:col-span-7" direction="right" delay={180}>
              <div className="relative">
                <div className="-mr-5 aspect-[4/3] overflow-hidden sm:-mr-8 lg:-mr-10">
                  <img
                    src="/assets/landing-hero-v2.jpg"
                    alt="Productores de café robusta en Panamá"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <div className="absolute -bottom-10 left-0 hidden w-72 bg-[#120c08] p-8 text-white md:block">
                  <p className="mb-3 font-serif text-base italic leading-snug">
                    &ldquo;La educación es la semilla del cambio en nuestras montañas.&rdquo;
                  </p>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-white/60">
                    — Programa de Relevo Generacional
                  </span>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* Metadata Bar */}
      <div className="w-full bg-[#120c08] py-8">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="flex flex-col items-center border-r border-white/10 last:border-0">
              <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">Altitud Promedio</span>
              <span className="font-serif text-lg font-semibold text-white">0 – 800 msnm</span>
            </div>
            <div className="flex flex-col items-center border-r border-white/10 last:border-0">
              <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">Precipitación Anual</span>
              <span className="font-serif text-lg font-semibold text-white">2,000 – 3,000 mm</span>
            </div>
            <div className="flex flex-col items-center border-r border-white/10 last:border-0">
              <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">Variedades</span>
              <span className="font-serif text-lg font-semibold text-white">Coffea canephora</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">Estándar de Calidad</span>
              <span className="font-serif text-lg font-semibold text-white">OBC Premium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Proyectos que abren oportunidades */}
      <section className="overflow-hidden bg-[#f4f4f0] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <ScrollReveal className="mb-20 flex items-end justify-between border-b border-[#d3c3c0]/40 pb-6" distance="sm">
            <div>
              <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-[#1b6d24]">
                Capítulos de Progreso
              </span>
              <h2 className="font-serif text-4xl font-bold text-[#271310] sm:text-5xl lg:text-[3rem]">
                Proyectos que abren oportunidades
              </h2>
            </div>
            <Link href="/proyectos" className="group hidden shrink-0 items-center gap-2 text-sm font-semibold text-[#271310] transition-transform hover:translate-x-2 md:flex">
              Ver todos los proyectos <ArrowRight className="h-4 w-4" />
            </Link>
          </ScrollReveal>
          <ProjectsStoryline />
        </div>
      </section>

      {/* Avances Institucionales (Noticias) */}
      <section className="bg-[#faf9f5] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <NewsGrid />
        </div>
      </section>

      {/* Línea de transición — desde la derecha */}
      <div className="relative h-28 w-full overflow-hidden pointer-events-none bg-[#faf9f5]">
        <svg className="h-full w-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1000 100">
          <path className="growth-path" d="M1000,50 C800,10 600,90 400,50 C200,10 0,50" stroke="#E0DCD0" strokeWidth="1" opacity="0.7" />
        </svg>
      </div>

      {/* Las personas son el corazón */}
      <CommunitySection />

      {/* Biblioteca de Excelencia */}
      <section className="bg-[#faf9f5] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <ScrollReveal className="mb-16 text-center" distance="sm">
            <h2 className="font-serif text-3xl font-bold text-[#271310] sm:text-4xl">
              Biblioteca de Excelencia
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#504442]">
              Un repositorio técnico diseñado como un toolkit para el empoderamiento del productor rural.
            </p>
          </ScrollReveal>
          <LibraryPreview />
          <ScrollReveal className="mt-10 flex justify-center" delay={200} distance="sm">
            <Link href="/biblioteca" className="bg-[#271310] px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-[#3e2723]">
              Explorar Biblioteca
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Cultivar café robusta también es cultivar futuro — CTA final */}
      <section className="relative overflow-hidden bg-[#faf9f5] py-32 text-center sm:py-40">
        {/* Subtle SVG wave */}
        <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]">
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M0,50 Q25,0 50,50 T100,50" fill="none" stroke="#271310" strokeWidth="0.5" />
          </svg>
        </div>

        <ScrollReveal className="relative z-10 mx-auto max-w-4xl px-5 sm:px-8" distance="lg">
          <h2 className="mb-10 font-serif text-[2.5rem] font-bold leading-[1.1] tracking-[-0.02em] text-[#271310] sm:text-5xl lg:text-[4rem]">
            &ldquo;Cultivar café robusta también es cultivar futuro.&rdquo;
          </h2>
          <p className="mx-auto mb-14 max-w-2xl font-sans text-lg leading-relaxed text-[#504442]">
            Únete a nuestra red de productores y profesionales para transformar la industria.
          </p>
          <Link
            href="/contacto"
            className="inline-block bg-[#271310] px-12 py-5 text-xs font-bold uppercase tracking-widest text-white transition-transform duration-300 hover:scale-105 active:scale-95"
          >
            Contáctanos
          </Link>
        </ScrollReveal>
      </section>
    </PublicLayout>
  )
}
