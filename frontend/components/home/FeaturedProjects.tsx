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
            <div className="h-56 overflow-hidden">
              <img
                src={project.imageUrl || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-all duration-500"
              />
            </div>
            <div className="flex flex-1 flex-col p-7">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-serif text-[14px] font-medium leading-none text-[#d7a24a]/70">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="rounded-full border border-[#3a2a20] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#d7a24a]">{project.category}</span>
              </div>
              <h3 className="font-serif text-2xl font-semibold leading-tight text-[#f8efe3] mb-3">{project.title}</h3>
              <p className="flex-1 text-sm leading-6 text-[#b8a99a] line-clamp-3 mb-6">{project.description}</p>

              {project.progress != null && (
                <div className="mb-6">
                  <div className="mb-2 h-[6px] w-full overflow-hidden rounded-full bg-[#160d08]">
                    <div
                      className="h-full rounded-full bg-[#d7a24a]"
                      style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                    />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#b8a99a]">
                    {project.progress}% completado
                  </p>
                </div>
              )}

              <div className="mb-4 h-[1px] bg-[#3a2a20]" />
              <div className="flex items-center justify-between text-[12px] font-semibold uppercase tracking-[0.1em] leading-none text-[#f3e8d8]/80">
                <span className="flex items-center gap-2">
                  <span className={cn('h-1.5 w-1.5 rounded-full', projectStatusDot[project.status])} />
                  Estado: {projectStatusLabel(project.status)}
                </span>
              </div>
            </div>
          </Link>
        </ScrollReveal>
      ))}
    </div>
  );
}
