import type { Metadata } from "next"
import Link from 'next/link';
import { ArrowRight } from "lucide-react"
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ScrollReveal } from '@/components/landing/LandingMotion';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

export const metadata: Metadata = {
  title: "Nosotros | ACARO OBC",
  description: "Conoce la historia, misión y propósito de la Asociación Café Robusta OBC de Panamá.",
  openGraph: {
    title: "Nosotros | ACARO OBC",
    description: "Fortalecemos la producción de café robusta mediante calidad, innovación, comunidad y sostenibilidad.",
    url: "https://acaro.org/nosotros",
    siteName: "ACARO OBC",
    images: [{ url: "/assets/landing-hero-v2.jpg", width: 1200, height: 630 }],
    locale: "es_PA",
    type: "website",
  },
}

export default function Nosotros() {
  return (
    <PublicLayout className="landing-typography">
      <main className="flex-grow">

        {/* Hero */}
        <section className="relative flex min-h-[600px] items-end overflow-hidden bg-[#120c08] pb-16 pt-32 md:min-h-[720px] md:pb-24">
          <div className="absolute inset-0">
            <OptimizedImage
              alt="Productores de café robusta en campo"
              className="h-full w-full object-cover"
              src="/assets/landing-hero-v2.jpg"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#120c08] via-[#120c08]/50 to-[#120c08]/20" />
          </div>
          <ScrollReveal delay={100} distance="md" className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-[#e2b86f]">Asociación Café Robusta OBC</p>
            <h1 className="font-serif text-4xl font-semibold leading-[1.15] tracking-[-0.015em] text-[#fdf9f4] sm:text-5xl md:text-[60px]">
              Somos Asociación<br className="hidden sm:block" /> Café Robusta OBC
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-[1.6] text-[#fdf9f4]/80">
              Fortalecemos la producción de café robusta mediante calidad, innovación, comunidad y sostenibilidad.
            </p>
          </ScrollReveal>
        </section>

        {/* Nuestro Propósito — oscuro */}
        <section className="bg-[#120c08] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-12 md:gap-6">
              <ScrollReveal delay={0} distance="md" className="md:col-span-5">
                <div className="overflow-hidden">
                  <OptimizedImage
                    alt="Manos con granos de café robusta"
                    className="h-[440px] w-full object-cover md:h-[560px]"
                    src="/assets/coffee-beans-texture.png"
                    sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) 39vw, 482px"
                  />
                </div>
              </ScrollReveal>
              <ScrollReveal delay={200} distance="sm" className="md:col-span-6 md:col-start-7">
                <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-[#e2b86f]">Nuestro Propósito</p>
                <h2 className="mb-8 font-serif text-3xl font-bold leading-[1.2] text-[#fdf9f4] sm:text-4xl">
                  Elevando la cosecha, honrando las manos que la cultivan.
                </h2>
                <p className="text-lg leading-[1.7] text-[#fdf9f4]/80">
                  Existimos para conectar nuestra herencia rural con la excelencia global. Nuestro café robusta no solo se cultiva; es curado por generaciones de conocimiento compartido y tecnificación responsable.
                </p>
                <div className="mt-10 h-px w-20 bg-[#e2b86f]" />
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Misión y Visión — claro */}
        <section className="bg-[#faf9f5] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <ScrollReveal distance="sm" className="mb-16 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1b6d24]">Quiénes somos</p>
            </ScrollReveal>
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
              <ScrollReveal delay={100} distance="sm">
                <span className="block font-black text-[80px] leading-none tracking-[-0.04em] text-[#271310]/8 sm:text-[96px]">01</span>
                <h3 className="mb-6 mt-2 font-serif text-2xl font-semibold text-[#271310]">Misión</h3>
                <div className="mb-6 h-px w-16 bg-[#d8cabb]" />
                <p className="text-lg leading-[1.7] text-[#504442]">
                  Fortalecer el sector cafetero de la provincia de Panamá Oeste, promover su crecimiento con tecnología que sea sostenible, competitiva, y de calidad, amigable con el ambiente.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={250} distance="sm">
                <span className="block font-black text-[80px] leading-none tracking-[-0.04em] text-[#271310]/8 sm:text-[96px]">02</span>
                <h3 className="mb-6 mt-2 font-serif text-2xl font-semibold text-[#271310]">Visión</h3>
                <div className="mb-6 h-px w-16 bg-[#d8cabb]" />
                <p className="text-lg leading-[1.7] text-[#504442]">
                  Ser la asociación líder de productores de café robusta de la región de Panamá Oeste y del país, prestando servicios a sus socios y promoviendo el Café Robusta a nivel nacional e internacional.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Nuestra Identidad — oscuro */}
        <section className="bg-[#120c08] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <ScrollReveal distance="sm" className="mb-12">
              <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#e2b86f]">Nuestra Identidad</p>
            </ScrollReveal>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
              <ScrollReveal delay={100} distance="sm" className="md:col-span-8">
                <Link href="/productores" className="group relative block h-[320px] overflow-hidden md:h-[500px]">
                  <OptimizedImage
                    alt="Productores de café en campo"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src="/assets/productores-card.jpg"
                    sizes="(max-width: 768px) 100vw, 67vw"
                  />
                  <div className="absolute inset-0 bg-[#120c08]/0 transition-colors duration-500 group-hover:bg-[#120c08]/20" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#120c08]/90 to-transparent p-8 md:p-12">
                    <h4 className="mb-3 font-serif text-2xl font-semibold text-[#fdf9f4]">Gente del Robusta</h4>
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[#fdf9f4]/80 transition-colors duration-300 group-hover:text-[#e2b86f]">
                      Conocer sus historias <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
              <ScrollReveal delay={250} distance="sm" className="md:col-span-4">
                <Link href="/biblioteca" className="group relative block h-[320px] overflow-hidden md:h-[500px]">
                  <OptimizedImage
                    alt="Conocimiento técnico en café robusta"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src="/assets/biblioteca-card.jpg"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-[#120c08]/0 transition-colors duration-500 group-hover:bg-[#120c08]/20" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#120c08]/90 to-transparent p-8 md:p-12">
                    <h4 className="mb-3 font-serif text-2xl font-semibold text-[#fdf9f4]">El Conocimiento</h4>
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[#fdf9f4]/80 transition-colors duration-300 group-hover:text-[#e2b86f]">
                      Explorar biblioteca <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </section>

      </main>
    </PublicLayout>
  );
}
