'use client';

import * as React from "react";
import { ArrowDown, ArrowUpRight, MessageCircle } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

const CONTACT = "50765869456";
const wa = (message: string) => `https://wa.me/${CONTACT}?text=${encodeURIComponent(message)}`;

type Service = {
  number: string; title: string; text: string;
  image: string; imageAlt: string; position: string; tone: "earth" | "forest" | "cream" | "coffee";
  keyword: string; fieldNote: string;
};

const TECHNICAL_SERVICES: Service[] = [
  { number: "01", title: "Estudio de suelo", text: "Análisis y recomendaciones para mejorar la fertilidad y el manejo del cultivo.", image: "/assets/servicios-drive/estudio-suelo.jpg", imageAlt: "Inspección técnica de una planta de café en la finca", position: "center 58%", tone: "earth", keyword: "SUELO", fieldNote: "La productividad comienza bajo nuestros pies" },
  { number: "02", title: "Ficha técnica", text: "Diagnóstico integral de la finca y elaboración de un plan de acción.", image: "/assets/servicios-drive/ficha-tecnica.jpg", imageAlt: "Jornada de diagnóstico técnico sobre producción de café", position: "center 50%", tone: "forest", keyword: "PLAN", fieldNote: "Una finca entendida puede avanzar con claridad" },
  { number: "03", title: "Asesoría", text: "Acompañamiento técnico personalizado para fortalecer los procesos productivos.", image: "/assets/servicios-drive/asesoria-campo.jpg", imageAlt: "Equipo técnico brindando asesoría en una finca de café", position: "center 42%", tone: "cream", keyword: "CAMPO", fieldNote: "El conocimiento se vuelve práctica" },
  { number: "04", title: "Calidad y perfil de taza", text: "Evaluación sensorial y mejora continua de la calidad del café.", image: "/assets/servicios-drive/calidad-tostado.jpg", imageAlt: "Proceso de tostado para evaluar la calidad del café", position: "center 48%", tone: "coffee", keyword: "TAZA", fieldNote: "Cada atributo revela el trabajo de la finca" },
];

const COMMERCIAL_SERVICES: Service[] = [
  { number: "01", title: "Café robusta", text: "Café de calidad, trazable y de origen.", image: "/assets/servicios-drive/cafe-robusta.jpg", imageAlt: "Café robusta seco seleccionado en la planta", position: "center 50%", tone: "coffee", keyword: "ORIGEN", fieldNote: "Café con procedencia e identidad" },
  { number: "02", title: "Plantines", text: "Material vegetal certificado y de alta productividad.", image: "/assets/servicios-drive/plantines.jpg", imageAlt: "Planta joven de café robusta en la finca", position: "center 48%", tone: "earth", keyword: "FUTURO", fieldNote: "El potencial de la finca empieza aquí" },
  { number: "03", title: "Insumos", text: "Fertilizantes y productos para el manejo del cultivo.", image: "/assets/servicios-drive/insumos.jpg", imageAlt: "Insumos agrícolas preparados para el manejo del cultivo", position: "center 52%", tone: "forest", keyword: "CULTIVO", fieldNote: "Herramientas para cuidar cada ciclo" },
  { number: "04", title: "Lotes especiales", text: "Microlotes y cafés con atributos diferenciados.", image: "/assets/servicios-drive/lotes-especiales.jpg", imageAlt: "Equipo de empaque para conservar lotes especiales de café", position: "center 48%", tone: "cream", keyword: "ÚNICO", fieldNote: "Hay cafés que merecen una ruta diferente" },
];

type JourneyProps = { id: string; section: string; description: string; kind: string; services: Service[]; cta?: { label: string; message: string } };

function ServiceJourney({ id, section, description, kind, services, cta }: JourneyProps) {
  const journeyRef = React.useRef<HTMLElement>(null);
  const [active, setActive] = React.useState(0);
  const current = services[active];

  React.useEffect(() => {
    const journey = journeyRef.current;
    if (!journey) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let visible = false;
    let lastActive = -1;

    const render = () => {
      frame = 0;
      if (!visible) return;
      const rect = journey.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      const timeline = progress * (services.length - 1);
      const nextActive = Math.min(services.length - 1, Math.round(timeline));
      if (nextActive !== lastActive) { lastActive = nextActive; setActive(nextActive); }

      journey.querySelectorAll<HTMLElement>(".service-journey-image").forEach((image) => {
        const index = Number(image.dataset.imageIndex);
        const distance = Math.abs(index - timeline);
        const opacity = Math.max(0, 1 - distance * 1.35);
        const direction = index % 2 === 0 ? -1 : 1;
        const offset = reduced ? 0 : (index - timeline) * direction * 4.2;
        const scale = reduced ? 1 : 1.075 + Math.min(distance, 1) * 0.045;
        image.style.opacity = opacity.toFixed(3);
        image.style.transform = `translate3d(${offset.toFixed(2)}%, 0, 0) scale(${scale.toFixed(3)})`;
      });
      journey.style.setProperty("--journey-progress", progress.toFixed(4));
      journey.dataset.ready = "true";
    };

    const queue = () => { if (!frame) frame = window.requestAnimationFrame(render); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) queue(); }, { rootMargin: "30% 0px" });
    observer.observe(journey);
    if (reduced) journey.dataset.reduced = "true";
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    queue();
    return () => { observer.disconnect(); window.removeEventListener("scroll", queue); window.removeEventListener("resize", queue); if (frame) window.cancelAnimationFrame(frame); };
  }, [services]);

  return (
    <section ref={journeyRef} id={id} className={`service-journey relative h-[390svh] service-tone-${current.tone}`}>
      <div className="sticky top-0 h-svh overflow-hidden transition-colors duration-700">
        <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:24px_24px]" />
        <p key={`word-${active}`} aria-hidden="true" className="service-journey-word pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-serif text-[clamp(7rem,19vw,18rem)] font-black leading-none tracking-[-0.07em] opacity-[0.055]">{current.keyword}</p>
        <div className="absolute left-5 top-20 z-30 max-w-sm sm:left-8 lg:left-10"><p className="text-[9px] font-bold uppercase tracking-[0.24em] opacity-60">{section}</p><p className="mt-1 hidden text-xs opacity-55 xl:block">{description}</p></div>

        <div className="relative mx-auto grid h-full max-w-7xl items-center gap-8 px-5 pb-16 pt-20 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-10 lg:py-20">
          <div key={active} className="service-journey-copy relative z-20 max-w-xl">
            <div className="flex items-center gap-4"><span className="font-serif text-5xl font-semibold text-current/35 sm:text-6xl">{current.number}</span><span className="h-px w-10 bg-current/30" /><p className="text-[10px] font-bold uppercase tracking-[0.28em] sm:text-xs">{kind}</p></div>
            <h2 className="mt-6 max-w-[12ch] font-serif text-[clamp(2.5rem,5.2vw,4.8rem)] font-bold leading-[0.96] tracking-[-0.035em]">{current.title}</h2>
            <p className="mt-6 max-w-[48ch] text-base leading-7 opacity-80 sm:text-lg sm:leading-8">{current.text}</p>
            {cta && <a href={wa(cta.message)} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-11 items-center gap-3 border border-[#b87931] bg-[#c99645] px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-[#21150d] shadow-[0_10px_24px_rgba(83,48,20,.14)] transition-[background-color,box-shadow,transform] hover:bg-[#b77f38] hover:text-[#21150d] hover:shadow-[0_14px_30px_rgba(83,48,20,.2)] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8b5e2e]"><MessageCircle className="h-4 w-4" />{cta.label}</a>}
          </div>

          <div className="relative z-10 hidden aspect-[4/5] max-h-[70vh] lg:block">
            <div className={`service-journey-frame service-journey-frame-${active} absolute inset-0 overflow-hidden shadow-[0_35px_100px_rgba(18,12,8,.22)]`}>
              {services.map((service, index) => <div key={service.number} data-image-index={index} className="service-journey-image absolute -inset-x-[7%] inset-y-0"><OptimizedImage src={service.image} alt={service.imageAlt} sizes="50vw" style={{ objectPosition: service.position }} className="h-full w-full object-cover" /></div>)}
              <div className="absolute inset-0 ring-1 ring-inset ring-white/15" />
            </div>
            <span aria-hidden="true" className="absolute right-4 top-4 z-30 block h-20 w-20 drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)]">
              <OptimizedImage src="/assets/logos/logo2.png" alt="" className="h-full w-full object-contain" sizes="80px" />
            </span>
            <div className="absolute bottom-4 left-4 z-30 w-[min(78%,24rem)] bg-[#120c08]/88 p-5 text-white shadow-xl backdrop-blur-md"><p className="text-[8px] font-bold uppercase tracking-[0.26em] text-[#e2b86f]">Nota de campo · {current.number}</p><p className="mt-2 font-serif text-base leading-snug">{current.fieldNote}</p></div>
          </div>

          <div className="absolute inset-0 -z-0 lg:hidden">
            {services.map((service, index) => <div key={service.number} data-image-index={index} className="service-journey-image absolute -inset-x-[7%] inset-y-0"><OptimizedImage src={service.image} alt="" sizes="100vw" style={{ objectPosition: service.position }} className="h-full w-full object-cover" /></div>)}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,243,236,.96),rgba(247,243,236,.82))]" />
          </div>
        </div>

        <nav className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2" aria-label="Etapas del servicio">
          {services.map((service, index) => <button key={service.number} type="button" onClick={() => { const journey = journeyRef.current; if (!journey) return; const travel = journey.offsetHeight - window.innerHeight; window.scrollTo({ top: journey.offsetTop + travel * (index / (services.length - 1)), behavior: "smooth" }); }} className={`group flex items-center gap-2 px-1 py-2 text-[9px] font-bold tracking-[0.16em] transition-opacity ${index === active ? "opacity-100" : "opacity-35 hover:opacity-70"}`} aria-current={index === active ? "step" : undefined} aria-label={`Ir a ${service.title}`}><span>{service.number}</span><span className={`hidden h-px transition-all sm:block ${index === active ? "w-10 bg-current" : "w-4 bg-current/50"}`} /></button>)}
        </nav>
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-current/10"><span className="service-journey-progress block h-full bg-current/55" /></div>
      </div>
    </section>
  );
}

export default function ServiciosPage() {
  const generalWa = wa("Hola ACARO, me gustaría recibir información sobre sus servicios.");
  return (
    <PublicLayout className="landing-typography bg-[#0d170d]">
      <section className="relative isolate flex min-h-[calc(100svh-72px)] items-center overflow-hidden bg-[#0d170d] text-center text-white">
        <OptimizedImage src="/assets/servicios-drive/hero-finca.jpg" alt="Recorrido técnico por una finca de café robusta" priority sizes="100vw" className="absolute inset-0 -z-20 h-full w-full scale-105 object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-[#081109]/75" /><div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(8,17,9,.3)_52%,rgba(8,17,9,.8)_100%)]" />
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8"><p className="text-xs font-bold uppercase tracking-[0.42em] text-[#e2b86f]">Servicios ACARO</p><h1 className="mt-7 font-serif text-[clamp(3.2rem,8vw,7rem)] font-bold leading-[0.9] tracking-[-0.04em] text-[#F4E7D0]">Desde la finca<br /><span className="text-[#9fbe64]">hasta la taza.</span></h1><p className="mx-auto mt-8 max-w-xl text-base leading-7 text-white/80 sm:text-xl">Acompañamos cada etapa del café robusta panameño.</p><a href="#recorrido-servicios" className="mx-auto mt-12 inline-flex flex-col items-center gap-3 text-[10px] font-bold uppercase tracking-[0.25em] text-white/60">Descubre el recorrido<ArrowDown className="services-intro-arrow h-5 w-5 text-[#e2b86f]" /></a></div>
      </section>

      <ServiceJourney
        id="recorrido-servicios"
        section="01 · Necesito apoyo técnico"
        description="Asistencia para mejorar productividad, trazabilidad y calidad en la finca."
        kind="Servicio disponible"
        services={TECHNICAL_SERVICES}
        cta={{ label: "Solicitar orientación técnica", message: "Hola ACARO, me interesa solicitar orientación técnica para mi finca." }}
      />

      <section className="relative z-20 overflow-hidden border-y border-white/10 bg-[#354335] px-5 py-20 text-[#f3ecdf] sm:px-8 lg:py-28">
        <span aria-hidden="true" className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-[#C28A3A]/30" />
        <span aria-hidden="true" className="absolute -right-5 -top-16 h-52 w-52 rounded-full border border-white/15" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <p className="relative text-xs font-bold uppercase tracking-[0.28em] text-[#e2b86f]">02 · Busco café o insumos</p>
          <div className="relative"><h2 className="font-serif text-[clamp(2.4rem,5vw,4.6rem)] font-bold leading-[0.98] tracking-[-0.03em] text-[#f3ecdf]">Del manejo del cultivo<br /><span className="text-[#b7cf83]">a lo que necesitas.</span></h2><p className="mt-5 max-w-xl leading-7 text-white/70">Café, plantines e insumos para apoyar el manejo del cultivo.</p></div>
        </div>
      </section>

      <ServiceJourney
        id="cafe-e-insumos"
        section="02 · Busco café o insumos"
        description="Café, plantines e insumos para apoyar el manejo del cultivo."
        kind="Producto disponible"
        services={COMMERCIAL_SERVICES}
      />

      <section className="relative isolate flex min-h-[85svh] items-center overflow-hidden bg-[#22150c] text-center text-white">
        <OptimizedImage src="/assets/servicios-drive/cierre-equipo.jpg" alt="Productores y equipo técnico reunidos en la finca" sizes="100vw" className="absolute inset-0 -z-20 h-full w-full scale-105 object-cover object-center" /><div className="absolute inset-0 -z-10 bg-[#1a1009]/88" />
        <div className="mx-auto max-w-5xl px-5 py-24 sm:px-8"><p className="text-xs font-bold uppercase tracking-[0.32em] text-[#e2b86f]">El próximo paso</p><h2 className="mt-7 font-serif text-[clamp(2.7rem,6vw,5.4rem)] font-bold leading-[0.98] tracking-[-0.035em] text-[#F4E7D0]">Cada finca tiene una historia.<br /><span className="text-[#9fbe64]">Ayudamos a desarrollarla.</span></h2><div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"><a href={wa("Hola ACARO, necesito apoyo técnico para mi finca.")} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-3 rounded-sm bg-[#C99645] px-7 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#21150d]"><MessageCircle className="h-5 w-5" />Apoyo para mi finca</a><a href={generalWa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-3 rounded-sm border border-white/25 px-7 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white">Café, plantines o insumos<ArrowUpRight className="h-4 w-4" /></a></div></div>
      </section>
    </PublicLayout>
  );
}
