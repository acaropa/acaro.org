"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ScrollReveal } from "@/components/landing/LandingMotion";
import { api } from "@/lib/api";
import { ProductorRecord, producerImage } from "@/lib/producers";

export function CommunitySection() {
  const [producers, setProducers] = useState<ProductorRecord[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api
      .get<ProductorRecord[]>("/productores")
      .then(data => setProducers(data.filter(producer => producer.activo).slice(0, 6)))
      .catch(() => setProducers([]));
  }, []);

  useEffect(() => {
    if (producers.length <= 1) return;
    const id = setInterval(() => setCurrent(prev => (prev + 1) % producers.length), 4500);
    return () => clearInterval(id);
  }, [producers.length]);

  return (
    <section className="overflow-hidden bg-[#120c08] py-16 text-white sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl items-center gap-16 px-5 sm:px-8 md:grid md:grid-cols-12 lg:px-10">
        <ScrollReveal className="md:col-span-5" direction="left" distance="lg">
          <h2 className="mb-6 font-serif text-3xl font-bold leading-tight tracking-[-0.025em] sm:mb-8 sm:text-5xl">
            Las personas son el corazon de nuestro trabajo
          </h2>
          <blockquote className="relative mb-12 border-l border-[#ae8d87]/30 pl-10 font-serif text-lg italic leading-8 text-[#c9b5b0]">
            &ldquo;El desarrollo del cafe robusta empieza con productores informados, organizados y acompanados tecnicamente.&rdquo;
            <span className="mt-4 block font-sans not-italic text-sm font-bold uppercase tracking-widest text-white">
              ACARO OBC
            </span>
          </blockquote>
          <Link
            href="/productores"
            className="inline-flex items-center gap-3 bg-white px-8 py-4 text-sm font-semibold text-[#271310] transition-all hover:bg-[#faf9f5]"
          >
            Conocer sus historias
          </Link>
        </ScrollReveal>

        {producers.length > 0 ? (
          <ScrollReveal className="mt-12 md:col-span-6 md:col-start-7 md:mt-0" direction="right" delay={200}>
            <div className="relative min-h-[380px] sm:min-h-[460px]">
              {producers.map((producer, index) => (
                <div
                  key={producer.id}
                  className={`absolute inset-0 flex flex-col justify-center transition-opacity duration-700 ${
                    index === current ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
                    <div className="mx-auto h-52 w-52 shrink-0 overflow-hidden shadow-xl sm:mx-0 sm:h-64 sm:w-64">
                      <img src={producerImage(producer)} alt={producer.nombre} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-center">
                      {producer.descripcion && (
                        <p
                          className="mb-6 text-lg leading-relaxed text-[#c9b5b0] sm:text-xl"
                          style={{ fontFamily: "var(--font-handwritten)" }}
                        >
                          &ldquo;{producer.descripcion}&rdquo;
                        </p>
                      )}
                      <h4 className="font-serif text-xl font-semibold text-white">{producer.nombre}</h4>
                      {(producer.rol || producer.comunidad) && (
                        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#b38f4a]">
                          {[producer.rol, producer.comunidad].filter(Boolean).join(" / ")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {producers.length > 1 && (
              <div className="mt-6 flex justify-start gap-2">
                {producers.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    aria-label={`Productor ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === current ? "w-8 bg-white" : "w-1.5 bg-white/25 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </ScrollReveal>
        ) : (
          <ScrollReveal className="mt-16 md:col-span-6 md:col-start-7 md:mt-0" direction="right" delay={200}>
            <div className="border border-white/10 bg-white/5 p-8">
              <div className="aspect-[4/3] overflow-hidden">
                <img src="/assets/landing-hero-v2.jpg" alt="Productores de cafe robusta en campo" className="h-full w-full object-cover" />
              </div>
              <p className="mt-6 text-lg leading-8 text-[#c9b5b0]">
                Estamos preparando historias reales de productores, tecnicos y comunidades que forman parte de ACARO OBC.
              </p>
              <Link href="/productores" className="mt-6 inline-flex bg-white px-6 py-3 text-sm font-semibold text-[#271310] hover:bg-[#faf9f5]">
                Ver productores
              </Link>
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
