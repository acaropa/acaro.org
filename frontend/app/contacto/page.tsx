"use client";

import { FormEvent, useState } from "react";
import { Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/landing/LandingMotion";
import { api } from "@/lib/api";

const contactCards = [
  { icon: Mail, label: "Correo", value: "contacto@acaro.org", href: "mailto:contacto@acaro.org" },
  { icon: MapPin, label: "Ubicacion", value: "Republica de Panama" },
  { icon: Phone, label: "Atencion", value: "Coordinacion institucional" },
];

const pathways = [
  "Soy productor y quiero conocer la asociacion",
  "Busco informacion tecnica o documentos",
  "Quiero proponer una alianza o proyecto",
  "Necesito comunicarme con el equipo administrativo",
];

export default function Contacto() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    setError("");
    try {
      await api.post("/contacto", {
        nombre: String(form.get("nombre") || ""),
        correo: String(form.get("correo") || ""),
        asunto: String(form.get("asunto") || ""),
        mensaje: String(form.get("mensaje") || ""),
      });
      event.currentTarget.reset();
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el mensaje");
      setStatus("error");
    }
  }

  return (
    <PublicLayout className="landing-typography">
      <main className="bg-[#faf9f5]">
        <section className="relative isolate overflow-hidden bg-[#120c08] px-5 pb-24 pt-36 text-[#fffaf1] sm:px-8 lg:px-10">
          <div className="absolute inset-0 opacity-25">
            <img src="/assets/landing-hero-v2.jpg" alt="" className="h-full w-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#120c08] via-[#120c08]/80 to-[#120c08]/45" />
          <div className="relative mx-auto max-w-7xl">
            <ScrollReveal className="max-w-3xl" distance="md">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-[#e2b86f]">Contacto ACARO OBC</p>
              <h1 className="font-serif text-5xl font-bold leading-tight sm:text-6xl">Hablemos sobre cafe robusta, comunidad y desarrollo.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#f3e8d8]/85">
                Escriba su consulta al equipo de ACARO OBC. El mensaje se enviara directamente a contacto@acaro.org.
              </p>
            </ScrollReveal>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-10 lg:py-28">
          <ScrollReveal distance="sm">
            <div className="border border-[#d8cabb] bg-white p-8">
              <h2 className="font-serif text-3xl font-semibold text-[#271310]">Canales directos</h2>
              <p className="mt-4 text-base leading-7 text-[#504442]">
                Si no sabe por donde empezar, envie un mensaje general y lo orientaremos.
              </p>
              <div className="mt-8 space-y-4">
                {contactCards.map(card => {
                  const Icon = card.icon;
                  const content = (
                    <span className="flex items-start gap-4 border border-[#d8cabb] bg-[#faf9f5] p-4 transition-colors hover:bg-[#fffaf1]">
                      <Icon className="mt-1 h-5 w-5 shrink-0 text-[#c28a3a]" />
                      <span>
                        <span className="block text-xs font-bold uppercase tracking-widest text-[#8b6a4f]">{card.label}</span>
                        <span className="mt-1 block text-sm font-semibold text-[#271310]">{card.value}</span>
                      </span>
                    </span>
                  );
                  return card.href ? <a key={card.label} href={card.href}>{content}</a> : <div key={card.label}>{content}</div>;
                })}
              </div>
            </div>

            <div className="mt-8 border border-[#d8cabb] bg-[#120c08] p-8 text-white">
              <MessageSquare className="mb-5 h-8 w-8 text-[#d7a24a]" />
              <h3 className="font-serif text-2xl font-semibold">Motivos frecuentes</h3>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-[#d8c9bb]">
                {pathways.map(item => <li key={item}>/ {item}</li>)}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" distance="sm">
            <form onSubmit={submit} className="border border-[#d8cabb] bg-white p-6 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field name="nombre" label="Nombre" placeholder="Su nombre" />
                <Field name="correo" label="Correo" type="email" placeholder="correo@ejemplo.com" />
                <Field name="asunto" label="Asunto" placeholder="Como podemos ayudarle" wide />
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#8b6a4f]">Mensaje</span>
                  <textarea required name="mensaje" rows={7} className="w-full resize-y border border-[#d8cabb] bg-[#faf9f5] px-4 py-3 text-sm text-[#271310] outline-none focus:border-[#271310]" placeholder="Escriba su consulta" />
                </label>
              </div>

              {status === "sent" && <p className="mt-5 border border-[#d8cabb] bg-[#faf9f5] p-3 text-sm font-semibold text-[#2f5d3a]">Mensaje enviado a contacto@acaro.org.</p>}
              {status === "error" && <p className="mt-5 border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

              <button disabled={status === "sending"} type="submit" className="mt-6 inline-flex items-center gap-3 bg-[#271310] px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#120c08] disabled:cursor-wait disabled:opacity-70">
                {status === "sending" ? "Enviando..." : "Enviar mensaje"}
                <Send className="h-4 w-4" />
              </button>
            </form>
          </ScrollReveal>
        </section>
      </main>
    </PublicLayout>
  );
}

function Field({ name, label, placeholder, type = "text", wide = false }: { name: string; label: string; placeholder: string; type?: string; wide?: boolean }) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#8b6a4f]">{label}</span>
      <input required name={name} type={type} className="w-full border border-[#d8cabb] bg-[#faf9f5] px-4 py-3 text-sm text-[#271310] outline-none focus:border-[#271310]" placeholder={placeholder} />
    </label>
  );
}
