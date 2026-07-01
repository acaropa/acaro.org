"use client";

import { FormEvent, useRef, useState } from "react";
import { ArrowRight, Mail, MapPin, Send } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { api } from "@/lib/api";

const motivoTemplates: Record<string, string> = {
  "Soy un productor interesado": "Hola, soy productor de café y me gustaría conocer más sobre la Asociación Café Robusta OBC y los beneficios que ofrece a sus miembros. ¿Cómo puedo unirme o participar?",
  "Represento a una institución": "Estimado equipo de ACARO OBC, represento a una institución y nos gustaría explorar posibilidades de colaboración en el sector cafetalero de Panamá.",
  "Quiero proponer una alianza estratégica": "Estimado equipo de ACARO OBC, me comunico para explorar la posibilidad de establecer una alianza estratégica. Quedo a su disposición para coordinar una reunión.",
  "Asistencia técnica": "Buenos días, necesito información sobre la asistencia técnica disponible para productores de café robusta en Panamá Oeste.",
};

const partners = ["IDIAP", "ACP", "FUNDACIÓN NATURA", "FAO", "PROMECAFE", "MIDA", "SENACYT"];

export default function Contacto() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [mensaje, setMensaje] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  function onMotivoChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const template = motivoTemplates[e.target.value];
    if (template) setMensaje(template);
    else setMensaje("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    setErrorMsg("");
    try {
      await api.post("/contacto", {
        nombre: String(form.get("nombre") || ""),
        correo: String(form.get("correo") || ""),
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
      <div className="bg-[#faf9f5]">
        <main className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

          {/* Hero */}
          <header className="relative max-w-4xl pb-14 pt-20 md:pb-20 md:pt-28">
            <img src="/assets/logos/logo1.png" alt="" aria-hidden="true" className="pointer-events-none absolute -right-28 -top-4 h-72 w-72 select-none object-contain opacity-[0.12] md:-right-40 md:h-96 md:w-96" />
            <p className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-[#c28a3a]">Hablemos hoy</p>
            <h1 className="mb-7 font-serif text-4xl font-bold leading-tight text-[#120c08] sm:text-6xl">
              Hablemos de oportunidades para crecer juntos.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-[#504442]">
              Nuestra red se fortalece con cada nueva conexión. Si eres productor, institución o aliado potencial, este es el punto de inicio para transformar el futuro del café robusta.
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
                    <UnderlineField name="nombre" label="Nombre completo" placeholder="Juan Pérez" />
                    <UnderlineField name="correo" label="Correo electrónico" placeholder="juan@ejemplo.com" type="email" />
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
                      required
                      name="mensaje"
                      rows={4}
                      value={mensaje}
                      onChange={e => setMensaje(e.target.value)}
                      placeholder="Cuéntanos cómo podemos colaborar..."
                      className="w-full resize-none border-b border-[#d8cabb] bg-transparent px-0 py-2 text-sm text-[#271310] outline-none transition-colors focus:border-[#271310]"
                    />
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
                    {status === "sending" ? "Enviando..." : "Enviar Mensaje"}
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
<p className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-[#c28a3a]">Alianzas de Alto Impacto</p>
                <h3 className="mb-5 font-serif text-2xl font-semibold">Impulsa el desarrollo rural con nosotros.</h3>
                <p className="mb-8 text-sm leading-relaxed text-[#d8c9bb]">
                  Buscamos socios corporativos e institucionales para expandir la infraestructura de procesamiento y programas de educación agrícola.
                </p>
                <a
                  href="mailto:contacto@acaro.org?subject=Propuesta%20de%20alianza%20-%20ACARO%20OBC"
                  className="group mt-auto flex items-center justify-between border border-[#fffaf1]/25 px-8 py-3 text-xs font-bold uppercase tracking-widest text-[#fffaf1] transition-all hover:bg-[#fffaf1] hover:text-[#120c08]"
                >
                  Proponer una alianza
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>

              {/* Map */}
              <div className="flex flex-grow flex-col overflow-hidden rounded border border-[#d8cabb]/30 bg-[#e9e8e4]">
                <div className="border-b border-[#d8cabb]/20 p-5">
                  <h4 className="text-sm font-bold text-[#120c08]">Puntos de Conexión</h4>
                  <p className="mt-0.5 text-xs text-[#8b6a4f]">Panamá Oeste: Nuestra presencia territorial</p>
                </div>
                <div className="relative h-56 w-full overflow-hidden grayscale transition-all duration-700 hover:grayscale-0 md:h-64">
                  <iframe
                    src="https://maps.google.com/maps?q=Panama+Oeste,+Panama&t=&z=10&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Panamá Oeste"
                    className="h-full w-full"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Partners */}
          <section className="pb-32 text-center">
            <p className="mb-12 block text-xs font-bold uppercase tracking-[0.2em] text-[#8b6a4f]/60">Aliados en el camino</p>
            <div className="flex flex-wrap items-center justify-center gap-14 opacity-40 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">
              {partners.map(name => (
                <div key={name} className="flex h-8 w-32 items-center justify-center rounded-full bg-[#504442]/20 text-xs font-bold text-[#504442]">
                  {name}
                </div>
              ))}
            </div>
          </section>

          {/* Quote */}
          <div className="mx-auto max-w-2xl pb-24 text-center">
            <p className="mb-4 font-serif text-xl font-semibold italic text-[#8b6a4f]">
              "Cada conversación puede abrir una nueva oportunidad."
            </p>
            <div className="mx-auto h-px w-24 bg-[#8b6a4f]/20" />
          </div>

        </main>
      </div>
    </PublicLayout>
  );
}

function UnderlineField({ name, label, placeholder, type = "text" }: {
  name: string; label: string; placeholder: string; type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#8b6a4f]">{label}</label>
      <input
        required
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full border-b border-[#d8cabb] bg-transparent px-0 py-2 text-sm text-[#271310] outline-none transition-colors focus:border-[#271310]"
      />
    </div>
  );
}
