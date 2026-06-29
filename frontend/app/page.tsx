import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"

import { PublicLayout } from "@/components/layout/PublicLayout"
import { HeroParallaxImage, ScrollReveal } from "@/components/landing/LandingMotion"
import { ProjectsStoryline } from "@/components/home/ProjectsStoryline"
import { NewsGrid } from "@/components/home/NewsGrid"
import { CommunitySection } from "@/components/home/CommunitySection"
import { LibraryPreview } from "@/components/home/LibraryPreview"
import { LandingMetadataBar } from "@/components/home/LandingMetadataBar"

export const metadata: Metadata = {
  title: "ACARO OBC | Cafe Robusta de Panama",
  description:
    "Asociacion Cafe Robusta OBC impulsa organizacion, conocimiento tecnico y desarrollo productivo para comunidades cafetaleras en Panama.",
  openGraph: {
    title: "ACARO OBC | Cafe Robusta de Panama",
    description:
      "Organizacion, conocimiento tecnico y desarrollo productivo para comunidades cafetaleras de robusta.",
    url: "https://acaro.org",
    siteName: "ACARO OBC",
    images: [{ url: "/assets/landing-hero-v2.jpg", width: 1200, height: 630 }],
    locale: "es_PA",
    type: "website",
  },
}

export default function Home() {
  return (
    <PublicLayout className="landing-typography">
      <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-[#24130d] text-[#fffaf1]">
        <HeroParallaxImage />
        <div className="absolute inset-0 bg-[#120c08]/30" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(12,8,4,0.96)_0%,rgba(12,8,4,0.72)_22%,rgba(12,8,4,0.18)_52%,transparent_72%)]" />

        <div className="relative mx-auto w-full max-w-7xl px-5 pb-12 pt-32 sm:px-8 sm:pb-16 lg:px-10 lg:pb-20">
          <div className="max-w-4xl -translate-y-6 sm:-translate-y-8 lg:-translate-y-10">
            <div className="hero-reveal mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#e2b86f]" style={{ animationDelay: "20ms" }}>
              Café Robusta · Panamá
            </div>
            <h1 className="font-serif font-bold hero-reveal max-w-4xl text-4xl leading-[1.0] tracking-[-0.02em] sm:text-6xl lg:text-[5rem]" style={{ animationDelay: "60ms" }}>
              Asociación Café
              <span className="block text-[#fffaf1]">Robusta OBC</span>
            </h1>
            <p className="hero-reveal mt-5 max-w-2xl text-base leading-7 text-[#f3e8d8]/85 sm:mt-7 sm:text-xl sm:leading-8" style={{ animationDelay: "100ms" }}>
              Impulsamos el desarrollo del café robusta con organización, conocimiento técnico y visión productiva.
            </p>
            <div className="hero-reveal mt-7 flex flex-col items-stretch gap-3 sm:mt-9 sm:flex-row sm:items-start" style={{ animationDelay: "140ms" }}>
              <Link href="/nosotros" className="group inline-flex w-full items-center justify-center gap-2 whitespace-nowrap bg-[#fffaf1] px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-[#271310] transition-all hover:bg-white sm:w-auto sm:px-8 sm:py-4">
                Conocer la asociación <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/biblioteca" className="inline-flex w-full items-center justify-center whitespace-nowrap border border-[#fffaf1]/40 px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-[#fffaf1] transition-all hover:bg-[#fffaf1]/10 sm:w-auto sm:px-8 sm:py-4">
                Explorar biblioteca
              </Link>
            </div>
          </div>
          <div className="hero-reveal mt-10 text-xs uppercase tracking-[0.25em] text-[#f3e8d8]/30 font-medium sm:mt-24" style={{ animationDelay: "180ms" }}>
            Organización · Conocimiento · Producción
          </div>
        </div>
      </section>

      {/* Línea de transición */}
      <div className="relative h-28 w-full overflow-hidden pointer-events-none bg-[#faf9f5]">
        <svg className="h-full w-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1000 100">
          <path className="growth-path" d="M0,50 C200,10 400,90 600,50 C800,10 900,90 1000,50" stroke="#E0DCD0" strokeWidth="1" opacity="0.7" />
        </svg>
      </div>

      {/* Una asociación creada para crecer juntos */}
      <section className="bg-[#faf9f5] overflow-hidden pb-16 pt-14 sm:pb-32 sm:pt-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">

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
                <div className="aspect-[4/3] overflow-hidden sm:-mr-8 lg:-mr-10">
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

      <LandingMetadataBar />

      {/* Proyectos que abren oportunidades */}
      <section className="overflow-hidden bg-[#f4f4f0] py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <ScrollReveal className="mb-12 flex items-end justify-between border-b border-[#d3c3c0]/40 pb-6 sm:mb-20" distance="sm">
            <div>
              <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-[#1b6d24]">
                Capítulos de Progreso
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#271310] sm:text-5xl lg:text-[3rem]">
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
      <section className="bg-[#faf9f5] py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <NewsGrid />
        </div>
      </section>

      {/* Línea de transición — desde la derecha */}
      <div className="relative h-28 w-full overflow-hidden pointer-events-none bg-[#faf9f5]">
        <svg className="h-full w-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1000 100">
          <path className="growth-path" d="M1000,50 C800,10 600,90 400,50 C200,10 100,90 0,50" stroke="#E0DCD0" strokeWidth="1" opacity="0.7" />
        </svg>
      </div>

      {/* Las personas son el corazón */}
      <CommunitySection />

      {/* Biblioteca de Excelencia */}
      <section className="bg-[#faf9f5] py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <ScrollReveal className="mb-10 text-center sm:mb-16" distance="sm">
            <h2 className="font-serif text-2xl font-bold text-[#271310] sm:text-4xl">
              Biblioteca de Excelencia
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#504442]">
              Un repositorio técnico diseñado como un toolkit para el empoderamiento del productor rural.
            </p>
          </ScrollReveal>
          <LibraryPreview />
          <ScrollReveal className="mt-10 flex justify-center" delay={200} distance="sm">
            <Link href="/biblioteca" className="w-full max-w-xs bg-[#271310] px-8 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-[#3e2723] sm:w-auto">
              Explorar Biblioteca
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Cultivar café robusta también es cultivar futuro — CTA final */}
      <section className="relative overflow-hidden bg-[#faf9f5] py-20 text-center sm:py-32 lg:py-40">
        {/* Subtle SVG wave */}
        <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]">
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M0,50 Q25,0 50,50 T100,50" fill="none" stroke="#271310" strokeWidth="0.5" />
          </svg>
        </div>

        <ScrollReveal className="relative z-10 mx-auto max-w-4xl px-5 sm:px-8" distance="lg">
          <h2 className="mb-7 font-serif text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-[#271310] sm:mb-10 sm:text-5xl lg:text-[4rem]">
            &ldquo;Cultivar café robusta también es cultivar futuro.&rdquo;
          </h2>
          <p className="mx-auto mb-10 max-w-2xl font-sans text-base leading-relaxed text-[#504442] sm:mb-14 sm:text-lg">
            Únete a nuestra red de productores y profesionales para transformar la industria.
          </p>
          <Link
            href="/contacto"
            className="inline-block w-full max-w-xs bg-[#271310] px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-transform duration-300 hover:scale-105 active:scale-95 sm:w-auto sm:px-12 sm:py-5"
          >
            Quiero contactar a ACARO
          </Link>
        </ScrollReveal>
      </section>
    </PublicLayout>
  )
}
