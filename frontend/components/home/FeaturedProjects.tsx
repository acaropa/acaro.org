'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/landing/LandingMotion';
import { api } from '@/lib/api';
import { ProyectoRecord, toProjectCard } from '@/lib/projects';
import { Project } from '@/data/mock-projects';
import { cn } from '@/lib/utils';

const FALLBACK_IMAGES = ['/assets/hero-bg.jpg', '/assets/coffee-beans-texture.png'];

const projectStatusLabel = (status: string) => status === 'Planificación' ? 'Planificado' : status;

const projectStatusDot: Record<string, string> = {
  'Planificación': 'bg-[#9ab0c4]',
  'Fase 1 - Piloto': 'bg-[#9ab0c4]',
  'Fase 2 - Ejecución': 'bg-[#d7a24a]',
  'Activo': 'bg-[#86d99c]',
  'En seguimiento': 'bg-[#d7a24a]',
  'Finalizado': 'bg-[#b8a99a]',
};

export function FeaturedProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    api.get<ProyectoRecord[]>('/proyectos')
      .then(data => setProjects(data.slice(0, 2).map(toProjectCard)))
      .catch(() => setProjects([]));
  }, []);

  if (projects.length === 0) return null;

  return (
    <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2">
      {projects.map((project, index) => (
        <ScrollReveal
          key={project.id}
          delay={index * 110}
          className="premium-project group flex flex-col overflow-hidden rounded-xl border border-[#3a2a20] bg-[#1c140d]"
        >
          <Link href={`/proyectos/detalle/?slug=${project.slug || ''}`} className="flex h-full flex-col">
            <div className="relative h-56 overflow-hidden">
              <img
                src={project.imageUrl || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}
                alt=""
                loading="lazy"
                className="h-full w-full scale-100 object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(15,11,7,0.85),transparent_60%)]" />
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-[#f8efe3]/15 bg-[#15100a]/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#f3e8d8] backdrop-blur-sm">
                <span className={cn('h-1.5 w-1.5 rounded-full', projectStatusDot[project.status])} />
                Estado: {projectStatusLabel(project.status)}
              </div>
            </div>
            <div className="flex flex-1 flex-col p-7">
              <h3 className="font-serif text-2xl font-semibold leading-tight text-[#f8efe3]">{project.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-[#b8a99a] line-clamp-3">{project.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-[#3a2a20] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#d7a24a]">{project.category}</span>
                <span className="rounded-full border border-[#3a2a20] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#d8c9bb]">Iniciativa 0{index + 1}</span>
              </div>
            </div>
          </Link>
        </ScrollReveal>
      ))}
    </div>
  );
}
