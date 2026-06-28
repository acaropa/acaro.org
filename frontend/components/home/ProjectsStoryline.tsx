'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/LandingMotion';
import { api, apiAssetUrl } from '@/lib/api';
import { ProyectoRecord } from '@/lib/projects';

const FALLBACK = '/assets/hero-bg.jpg';

export function ProjectsStoryline() {
  const [projects, setProjects] = useState<ProyectoRecord[]>([]);

  useEffect(() => {
    api.get<ProyectoRecord[]>('/proyectos')
      .then(data => setProjects(data.slice(0, 2)))
      .catch(() => setProjects([]));
  }, []);

  if (projects.length === 0) {
    return (
      <ScrollReveal>
        <div className="grid grid-cols-1 items-center gap-10 border border-[#d8cabb] bg-[#faf9f5] p-8 md:grid-cols-12 md:p-10">
          <div className="md:col-span-7">
            <div className="aspect-[16/10] overflow-hidden">
              <img src="/assets/landing-hero-v2.jpg" alt="Cultivo de cafe robusta" className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="md:col-span-5">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#1b6d24]">Proximas iniciativas</span>
            <h3 className="mb-4 font-serif text-3xl font-bold text-[#271310]">Estamos documentando nuevos proyectos productivos.</h3>
            <p className="mb-8 text-base leading-7 text-[#504442]">
              Las iniciativas publicas apareceran aqui cuando sean aprobadas por el equipo de ACARO OBC.
            </p>
            <Link href="/proyectos" className="inline-block bg-[#271310] px-6 py-3 text-sm font-semibold text-white hover:bg-[#120c08]">
              Explorar proyectos
            </Link>
          </div>
        </div>
      </ScrollReveal>
    );
  }

  return (
    <div className="space-y-24">
        {projects.map((project, index) => {
          const isReversed = index % 2 === 1;
          const rawImg = project.imagen_portada;
          const imageUrl = rawImg?.startsWith('/assets/')
            ? rawImg
            : (apiAssetUrl(rawImg) || FALLBACK);

          return (
            <ScrollReveal key={project.id} delay={index * 100}>
              <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-12">

                {/* Image column */}
                <div className={`relative h-[500px] md:col-span-7 ${isReversed ? 'md:order-2' : ''}`}>
                  <div className="h-full w-full overflow-hidden rounded-sm shadow-sm">
                    <img
                      src={imageUrl}
                      alt={project.nombre}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                {/* Content column */}
                <div className={`md:col-span-5 ${isReversed ? 'md:order-1' : ''}`}>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#271310]">
                    {project.clasificacion || 'Proyecto'}
                  </span>
                  <h3 className="mb-4 font-serif text-2xl font-bold text-[#271310]">
                    {project.nombre}
                  </h3>
                  {project.descripcion && (
                    <p className="mb-8 text-base leading-7 text-[#504442]">
                      {project.descripcion}
                    </p>
                  )}
                  {project.fases && project.fases.length > 0 && (
                    <ul className="mb-8 space-y-3">
                      {project.fases.slice(0, 2).map(fase => (
                        <li key={fase.id} className="flex items-center gap-3 text-base text-[#271310]">
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#271310]" />
                          {fase.nombre}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link
                    href={`/proyectos/detalle/?slug=${project.slug}`}
                    className="inline-block bg-[#271310] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#120c08]"
                  >
                    Leer Historia Completa
                  </Link>
                </div>

              </div>
            </ScrollReveal>
          );
        })}
    </div>
  );
}
