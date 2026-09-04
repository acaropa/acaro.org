"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, Mail, MapPin, Send } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { api } from "@/lib/api";

const motivoTemplates: Record<string, string> = {
  "Soy un productor interesado": "Hola, soy productor de café y me gustaría conocer más sobre la Asociación Café Robusta OBC y los beneficios que ofrece a sus miembros. ¿Cómo puedo unirme o participar?",
  "Represento a una institución": "Estimado equipo de ACARO OBC, represento a una institución y nos gustaría explorar posibilidades de colaboración en el sector cafetalero de Panamá.",
  "Quiero proponer una alianza estratégica": "Estimado equipo de ACARO OBC, me comunico para explorar la posibilidad de establecer una alianza estratégica. Quedo a su disposición para coordinar una reunión.",
  "Asistencia técnica": "Buenos días, necesito información sobre la asistencia técnica disponible para productores de café robusta en Panamá Oeste.",
};

const partners = [
  {
    id: "idiap",
    name: "IDIAP",
    fullName: "Instituto de Innovación Agropecuaria de Panamá",
    logo: "/images/aliados/idiap.svg",
    href: "https://www.idiap.gob.pa/",
    className: "ally-idiap",
  },
  {
    id: "acp",
    name: "ACP",
    fullName: "Autoridad del Canal de Panamá",
    logo: "/images/aliados/acp.png",
    href: "https://pancanal.com/",
    className: "ally-acp",
  },
  {
    id: "natura",
    name: "Fundación Natura",
    fullName: "Fundación Natura Panamá",
    logo: "/images/aliados/fundacion-natura.png",
    href: "https://naturapanama.org/",
    className: "ally-natura",
  },
  {
    id: "fao",
    name: "FAO",
    fullName: "Organización de las Naciones Unidas para la Alimentación y la Agricultura",
    logo: "/images/aliados/fao.svg",
    href: "https://www.fao.org/",
    className: "ally-fao",
  },
  {
    id: "promecafe",
    name: "PROMECAFE",
    fullName: "Programa Cooperativo Regional para el Desarrollo Tecnológico y Modernización de la Caficultura",
    logo: "/images/aliados/promecafe.png",
    href: "https://promecafe.net/",
    className: "ally-promecafe",
  },
  {
    id: "mida",
    name: "MIDA",
    fullName: "Ministerio de Desarrollo Agropecuario de Panamá",
    logo: "/images/aliados/mida.png",
    href: "https://mida.gob.pa/",
    className: "ally-mida",
  },
] as const;

type FieldErrors = { nombre?: string; correo?: string; mensaje?: string }

export default function Contacto() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  function onMotivoChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const template = motivoTemplates[e.target.value];
    if (template) setMensaje(template);
    else setMensaje("");
  }

  function validateFields(nombre: string, correo: string, mensajeVal: string): FieldErrors {
    const errors: FieldErrors = {};
    if (!nombre.trim()) errors.nombre = "El nombre es obligatorio.";
    if (!correo.trim()) {
      errors.correo = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      errors.correo = "Ingresa un correo electrónico válido.";
    }
    if (!mensajeVal.trim()) errors.mensaje = "El mensaje es obligatorio.";
    else if (mensajeVal.trim().length < 15) errors.mensaje = "El mensaje debe tener al menos 15 caracteres.";
    return errors;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nombre = String(form.get("nombre") || "");
    const correo = String(form.get("correo") || "");

    const errors = validateFields(nombre, correo, mensaje);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setStatus("sending");
    setErrorMsg("");
    try {
      await api.post("/contacto", {
        nombre,
        correo,
        asunto: String(form.get("motivo") || ""),
        mensaje,
      });
      formRef.current?.reset();
      setMensaje("");
      setStatus("sent");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "No se pudo enviar el mensaje");
      setStatus("error");
    }
  }

  return (
    <PublicLayout className="landing-typography">
      <div className="overflow-x-clip bg-[#faf9f5]">
        <main className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

          {/* Hero */}
          <header className="relative max-w-4xl pb-14 pt-20 md:pb-20 md:pt-28">
            <Image src="/assets/logos/logo1.png" alt="" aria-hidden="true" width={384} height={384} className="pointer-events-none absolute -right-28 -top-4 h-72 w-72 select-none object-contain opacity-[0.12] md:-right-40 md:h-96 md:w-96" />
            <p className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-[#c28a3a]">Hablemos hoy</p>
            <h1 className="mb-7 font-serif text-4xl font-bold leading-tight text-[#120c08] sm:text-6xl">
              Hablemos de oportunidades para crecer juntos.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-[#504442]">
              Si eres productor, institución o aliado potencial, escríbenos para conversar sobre proyectos, asistencia técnica o colaboración en torno al café robusta.
            </p>
          </header>

          <div className="mb-20 h-px bg-[#8b6a4f]/15" />

          {/* Main Grid */}
          <section className="mb-32 grid grid-cols-1 gap-8 lg:grid-cols-12">

            {/* Left Column */}
            <div className="flex flex-col gap-10 lg:col-span-7">

              {/* Form */}
              <div className="rounded border border-[#d8cabb]/50 bg-white p-8 md:p-12">
                <h2 className="mb-8 font-serif text-2xl font-semibold text-[#120c08]">Consulta institucional</h2>
                <form ref={formRef} onSubmit={submit} className="space-y-8">
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <UnderlineField name="nombre" label="Nombre completo" placeholder="Juan Pérez" error={fieldErrors.nombre} />
                    <UnderlineField name="correo" label="Correo electrónico" placeholder="juan@ejemplo.com" type="email" error={fieldErrors.correo} />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#8b6a4f]">Motivo de contacto</label>
                    <select
                      name="motivo"
                      onChange={onMotivoChange}
                      className="w-full cursor-pointer appearance-none border-b border-[#d8cabb] bg-transparent px-0 py-2 text-sm text-[#271310] outline-none transition-colors focus:border-[#271310]"
                    >
                      <option>Soy un productor interesado</option>
                      <option>Represento a una institución</option>
                      <option>Quiero proponer una alianza estratégica</option>
                      <option>Asistencia técnica</option>
                      <option>Otros</option>
                    </select>
                  </div>
                  <div>
                     <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#8b6a4f]">Mensaje</label>
                     <textarea
                       name="mensaje"
                       rows={4}
                       value={mensaje}
                       onChange={e => { setMensaje(e.target.value); if (fieldErrors.mensaje) setFieldErrors(prev => ({ ...prev, mensaje: undefined })); }}
                       placeholder="Cuéntanos cómo podemos colaborar..."
                       className={`w-full resize-none border-b bg-transparent px-0 py-2 text-sm text-[#271310] outline-none transition-colors focus:border-[#271310] ${fieldErrors.mensaje ? "border-red-500" : "border-[#d8cabb]"}`}
                     />
                     {fieldErrors.mensaje && (
                       <p className="mt-1.5 text-xs font-medium text-red-600">{fieldErrors.mensaje}</p>
                     )}
                   </div>

                  {status === "sent" && (
                    <p className="text-sm font-semibold text-[#2f5d3a]">Mensaje enviado a contacto@acaro.org.</p>
                  )}
                  {status === "error" && (
                    <p className="text-sm font-semibold text-red-700">{errorMsg}</p>
                  )}

                  <button
                    disabled={status === "sending"}
                    type="submit"
                    className="flex items-center gap-3 bg-[#271310] px-10 py-4 text-xs font-bold uppercase tracking-widest text-[#fffaf1] transition-all hover:bg-[#120c08] disabled:cursor-wait disabled:opacity-70"
                  >
                    {status === "sending" ? "Enviando..." : "Enviar mensaje"}
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>

              {/* Contact Cards */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <a
                  href="mailto:contacto@acaro.org"
                  className="group flex items-center justify-between rounded border border-[#d8cabb]/30 bg-[#f5f2ea] p-6 transition-all hover:border-[#271310]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#271310]/10">
                      <Mail className="h-5 w-5 text-[#271310]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#271310]">Correo directo</p>
                      <p className="mt-0.5 text-xs text-[#8b6a4f]">contacto@acaro.org</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#8b6a4f] opacity-50 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                </a>
                <div className="flex items-center justify-between rounded border border-[#d8cabb]/30 bg-[#f5f2ea] p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#c28a3a]/15">
                      <MapPin className="h-5 w-5 text-[#c28a3a]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#271310]">Ubicación</p>
                      <p className="mt-0.5 text-xs text-[#8b6a4f]">República de Panamá</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6 lg:col-span-5">

              {/* Alliance Card */}
              <div className="flex flex-col rounded bg-[#120c08] p-8 text-[#fffaf1] md:p-10">
                <p className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-[#c28a3a]">Alianzas institucionales</p>
                <h3 className="mb-5 font-serif text-2xl font-semibold">Trabajemos por el desarrollo rural.</h3>
                <p className="mb-8 text-sm leading-relaxed text-[#d8c9bb]">
                  Coordinamos con instituciones y aliados para fortalecer infraestructura, formación y acompañamiento técnico.
                </p>
                <a
                  href="mailto:contacto@acaro.org?subject=Propuesta%20de%20alianza%20-%20ACARO%20OBC"
                  className="group mt-auto flex items-center justify-between border border-[#fffaf1]/25 px-8 py-3 text-xs font-bold uppercase tracking-widest text-[#fffaf1] transition-all hover:bg-[#fffaf1] hover:text-[#120c08]"
                >
                  Proponer una alianza
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>

              {/* Territorial presence */}
              <div className="flex flex-grow flex-col overflow-hidden rounded border border-[#d8cabb]/30 bg-[#e9e8e4]">
                <div className="border-b border-[#d8cabb]/20 p-5">
                  <h4 className="text-sm font-bold text-[#120c08]">Presencia territorial</h4>
                  <p className="mt-0.5 text-xs text-[#8b6a4f]">Panamá Oeste, República de Panamá</p>
                </div>
                <div className="relative min-h-64 overflow-hidden bg-[#d9ddd1] p-6">
                  <div className="absolute inset-0 opacity-70" aria-hidden="true">
                    <div className="absolute left-[8%] top-[20%] h-28 w-40 rounded-[48%] border border-[#8b6a4f]/25 bg-[#f5f2ea]/55" />
                    <div className="absolute right-[10%] top-[14%] h-36 w-48 rounded-[46%] border border-[#2f5d3a]/20 bg-[#e7ecd8]/70" />
                    <div className="absolute bottom-[8%] left-[22%] h-24 w-56 rounded-[50%] border border-[#c28a3a]/25 bg-[#fffaf1]/45" />
                    <div className="absolute inset-x-[-12%] top-[52%] h-px rotate-[-10deg] bg-[#8b6a4f]/30" />
                    <div className="absolute inset-y-[-12%] left-[48%] w-px rotate-[18deg] bg-[#8b6a4f]/20" />
                  </div>

                  <div className="relative z-10 flex min-h-52 flex-col justify-between">
                    <div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#2f5d3a]/20 bg-[#faf9f5]/85 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#2f5d3a]">
                        <MapPin className="h-3.5 w-3.5" />
                        Panama Oeste
                      </span>
                      <p className="mt-5 max-w-xs font-serif text-2xl font-semibold leading-tight text-[#120c08]">
                        Productores, aliados y proyectos conectados al territorio.
                      </p>
                    </div>

                    <div className="mt-8 grid gap-3 text-xs font-semibold text-[#271310] sm:grid-cols-3">
                      {["Capira", "La Chorrera", "Arraijan"].map((place) => (
                        <span key={place} className="border border-[#8b6a4f]/20 bg-[#faf9f5]/80 px-3 py-2">
                          {place}
                        </span>
                      ))}
                    </div>

                    <a
                      href="/mapa"
                      className="group mt-6 inline-flex w-fit items-center gap-2 border border-[#271310]/20 bg-[#271310] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#fffaf1] transition-all hover:bg-[#120c08]"
                    >
                      Ver mapa territorial
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <AlliesPathSection />

          {/* Quote */}
          <div className="mx-auto max-w-2xl pb-24 text-center">
            <p className="mb-4 font-serif text-xl font-semibold italic text-[#8b6a4f]">
              &ldquo;Cada conversación puede abrir una nueva oportunidad.&rdquo;
            </p>
            <div className="mx-auto h-px w-24 bg-[#8b6a4f]/20" />
          </div>

        </main>
      </div>
    </PublicLayout>
  );
}

function AlliesPathSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activePartner, setActivePartner] = useState<string | null>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      const frame = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-10% 0px", threshold: 0.28 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="aliados-heading"
      className={`allies-section pb-32 text-center ${isVisible ? "is-visible" : ""}`}
    >
      <p id="aliados-heading" className="mb-5 block text-xs font-bold uppercase tracking-[0.2em] text-[#8b6a4f]/60">
        Aliados en el camino
      </p>
      <p className="mx-auto mb-14 max-w-2xl font-serif text-2xl font-semibold leading-snug text-[#271310] md:text-3xl">
        Aliados que aportan experiencia, cooperación y respaldo al café robusta panameño.
      </p>

      <div className="relative mx-auto hidden min-h-[380px] max-w-6xl md:block" onMouseLeave={() => setActivePartner(null)}>
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 1100 380" aria-hidden="true">
          <path className="allies-path-shadow" d="M72 218 C 194 88, 310 94, 420 184 S 640 302, 748 142 S 949 76, 1034 210" />
          <path className="allies-path" pathLength={1} d="M72 218 C 194 88, 310 94, 420 184 S 640 302, 748 142 S 949 76, 1034 210" />
        </svg>

        {partners.map((partner, index) => (
          <a
            key={partner.id}
            href={partner.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visitar el sitio oficial de ${partner.fullName}`}
            onMouseEnter={() => setActivePartner(partner.id)}
            onFocus={() => setActivePartner(partner.id)}
            onBlur={() => setActivePartner(null)}
            className={`ally-logo ${partner.className} ${activePartner === partner.id ? "is-active" : ""} ${activePartner && activePartner !== partner.id ? "is-dimmed" : ""}`}
            style={{ transitionDelay: `${220 + index * 120}ms` }}
          >
            <span className="ally-spotlight" aria-hidden="true" />
            <span className="ally-node" aria-hidden="true" />
            <Image src={partner.logo} alt={partner.fullName} width={190} height={82} className="relative z-10 h-full w-full object-contain" />
            <span className="sr-only">{partner.name}</span>
          </a>
        ))}
      </div>

      <div className="relative mx-auto grid max-w-md gap-7 pl-8 text-left md:hidden">
        <span className="mobile-path" aria-hidden="true" />
        {partners.map((partner, index) => (
          <a
            key={partner.id}
            href={partner.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visitar el sitio oficial de ${partner.fullName}`}
            className="mobile-ally"
            style={{ transitionDelay: `${180 + index * 95}ms` }}
          >
            <span className="mobile-node" aria-hidden="true" />
            <Image src={partner.logo} alt={partner.fullName} width={170} height={74} className="h-14 w-36 object-contain" />
          </a>
        ))}
      </div>

      <style jsx>{`
        .allies-section {
          --earth: #8b5a2b;
          --leaf: #2f5d3a;
          --line: rgba(139, 106, 79, 0.38);
        }

        .allies-path-shadow,
        .allies-path {
          fill: none;
          stroke-linecap: round;
        }

        .allies-path-shadow {
          stroke: rgba(194, 138, 58, 0.12);
          stroke-width: 16;
        }

        .allies-path {
          stroke: var(--line);
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          stroke-width: 2;
          transition: stroke-dashoffset 1800ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .is-visible .allies-path {
          stroke-dashoffset: 0;
        }

        .ally-logo {
          align-items: center;
          background: rgba(250, 249, 245, 0.74);
          border: 1px solid rgba(216, 202, 187, 0.72);
          display: flex;
          height: 76px;
          justify-content: center;
          opacity: 0;
          padding: 14px 18px;
          position: absolute;
          transform: translateY(14px) scale(0.96);
          transition: opacity 600ms ease, filter 600ms ease, transform 600ms ease, border-color 600ms ease, background-color 600ms ease;
          width: 170px;
        }

        .is-visible .ally-logo {
          filter: grayscale(0.2);
          opacity: 0.88;
          transform: translateY(0) scale(1);
        }

        .ally-logo.is-active,
        .ally-logo:focus-visible {
          background: rgba(255, 252, 244, 0.96);
          border-color: rgba(139, 90, 43, 0.38);
          filter: grayscale(0);
          opacity: 1;
          outline: none;
          transform: translateY(-6px) scale(1.07);
          z-index: 5;
        }

        .ally-logo.is-dimmed {
          filter: grayscale(1);
          opacity: 0.35;
          transform: translateY(0) scale(0.98);
        }

        .ally-spotlight {
          background: radial-gradient(circle, rgba(194, 138, 58, 0.22), rgba(194, 138, 58, 0));
          inset: -42px;
          opacity: 0;
          pointer-events: none;
          position: absolute;
          transition: opacity 500ms ease;
        }

        .ally-logo.is-active .ally-spotlight,
        .ally-logo:focus-visible .ally-spotlight {
          opacity: 1;
        }

        .ally-node {
          background: #faf9f5;
          border: 1px solid rgba(139, 106, 79, 0.45);
          border-radius: 999px;
          bottom: -22px;
          box-shadow: 0 0 0 6px rgba(250, 249, 245, 0.82);
          height: 12px;
          left: 50%;
          position: absolute;
          transform: translateX(-50%);
          transition: background-color 500ms ease, border-color 500ms ease, transform 500ms ease;
          width: 12px;
          z-index: 3;
        }

        .ally-logo.is-active .ally-node,
        .ally-logo:focus-visible .ally-node {
          background: var(--leaf);
          border-color: var(--leaf);
          transform: translateX(-50%) scale(1.35);
        }

        .ally-idiap { left: 2%; top: 48%; }
        .ally-acp { left: 15%; top: 8%; }
        .ally-natura { left: 33%; top: 32%; }
        .ally-fao { left: 55%; top: 58%; }
        .ally-promecafe { left: 58%; top: 10%; }
        .ally-mida { left: 76%; top: 44%; }


        .mobile-path {
          background: linear-gradient(180deg, rgba(139, 106, 79, 0), rgba(139, 106, 79, 0.45), rgba(139, 106, 79, 0));
          bottom: 12px;
          left: 9px;
          position: absolute;
          top: 12px;
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 1400ms cubic-bezier(0.22, 1, 0.36, 1);
          width: 1px;
        }

        .is-visible .mobile-path {
          transform: scaleY(1);
        }

        .mobile-ally {
          align-items: center;
          background: rgba(255, 252, 244, 0.68);
          border: 1px solid rgba(216, 202, 187, 0.68);
          display: flex;
          min-height: 82px;
          opacity: 0;
          padding: 13px 18px;
          position: relative;
          transform: translateY(12px);
          transition: opacity 520ms ease, filter 520ms ease, transform 520ms ease, border-color 520ms ease;
        }

        .is-visible .mobile-ally {
          filter: grayscale(0.16);
          opacity: 0.94;
          transform: translateY(0);
        }

        .mobile-ally:focus-visible,
        .mobile-ally:hover {
          border-color: rgba(139, 90, 43, 0.42);
          filter: grayscale(0);
          outline: none;
          transform: translateX(4px) scale(1.02);
        }

        .mobile-node {
          background: #faf9f5;
          border: 1px solid rgba(139, 106, 79, 0.45);
          border-radius: 999px;
          height: 13px;
          left: -30px;
          position: absolute;
          top: 34px;
          transition: background-color 420ms ease, transform 420ms ease;
          width: 13px;
        }

        .mobile-ally:focus-visible .mobile-node,
        .mobile-ally:hover .mobile-node {
          background: var(--leaf);
          transform: scale(1.24);
        }

        @media (prefers-reduced-motion: reduce) {
          .allies-path,
          .mobile-path,
          .ally-logo,
          .mobile-ally,
          .ally-node,
          .mobile-node,
          .ally-spotlight {
            transition: none;
          }

          .allies-path {
            stroke-dashoffset: 0;
          }

          .mobile-path {
            transform: scaleY(1);
          }

          .ally-logo,
          .mobile-ally {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}

function UnderlineField({ name, label, placeholder, type = "text", error }: {
  name: string; label: string; placeholder: string; type?: string; error?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#8b6a4f]">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className={`w-full border-b bg-transparent px-0 py-2 text-sm text-[#271310] outline-none transition-colors focus:border-[#271310] ${error ? "border-red-500" : "border-[#d8cabb]"}`}
      />
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}
