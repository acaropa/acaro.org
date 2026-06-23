import Image from "next/image"
import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  MapPin,
  Newspaper,
} from "lucide-react"

import { PublicLayout } from "@/components/layout/PublicLayout"
import { HeroParallaxImage, ScrollReveal, ScrollScene } from "@/components/landing/LandingMotion"
import { FeaturedProjects } from "@/components/home/FeaturedProjects"
import { LatestNews } from "@/components/home/LatestNews"

export default function Home() {
  return (
    <PublicLayout className="landing-typography">
      <section className="relative isolate -mt-18 flex min-h-[100svh] items-end overflow-hidden bg-[#24130d] text-[#fffaf1]">
        <HeroParallaxImage />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,12,8,0.94)_0%,rgba(42,24,16,0.78)_42%,rgba(42,24,16,0.18)_76%,rgba(18,12,8,0.38)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(18,12,8,0.78)_0%,transparent_48%)]" />

        <div className="relative mx-auto w-full max-w-7xl px-5 pb-12 pt-32 sm:px-8 sm:pb-16 lg:px-10 lg:pb-20">
          <div className="max-w-4xl -translate-y-6 sm:-translate-y-8 lg:-translate-y-10">
            <div className="hero-reveal mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#e2b86f]" style={{ animationDelay: "80ms" }}>
              Café Robusta · Panamá
            </div>
            <h1 className="font-serif font-semibold hero-reveal max-w-4xl text-5xl leading-[1.0] tracking-[-0.02em] sm:text-6xl lg:text-[5rem]" style={{ animationDelay: "170ms" }}>
              Asociación Café
              <span className="block text-[#fffaf1]">Robusta OBC</span>
            </h1>
            <p className="hero-reveal mt-7 max-w-2xl text-lg leading-8 text-[#f3e8d8]/85 sm:text-xl" style={{ animationDelay: "320ms" }}>
              Impulsamos el desarrollo del café robusta con organización, conocimiento técnico y visión productiva.
            </p>
            <div className="hero-reveal mt-9 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "460ms" }}>
              <Link href="/nosotros" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#fffaf1] bg-[#fffaf1] px-6 text-sm font-semibold text-[#24130d] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_34px_rgba(255,250,241,0.16)] active:translate-y-0">
                Conocer la asociación <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/biblioteca" className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#fffaf1]/35 bg-[#fffaf1]/5 px-6 text-sm font-semibold text-[#fffaf1] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-[#fffaf1]/12 active:translate-y-0">
                Explorar biblioteca
              </Link>
            </div>
          </div>
          <div className="hero-reveal mt-24 text-xs uppercase tracking-[0.25em] text-[#f3e8d8]/30 font-medium" style={{ animationDelay: "620ms" }}>
            Organización · Conocimiento · Producción
          </div>
        </div>
      </section>

      <ScrollScene className="overflow-hidden bg-[#faf4ea] py-24 text-[#2b1710] sm:py-32">
        <div className="absolute inset-0">
          <Image
            src="/assets/coffee-beans-texture.png"
            alt=""
            fill
            className="scene-scale object-cover opacity-30 mix-blend-multiply"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(250,244,234,0.68),rgba(255,253,248,0.94)_34%,rgba(255,253,248,0.94)_66%,rgba(250,244,234,0.68))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,253,248,0.42),transparent_68%)]" />
        <div className="scene-line absolute left-0 top-0 h-px w-full bg-[linear-gradient(90deg,transparent,#c28a3a,transparent)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
            <ScrollReveal className="lg:col-span-5 lg:col-start-2" direction="left" distance="lg">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#a66f2e]">Nuestra identidad</p>
              <h2 className="scene-drift-up mt-6 font-serif text-4xl font-semibold leading-[1.08] tracking-[-0.025em] sm:text-5xl">
                Excelencia que nace del campo.
              </h2>
              <p className="mt-7 text-base leading-7 text-[#765e50] sm:text-lg sm:leading-8">
                Somos una organización comprometida con la excelencia agrícola, trabajando mano a mano con productores locales para elevar el estándar del café robusta.
              </p>
              <p className="mt-5 text-base leading-7 text-[#765e50] sm:text-lg sm:leading-8">
                Fusionamos las prácticas tradicionales con innovación tecnológica y gestión profesional para asegurar trazabilidad, calidad y sostenibilidad en cada etapa del proceso.
              </p>
              <Link href="/nosotros" className="group mt-8 inline-flex items-center gap-2 border-b border-[#b57931]/45 pb-1 text-sm font-semibold text-[#8a5925] transition-all hover:gap-4 hover:border-[#b57931]">
                Conocer nuestros métodos <ArrowRight className="h-4 w-4" />
              </Link>
            </ScrollReveal>

            <ScrollReveal className="relative h-[460px] lg:col-span-5 lg:col-start-8 lg:h-[580px]" direction="right" delay={180}>
              <div className="absolute -inset-5 border border-[#c28a3a]/15 bg-[#f6efe5] blur-2xl" />
              <div className="premium-project relative h-full overflow-hidden rounded-[10px] border border-[#c9ad8b]/45 bg-[#2b1710]">
                <Image
                  src="/assets/hero-bg.jpg"
                  alt="Cerezas de café robusta en la planta"
                  fill
                  className="scene-scale object-cover"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(31,17,11,0.65),transparent_55%)]" />
                <div className="absolute bottom-0 left-0 p-7 text-[#fffaf1]">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e7c792]">Origen · Panamá</p>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-[#f3e8d8]/80">Conocimiento técnico y trabajo colectivo desde la finca.</p>
                </div>
              </div>
            </ScrollReveal>
          </div>

        </div>
      </ScrollScene>

      <ScrollScene className="relative overflow-hidden bg-[#160d08] py-24 text-[#f3e8d8] sm:py-32">
        <div className="absolute -inset-8">
          <Image
            src="/assets/hero-bg.jpg"
            alt=""
            fill
            className="scene-scale scale-105 object-cover blur-[3px]"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-[#160d08]/75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(116,55,30,0.25),rgba(16,9,6,0.9)_82%)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <ScrollReveal className="text-center" distance="sm">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d7a24a]">Nuestra excelencia</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.025em] text-[#fff8eb] sm:text-5xl lg:text-6xl">Proyectos destacados</h2>
          </ScrollReveal>

          <FeaturedProjects />

          <ScrollReveal className="mt-10 flex justify-center" delay={240} distance="sm">
            <Link href="/proyectos" className="group inline-flex items-center gap-2 border-b border-[#d7a24a]/55 pb-1.5 text-sm font-semibold text-[#e0ad55] transition-all hover:gap-4 hover:border-[#e0ad55] hover:text-[#f0c87e]">
              Ver todos los proyectos <ArrowRight className="h-4 w-4" />
            </Link>
          </ScrollReveal>
        </div>
      </ScrollScene>

      <ScrollScene className="overflow-hidden bg-[#fbf7f0] py-24 text-[#2b1710] sm:py-32">
        <div className="absolute inset-0 scale-105">
          <Image
            src="/assets/coffee-beans-texture.png"
            alt=""
            fill
            className="scene-scale -scale-x-100 object-cover opacity-[0.22] mix-blend-multiply"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,247,240,0.62),rgba(255,253,248,0.9)_27%,rgba(255,253,248,0.9)_73%,rgba(251,247,240,0.62))]" />
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <ScrollReveal className="flex flex-col gap-5 border-b border-[#d8cabb] pb-8 sm:flex-row sm:items-end sm:justify-between" distance="sm">
            <div>
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-[#a66f2e]">
                <Newspaper className="h-4 w-4" />Actualidad institucional
              </div>
              <h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.025em] sm:text-5xl">Noticias y comunicados</h2>
              <p className="mt-4 text-[#765e50]">Conoce los avances, acuerdos y actividades de la asociación.</p>
            </div>
            <Link href="/noticias" className="group inline-flex items-center gap-2 text-sm font-semibold text-[#5a3424]">
              Ver todas las noticias <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </ScrollReveal>

          <LatestNews />
        </div>
      </ScrollScene>

      <ScrollScene className="relative overflow-hidden bg-[#24130d] py-24 text-[#fffaf1] transition-colors duration-1000 sm:py-28">
        <div className="scene-orbit absolute -right-28 -top-36 h-96 w-96 rounded-full border border-[#c28a3a]/15" />
        <div className="scene-orbit absolute -right-12 -top-20 h-72 w-72 rounded-full border border-[#c28a3a]/15" />
        <div className="scene-line absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#c28a3a,transparent)]" />
        <ScrollReveal className="scene-wipe relative mx-auto max-w-5xl px-5 text-center sm:px-8" distance="lg">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d7a24a]">Crecer en colectivo</p>
          <h2 className="mx-auto mt-6 max-w-4xl font-serif text-4xl font-semibold leading-[1.08] tracking-[-0.025em] sm:text-5xl lg:text-6xl">¿Deseas más información o unirte a la asociación?</h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#d8c9bb] sm:text-lg">Conversemos sobre afiliación, cooperación técnica y nuevas oportunidades para el sector.</p>
          <Link href="/contacto" className="cta-sheen mt-9 inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#fffaf1] bg-[#fffaf1] px-7 text-sm font-semibold text-[#24130d] transition-all duration-500 hover:-translate-y-1 hover:bg-white hover:shadow-[0_16px_40px_rgba(255,250,241,0.16)] active:translate-y-0">
            Contáctanos ahora <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="mt-14 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.16em] text-[#b8a99a]">
            <MapPin className="h-3.5 w-3.5 text-[#d7a24a]" />Fortaleciendo la caficultura robusta desde la organización
          </div>
        </ScrollReveal>
      </ScrollScene>
    </PublicLayout>
  )
}
