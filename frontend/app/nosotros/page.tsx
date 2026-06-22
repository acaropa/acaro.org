import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ScrollReveal } from '@/components/landing/LandingMotion';

export default function Nosotros() {
  return (
    <PublicLayout className="landing-typography">
      <main className="flex-grow pt-0">
        {/* Hero Section */}
        <section className="relative h-[819px] flex items-end pb-[8rem] px-[20px] md:px-[64px] -mt-24 md:-mt-32">
          <div className="absolute inset-0 z-0">
            <img
              alt="Coffee Plantation Hero"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuATogPneQ9nBijlzZ36QKcw4-IWjplwJBcTmFoBfdkmNh3d-WoUs17-hZEVgaphkv35uyEzjxMxYGi3FplAeeBuWy0Y-3gV2E_4DlyWA4nS8o9Lv4Z3WO6fA-uxa7KWswjuV3Fz6Mz4abBCaDQ4NTdC6HpKA1mRG4kR7YecGKIAqysVodSPS9CwqA9fQYY2ZJqSL-ilROAsQ2q7fb_jXJxJkLtSoQHi7HiSKNc5YRlCUkd2RxiwExNWXq454BHcbRyavkmKRW7BjBoT"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#120C08] via-[#120C08]/40 to-transparent"></div>
          </div>
          <ScrollReveal delay={100} distance="md" className="relative z-10 max-w-[1280px] mx-auto w-full">
            <h1 className="font-serif font-semibold text-[44px] leading-[1.2] md:text-[60px] tracking-[-0.015em] text-[#fdf9f4] max-w-3xl">
              Somos Asociación Café Robusta OBC
            </h1>
            <p className="text-[18px] leading-[1.6] text-[#fdf9f4]/80 mt-8 max-w-xl">
              Fortalecemos la producción de café robusta mediante calidad, innovación, comunidad y sostenibilidad.
            </p>
          </ScrollReveal>
        </section>

        {/* Nuestro Propósito (Asymmetrical) */}
        <section className="py-[8rem] bg-[#120c08]">
          <div className="px-[20px] md:px-[64px] max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-[24px] items-center">
            <div className="md:col-span-5">
              <ScrollReveal delay={0} distance="md">
                <img
                  alt="Hands holding coffee beans"
                  className="w-full h-[600px] object-cover rounded-none grayscale hover:grayscale-0 transition-all duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHafrxwpiLPrptQN7mXGoFg-3DVeBESHNxSWqvFQi491KAbvvBo422XEi-CJ7whKPJ4Ctv9x_Lq7ZfDwa1rigTY_mGk5vZqpEuw3KmpjMWt2FcM4VmBvqhbvRlu8YLrURbzG77ZpVbVsKBgdgEh11OG-2weAlkWjcERJSad3ki2wIT155TQc0wz8fgoU4IOVmd5ujNwFiZddV-frYJcKkHfrSOMR9j71DnNJ9nAL_nckZDoc2RPCdLKoBo_X2UxILdsZo4ZgBnu00F"
                />
              </ScrollReveal>
            </div>
            <div className="md:col-span-6 md:col-start-7 pt-12 md:pt-0">
              <ScrollReveal delay={200} distance="sm">
                <h2 className="text-[12px] font-bold tracking-[0.1em] text-accent uppercase mb-8">Nuestro Propósito</h2>
                <h3 className="font-bold text-[40px] leading-[1.2] text-[#fdf9f4] mb-12">
                  Elevando la cosecha, honrando las manos que la cultivan.
                </h3>
                <p className="text-[18px] leading-[1.6] text-[#fdf9f4]/80 mb-8">
                  Existimos para conectar nuestra herencia rural con la excelencia global. Nuestro café robusta no solo se cultiva; es curado por generaciones de conocimiento.
                </p>
                <div className="w-24 h-[1px] bg-accent mt-16"></div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Mission & Vision (Inverted Background) */}
        <section className="py-[8rem] bg-[#120c08] dark:bg-[#fdf9f4] border-y border-[#fdf9f4]/10 dark:border-[#120c08]/10 transition-colors duration-300">
          <div className="max-w-[1280px] mx-auto px-[20px] md:px-[64px] grid grid-cols-1 md:grid-cols-2 gap-[8rem]">
            <ScrollReveal delay={100} distance="sm">
              <span className="font-black text-[96px] leading-[1] tracking-[-0.04em] text-[#fdf9f4]/10 dark:text-[#120c08]/10 block mb-4 transition-colors duration-300">01</span>
              <h3 className="font-semibold text-[24px] leading-[1.3] text-[#fdf9f4] dark:text-[#120c08] mb-8 transition-colors duration-300">Misión</h3>
              <p className="text-[18px] leading-[1.6] text-[#fdf9f4]/80 dark:text-[#4f453f] transition-colors duration-300">
                Fortalecer el sector cafetero de la provincia de Panamá Oeste, promover su crecimiento con tecnología que sea sostenible, competitiva, y de calidad, amigable con el ambiente.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={300} distance="sm">
              <span className="font-black text-[96px] leading-[1] tracking-[-0.04em] text-[#fdf9f4]/10 dark:text-[#120c08]/10 block mb-4 transition-colors duration-300">02</span>
              <h3 className="font-semibold text-[24px] leading-[1.3] text-[#fdf9f4] dark:text-[#120c08] mb-8 transition-colors duration-300">Visión</h3>
              <p className="text-[18px] leading-[1.6] text-[#fdf9f4]/80 dark:text-[#4f453f] transition-colors duration-300">
                Ser la organización líder de productores de café robusta de la región de Panamá Oeste y del país, prestando servicios a sus socios y promoviendo el Café Robusta a nivel nacional e internacional.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Nuestra Identidad (Gallery) */}
        <section className="py-[8rem] bg-[#120c08] border-t border-[#fdf9f4]/10">
          <div className="px-[20px] md:px-[64px] max-w-[1280px] mx-auto">
            <ScrollReveal delay={0} distance="sm">
              <h2 className="text-[12px] font-bold tracking-[0.1em] text-accent uppercase mb-16 text-center">Nuestra Identidad</h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-[24px]">
              <div className="md:col-span-8">
                <ScrollReveal delay={100} distance="sm" className="h-full">
                  <Link href="/productores" className="relative h-[500px] overflow-hidden group block">
                    <img
                      alt="Farmer in field"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      src="/assets/landing-hero-v2.jpg"
                    />
                    <div className="absolute inset-0 bg-[#120c08]/0 group-hover:bg-[#120c08]/20 transition-colors duration-500"></div>
                    <div className="absolute bottom-0 left-0 p-8 md:p-16 bg-gradient-to-t from-[#120c08]/90 to-transparent w-full">
                      <h4 className="font-semibold text-[24px] leading-[1.3] text-[#fdf9f4] mb-3">Los Productores</h4>
                      <span className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.1em] uppercase text-[#fdf9f4]/80 group-hover:text-accent transition-colors duration-300">
                        Conocer sus historias
                        <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              </div>
              <div className="md:col-span-4">
                <ScrollReveal delay={300} distance="sm" className="h-full">
                  <div className="relative h-[500px] overflow-hidden group">
                    <img
                      alt="Coffee processing"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhoDhWSudZYLXtKLnjmwvfQwKNIv2DAnOeVpEHVNsA0KRSOTmgOKpyagVPpYx5r1_80XIZQa9Pd_lE1ym7pI5AGzJMWayyzRjUv_SwSalV5yrcaLjGq91c7QXLWGT1vvmEGvhH6l-tjKZKEo812qnsV2YDvyq9COLNp3nJovMswp44yMrMzgmTVFLng7gWDRF7xHeUhAPRbBdDzRDbGhU5rHp1TITnVzWFnApyDqvc3xNQj4FOmwhoYG8dP5hPlXCPcBf79i1lcWDR"
                    />
                    <div className="absolute bottom-0 left-0 p-8 md:p-16 bg-gradient-to-t from-[#120c08]/90 to-transparent w-full">
                      <h4 className="font-semibold text-[24px] leading-[1.3] text-[#fdf9f4]">El Arte</h4>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
