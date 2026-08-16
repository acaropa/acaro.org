'use client';

import Image from "next/image";
import {
  ArrowRight,
  ClipboardList,
  Coffee,
  HandHelping,
  MessageCircle,
  ShoppingBag,
  Package,
  Sprout,
  Star,
  UserRound,
} from "lucide-react";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/landing/LandingMotion";

function CoffeeProductIcon({ className, strokeWidth = 1.7, ...props }: React.SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M17 14h14l3 6v18a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V20l3-6Z" />
      <path d="M17 14c2.4 1.2 4.7 1.8 7 1.8s4.6-.6 7-1.8" />
      <path d="M15 21h18" />
      <path d="M19 28c2.6-2.8 7.1-2.8 10 0" />
      <path d="M19 34c2.6 2.8 7.1 2.8 10 0" />
      <path d="M24 26.8v8.4" />
      <path d="M20 9c2.5 1.4 5.5 1.4 8 0" />
    </svg>
  );
}
const CONTACT = {
  whatsapp: "50765869456",
};

const TECHNICAL_SUPPORT = [
  {
    title: "Estudio de suelo",
    description: "Análisis y recomendaciones para fertilidad y manejo.",
    icon: Sprout,
  },
  {
    title: "Ficha técnica",
    description: "Diagnóstico integral de la finca y plan de acción.",
    icon: ClipboardList,
  },
  {
    title: "Asesoría",
    description: "Acompañamiento técnico personalizado.",
    icon: UserRound,
  },
  {
    title: "Calidad y perfil de taza",
    description: "Evaluación sensorial y mejora continua de la calidad.",
    icon: Coffee,
  },
];

const PRODUCTS = [
  {
    title: "Café robusta",
    description: "Café de calidad, trazable y de origen.",
    icon: CoffeeProductIcon,
  },
  {
    title: "Plantines",
    description: "Material vegetal certificado y de alta productividad.",
    icon: Sprout,
  },
  {
    title: "Insumos",
    description: "Fertilizantes y productos para el manejo del cultivo.",
    icon: Package,
  },
  {
    title: "Lotes especiales",
    description: "Microlotes y cafés con atributos diferenciados.",
    icon: Star,
  },
];

const SERVICE_SECTIONS = [
  {
    eyebrow: "Necesito apoyo técnico",
    description:
      "Soluciones técnicas para mejorar la productividad, la trazabilidad y la calidad de la finca.",
    icon: HandHelping,
    tone: "green",
    cta: "Solicitar orientación técnica",
    items: TECHNICAL_SUPPORT,
    message: "Hola ACARO, me interesa recibir apoyo técnico para mi finca.",
  },
  {
    eyebrow: "Busco café o insumos",
    description:
      "Productos y materiales seleccionados para una caficultura más rentable y sostenible.",
    icon: ShoppingBag,
    tone: "coffee",
    cta: "Consultar disponibilidad",
    items: PRODUCTS,
    message: "Hola ACARO, me interesa consultar por café, plantines o insumos.",
  },
];

function whatsappUrl(message: string) {
  const phone = CONTACT.whatsapp.replace(/[^0-9]/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export default function ServiciosPage() {
  const generalWa = whatsappUrl(
    "Hola ACARO, me gustaría recibir información sobre sus servicios."
  );

  return (
    <PublicLayout className="landing-typography">
      <section className="relative isolate min-h-[calc(100svh-72px)] overflow-hidden bg-[#120c08] text-white">
        <Image
          src="/assets/landing-hero-v2.jpg"
          alt="Productor de café robusta en una finca al atardecer"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(14,18,10,0.94)_0%,rgba(14,18,10,0.78)_36%,rgba(14,18,10,0.28)_70%,rgba(14,18,10,0.1)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-[#120c08] to-transparent" />

        <div className="mx-auto flex min-h-[calc(100svh-72px)] max-w-7xl items-center px-5 py-16 sm:px-8 lg:px-10">
          <ScrollReveal className="w-full max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#e2b86f]">
              Servicios ACARO
            </p>
            <h1 className="mt-4 max-w-4xl font-serif text-4xl font-bold leading-[1.0] tracking-[-0.02em] sm:text-6xl lg:text-[5rem]">
              Acompañamos al productor desde la finca hasta el mercado.
            </h1>
            <div className="mt-8 flex max-w-xl items-center gap-4 text-[#d8cabb]">
              <span className="h-px flex-1 bg-current/70" />
              <Coffee className="h-5 w-5 shrink-0 text-[#C28A3A]" aria-hidden="true" />
              <span className="h-px flex-1 bg-current/70" />
            </div>
            <p className="mt-7 max-w-[48ch] text-base leading-7 text-[#efe9df] sm:text-lg">
              Brindamos soluciones técnicas y comerciales para fortalecer la
              producción de café robusta con calidad, trazabilidad y
              sostenibilidad.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section id="servicios-sec" className="relative overflow-hidden bg-[#faf9f5] px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <div className="absolute -left-20 bottom-0 h-56 w-56 border border-[#d8cabb] opacity-30 [clip-path:polygon(50%_0,60%_35%,100%_50%,60%_65%,50%_100%,40%_65%,0_50%,40%_35%)]" />
        <div className="absolute -right-20 bottom-0 h-56 w-56 border border-[#d8cabb] opacity-30 [clip-path:polygon(50%_0,60%_35%,100%_50%,60%_65%,50%_100%,40%_65%,0_50%,40%_35%)]" />

        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
              {SERVICE_SECTIONS.map((section, index) => {
                const MainIcon = section.icon;
                const isGreen = section.tone === "green";

                return (
                  <div
                    key={section.eyebrow}
                    className={`${index === 1 ? "lg:col-start-3" : ""} rounded-lg border border-[#e6ddd1] bg-white/75 p-4 shadow-[0_22px_70px_rgba(43,23,16,0.08)] backdrop-blur sm:p-6`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <span
                          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${
                            isGreen ? "bg-[#2F5D3A] text-white" : "bg-[#8B4F1F] text-white"
                          }`}
                        >
                          <MainIcon className="h-8 w-8" aria-hidden="true" />
                        </span>
                        <div>
                          <h2
                            className={`font-serif text-2xl font-semibold leading-[1.3] ${
                              isGreen ? "text-[#263b25]" : "text-[#7a431d]"
                            }`}
                          >
                            {section.eyebrow}
                          </h2>
                          <p className="mt-2 max-w-xl text-sm leading-6 text-[#5f5651]">
                            {section.description}
                          </p>
                        </div>
                      </div>
                      <a
                        href={whatsappUrl(section.message)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={section.cta}
                        className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border transition hover:-translate-y-0.5 sm:flex ${
                          isGreen
                            ? "border-[#2F5D3A]/20 text-[#2F5D3A] hover:bg-[#2F5D3A] hover:text-white"
                            : "border-[#8B4F1F]/20 text-[#8B4F1F] hover:bg-[#8B4F1F] hover:text-white"
                        }`}
                      >
                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                      </a>
                    </div>

                    <div className="mt-6 grid overflow-hidden rounded-md border border-[#eee7df] bg-[#fffdf9] sm:grid-cols-2 xl:grid-cols-4">
                      {section.items.map((item) => {
                        const Icon = item.icon;

                        return (
                          <a
                            key={item.title}
                            href={whatsappUrl(`Hola ACARO, me interesa: ${item.title}.`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group min-h-[176px] border-b border-r border-[#eee7df] p-5 text-center transition hover:bg-[#faf4eb] sm:[&:nth-child(2n)]:border-r-0 xl:[&:nth-child(2n)]:border-r xl:[&:nth-child(4n)]:border-r-0 [&:nth-last-child(-n+1)]:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 xl:[&:nth-last-child(-n+4)]:border-b-0"
                          >
                            <Icon
                              className={`mx-auto h-10 w-10 transition group-hover:-translate-y-1 ${
                                isGreen ? "text-[#2F5D3A]" : "text-[#8B4F1F]"
                              }`}
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />
                            <h3 className="mt-5 font-serif text-xl font-semibold leading-[1.3] text-[#2b1710]">
                              {item.title}
                            </h3>
                            <p className="mt-2 text-sm leading-5 text-[#665b55]">
                              {item.description}
                            </p>
                          </a>
                        );
                      })}
                    </div>

                    <a
                      href={whatsappUrl(section.message)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mx-auto mt-6 inline-flex w-full items-center justify-center gap-3 px-4 py-3 text-center text-sm font-bold transition sm:w-auto ${
                        isGreen ? "text-[#2F5D3A] hover:text-[#1f4128]" : "text-[#8B4F1F] hover:text-[#623815]"
                      }`}
                    >
                      {section.cta}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                );
              })}

              <div className="hidden w-px bg-[#d8cabb] lg:col-start-2 lg:row-start-1 lg:block">
                <div className="sticky top-24 flex -translate-x-1/2 items-center justify-center py-28">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d8cabb] bg-[#faf9f5] text-[#8B6A4F]">
                    <Coffee className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal className="mt-10">
            <div className="grid overflow-hidden rounded-lg border border-[#d8cabb] bg-[#fffdf9] shadow-[0_18px_60px_rgba(43,23,16,0.08)] md:grid-cols-[240px_1fr_auto]">
              <div className="relative min-h-[150px]">
                <Image
                  src="/assets/productores-card.jpg"
                  alt="Ramas de café robusta con frutos maduros"
                  fill
                  sizes="(min-width: 768px) 240px, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6 md:p-8">
                <h2 className="font-serif text-2xl font-semibold leading-[1.3] text-[#2b1710]">
                  Hablemos sobre cómo podemos ayudarte
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f5651] sm:text-base">
                  Nuestro equipo está listo para asesorarte y encontrar la mejor
                  solución para tu finca, asociación o negocio.
                </p>
              </div>
              <div className="flex items-center p-6 pt-0 md:p-8">
                <a
                  href={generalWa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-md bg-[#2F4A2B] px-6 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(47,74,43,0.28)] transition hover:-translate-y-0.5 hover:bg-[#243f22] md:w-auto"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  Contactar por WhatsApp
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PublicLayout>
  );
}
