import Image from "next/image"
import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  FlaskConical,
  MapPin,
  Newspaper,
  Sprout,
  Waypoints,
} from "lucide-react"

import { PublicLayout } from "@/components/layout/PublicLayout"
import { HeroParallaxImage, ScrollReveal, ScrollScene } from "@/components/landing/LandingMotion"
import { mockNews } from "@/data/mock-news"
import { mockProjects } from "@/data/mock-projects"

const projectIcons = [Sprout, FlaskConical, Waypoints]

const projectStatusLabel = (status: string) => status === "Planificación" ? "Planificado" : status

export default function Home() {
  const featuredProjects = mockProjects.slice(0, 3)
  const [featuredNews, ...secondaryNews] = mockNews

  return (
    <PublicLayout className="landing-typography">
      <section className="relative isolate flex min-h-[calc(100svh-72px)] items-end overflow-hidden bg-[#24130d] text-[#fffaf1]">
        <HeroParallaxImage />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,12,8,0.94)_0%,rgba(42,24,16,0.78)_42%,rgba(42,24,16,0.18)_76%,rgba(18,12,8,0.38)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(18,12,8,0.78)_0%,transparent_48%)]" />

        <div className="relative mx-auto w-full max-w-7xl px-5 pb-12 pt-32 sm:px-8 sm:pb-16 lg:px-10 lg:pb-20">
          <div className="max-w-4xl -translate-y-6 sm:-translate-y-8 lg:-translate-y-10">
            <div className="hero-reveal mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#e2b86f]" style={{ animationDelay: "80ms" }}>
              <span className="h-px w-10 bg-[#c28a3a]" />
              Café Robusta · Panamá
            </div>
            <h1 className="landing-hero-title hero-reveal max-w-4xl text-5xl leading-[0.92] tracking-[-0.055em] sm:text-6xl lg:text-[5.5rem]" style={{ animationDelay: "170ms" }}>
              Asociación Café
              <span className="block text-[#fffaf1]">Robusta OBC</span>
            </h1>
            <p className="hero-reveal mt-7 max-w-2xl text-lg leading-8 text-[#f3e8d8]/85 sm:text-xl" style={{ animationDelay: "320ms" }}>
              Impulsamos el desarrollo del café robusta con organización, conocimiento técnico y visión productiva.
            </p>
            <div className="hero-reveal mt-9 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "460ms" }}>
              <Link href="/nosotros" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#fffaf1] bg-[#fffaf1] px-6 text-sm font-semibold text-[#24130d] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_34px_rgba(255,250,241,0.16)] active:translate-y-0">
                Conocer la asociación <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/biblioteca" className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#fffaf1]/35 bg-[#fffaf1]/5 px-6 text-sm font-semibold text-[#fffaf1] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-[#fffaf1]/12 active:translate-y-0">
                Explorar biblioteca
              </Link>
            </div>
          </div>
          <div className="hero-reveal mt-16 flex items-center justify-between border-t border-[#fffaf1]/20 pt-5 text-xs uppercase tracking-[0.18em] text-[#f3e8d8]/65" style={{ animationDelay: "620ms" }}>
            <span>Organización · Conocimiento · Producción</span>
            <ArrowDown className="hidden h-4 w-4 sm:block" />
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

      <ScrollScene className="overflow-hidden bg-[#24130d] py-24 text-[#f3e8d8] sm:py-32">
        <div className="absolute inset-0 scale-105">
          <Image
            src="/assets/hero-bg.jpg"
            alt=""
            fill
            className="scene-scale object-cover object-center opacity-55 saturate-[0.7]"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-[#24130d]/68" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_28%,rgba(124,76,48,0.32),transparent_46%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(18,9,6,0.82),rgba(43,23,16,0.28),rgba(18,9,6,0.72))]" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <ScrollReveal className="relative z-10 text-center" distance="sm">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d7a24a]">Nuestra excelencia</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.025em] text-[#f4f0dc] sm:text-5xl">Proyectos destacados</h2>
          </ScrollReveal>

          <div className="relative z-10 mt-14 grid gap-5 md:grid-cols-3">
            {featuredProjects.map((project, index) => {
              const Icon = projectIcons[index] ?? FlaskConical
              return (
                <ScrollReveal
                  key={project.id}
                  delay={index * 130}
                  className="premium-project group relative flex min-h-[390px] flex-col overflow-hidden rounded-xl border border-[#dfd0bf] bg-[#f8f1e8]/95 p-7 backdrop-blur-md hover:border-[#cda96f] hover:bg-[#fffaf1]"
                >
                  {index === 1 && (
                    <div className="absolute inset-0 opacity-[0.045]">
                      <Image src="/assets/hero-bg.jpg" alt="" fill className="object-cover" sizes="33vw" />
                    </div>
                  )}
                  <div className="relative flex h-full flex-col">
                    <Icon className="h-8 w-8 text-[#a66f20]" strokeWidth={1.6} />
                    <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a66f20]">{project.category}</p>
                    <h3 className="mt-3 font-serif text-2xl font-semibold leading-tight text-[#321b13]">{project.title}</h3>
                    <p className="mt-4 text-sm leading-6 text-[#715e52]">{project.description}</p>
                    <div className="mt-auto pt-8">
                      <div className="h-px w-full bg-[#dfd0bf] transition-colors group-hover:bg-[#cda96f]" />
                      <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-[#897568]">
                        <span>Iniciativa 0{index + 1}</span>
                        <span className="text-[#a66f20]">{projectStatusLabel(project.status)}</span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>

          <ScrollReveal className="relative z-10 mt-10 text-center" delay={360} distance="sm">
            <Link href="/proyectos" className="group inline-flex items-center gap-2 border-b border-[#d7a24a]/40 pb-1 text-sm font-semibold text-[#d7a24a] transition-all hover:gap-4 hover:border-[#d7a24a]">
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
            className="scene-scale -scale-x-100 object-cover opacity-[0.14] mix-blend-multiply"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,247,240,0.78),rgba(255,253,248,0.97)_27%,rgba(255,253,248,0.97)_73%,rgba(251,247,240,0.78))]" />
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

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <ScrollReveal className="premium-project group relative min-h-[500px] overflow-hidden rounded-[10px] bg-[#2b1710] p-8 text-[#fffaf1] sm:p-10" direction="left">
              <div className="absolute inset-0 opacity-30">
                <Image src="/assets/library-hero-v2.png" alt="" fill className="scene-scale object-cover" sizes="(min-width: 1024px) 58vw, 100vw" />
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(31,17,11,0.98),rgba(31,17,11,0.25))]" />
              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-[#e7c792]">
                  <span>{featuredNews.category}</span><span>{featuredNews.date}</span>
                </div>
                <div className="mt-auto">
                  <h3 className="scene-drift-side max-w-2xl font-serif text-4xl font-semibold leading-[1.08] sm:text-5xl">{featuredNews.title}</h3>
                  <p className="mt-6 max-w-xl text-base leading-7 text-[#f3e8d8]/78">{featuredNews.summary}</p>
                  <Link href="/noticias" className="group/link mt-8 inline-flex items-center gap-2 border-b border-[#e7c792]/55 pb-1 text-sm font-semibold text-[#e7c792]">
                    Leer comunicado <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>

            <div className="scene-drift-up grid gap-4">
              {secondaryNews.map((news, index) => (
                <ScrollReveal key={news.id} delay={index * 120} className="premium-project group flex min-h-[238px] flex-col rounded-[10px] border border-[#d8cabb] bg-[#f6efe5]/65 p-6 hover:border-[#b57931]/60 hover:bg-[#f6efe5]" direction="right">
                  <div className="flex items-start justify-between gap-4">
                    <Newspaper className="h-6 w-6 text-[#b57931]" strokeWidth={1.5} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a755c]">{news.date}</span>
                  </div>
                  <div className="mt-6 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#a66f2e]">{news.category}</p>
                    <h3 className="mt-3 font-serif text-2xl font-semibold leading-tight transition-colors group-hover:text-[#a66f2e]">{news.title}</h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#806b5f]">{news.summary}</p>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-[#d8cabb] pt-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8e705e]">Comunicado 0{index + 2}</span>
                    <ArrowRight className="h-4 w-4 text-[#9d7145] transition-transform group-hover:translate-x-1" />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
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
