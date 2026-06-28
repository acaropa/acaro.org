'use client';

import { AppIcon } from "@/components/ui/AppIcon"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ScrollReveal } from '@/components/landing/LandingMotion';
import { EmptyState } from '@/components/ui/EmptyState';
import { Project } from '@/data/mock-projects';
import { api } from '@/lib/api';
import { ProyectoRecord, toProjectCard } from '@/lib/projects';

// 1. Hero Right (Texto Izquierda, Imagen Derecha, 12 columnas)
function HeroRightProject({ project, index }: { project: Project, index: number }) {
  return (
    <ScrollReveal delay={0} distance="md" className="md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-[24px] mb-8">
      <div className="md:col-span-3 flex flex-col justify-between order-2 md:order-1 pt-8 md:pt-0">
        <div>
          <span className="font-serif text-[14px] font-medium leading-none text-primary/60 mb-4 block">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="inline-block bg-accent text-primary-foreground px-3 py-1 text-[12px] font-semibold tracking-[0.1em] leading-none mb-6 rounded-none uppercase">
            {project.category}
          </div>
          <h2 className="font-serif text-[32px] font-semibold leading-[1.2] text-primary mb-4">{project.title}</h2>
          <p className="text-[16px] leading-[1.6] text-muted mb-8">{project.description}</p>
        </div>
        <Link href={`/proyectos/detalle/?slug=${project.slug || ''}`} className="self-start border border-primary text-primary px-6 py-3 text-[12px] font-semibold tracking-[0.1em] leading-none hover:bg-primary hover:text-primary-foreground transition-colors duration-300 rounded-none uppercase">
          Ver Detalles
        </Link>
      </div>
      <div className="md:col-span-9 order-1 md:order-2">
        <div className="w-full h-[600px] bg-surface relative overflow-hidden">
          {project.imageUrl && (
            <img alt={project.title} loading="lazy" className="w-full h-full object-cover" src={project.imageUrl} />
          )}
        </div>
      </div>
    </ScrollReveal>
  );
}

// 2. Hero Left (Imagen Izquierda, Texto Derecha, 12 columnas)
function HeroLeftProject({ project, index }: { project: Project, index: number }) {
  return (
    <ScrollReveal delay={0} distance="md" className="md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-[24px] mb-8">
      <div className="md:col-span-9 order-1 md:order-1">
        <div className="w-full h-[600px] bg-surface relative overflow-hidden">
          {project.imageUrl && (
            <img alt={project.title} loading="lazy" className="w-full h-full object-cover" src={project.imageUrl} />
          )}
        </div>
      </div>
      <div className="md:col-span-3 flex flex-col justify-between order-2 md:order-2 pt-8 md:pt-0">
        <div>
          <span className="font-serif text-[14px] font-medium leading-none text-primary/60 mb-4 block text-right">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="flex justify-end">
            <div className="inline-block bg-accent text-primary-foreground px-3 py-1 text-[12px] font-semibold tracking-[0.1em] leading-none mb-6 rounded-none uppercase">
              {project.category}
            </div>
          </div>
          <h2 className="font-serif text-[32px] font-semibold leading-[1.2] text-primary mb-4 text-right">{project.title}</h2>
          <p className="text-[16px] leading-[1.6] text-muted mb-8 text-right">{project.description}</p>
        </div>
        <Link href={`/proyectos/detalle/?slug=${project.slug || ''}`} className="self-end border border-primary text-primary px-6 py-3 text-[12px] font-semibold tracking-[0.1em] leading-none hover:bg-primary hover:text-primary-foreground transition-colors duration-300 rounded-none uppercase">
          Ver Detalles
        </Link>
      </div>
    </ScrollReveal>
  );
}

// 3. Wide Card (Tarjeta ancha horizontal, 8 columnas)
function WideProject({ project, index }: { project: Project, index: number }) {
  return (
    <ScrollReveal delay={100} distance="sm" className="md:col-span-8 flex flex-col md:flex-row bg-surface overflow-hidden mb-8 group">
      <Link href={`/proyectos/detalle/?slug=${project.slug || ''}`} className="flex flex-col md:flex-row w-full h-full">
      <div className="md:w-1/2 h-80 md:h-auto relative">
        {project.imageUrl && (
          <img
            alt={project.title}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-500"
            src={project.imageUrl}
          />
        )}
      </div>
      <div className="md:w-1/2 p-8 flex flex-col justify-center">
        <span className="font-serif text-[14px] font-medium leading-none text-primary/60 mb-3">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h4 className="font-serif text-[28px] font-semibold leading-[1.3] text-primary mb-4">{project.title}</h4>
        <p className="text-[16px] leading-[1.6] text-muted flex-grow mb-8">{project.description}</p>
        <div className="flex justify-between items-center text-[12px] font-semibold tracking-[0.1em] leading-none text-primary/80 uppercase">
          <span>{project.category}</span>
          <span className="text-accent">{project.status}</span>
        </div>
      </div>
      </Link>
    </ScrollReveal>
  );
}

// 4. Half Card (Tarjeta cuadrada/ancha, 6 columnas)
function HalfProject({ project, index }: { project: Project, index: number }) {
  return (
    <ScrollReveal delay={150} distance="sm" className="md:col-span-6 flex flex-col mb-8">
      <Link href={`/proyectos/detalle/?slug=${project.slug || ''}`} className="flex flex-col w-full h-full group">
      <div className="h-[400px] bg-surface mb-6 overflow-hidden relative">
        {project.imageUrl && (
          <img
            alt={project.title}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-500"
            src={project.imageUrl}
          />
        )}
      </div>
      <div className="px-2">
        <div className="flex justify-between items-end mb-3">
          <span className="font-serif text-[14px] font-medium leading-none text-primary/60">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-[12px] font-semibold tracking-[0.1em] text-accent uppercase">
            {project.category}
          </span>
        </div>
        <h4 className="font-serif text-[28px] font-semibold leading-[1.3] text-primary mb-3">{project.title}</h4>
        <p className="text-[16px] leading-[1.6] text-muted flex-grow mb-6">{project.description}</p>
        <div className="h-[1px] bg-primary/10 mb-4"></div>
        <div className="flex justify-between items-center text-[12px] font-semibold tracking-[0.1em] leading-none text-primary/80 uppercase">
          <span>Estado:</span>
          <span>{project.status}</span>
        </div>
      </div>
      </Link>
    </ScrollReveal>
  );
}

// 5. Standard Card (Tarjeta vertical de un tercio, 4 columnas)
function StandardProject({ project, index }: { project: Project, index: number }) {
  return (
    <ScrollReveal delay={200} distance="sm" className="md:col-span-4 flex flex-col mb-8">
      <Link href={`/proyectos/detalle/?slug=${project.slug || ''}`} className="flex flex-col w-full h-full group">
      <div className="h-80 bg-surface mb-6 overflow-hidden relative">
        {project.imageUrl && (
          <img
            alt={project.title}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-500"
            src={project.imageUrl}
          />
        )}
      </div>
      <span className="font-serif text-[14px] font-medium leading-none text-primary/60 mb-3">
        {String(index + 1).padStart(2, '0')}
      </span>
      <h4 className="font-serif text-[24px] font-semibold leading-[1.3] text-primary mb-3">{project.title}</h4>
      <p className="text-[16px] leading-[1.6] text-muted flex-grow mb-6">{project.description}</p>
      <div className="h-[1px] bg-primary/10 mb-4"></div>
      <div className="flex justify-between items-center text-[12px] font-semibold tracking-[0.1em] leading-none text-primary/80 uppercase">
        <span>Estado:</span>
        <span>{project.status}</span>
      </div>
      </Link>
    </ScrollReveal>
  );
}

// 6. Solid Block (Bloque sólido con icono, 4 columnas)
function SolidProject({ project, index }: { project: Project, index: number }) {
  return (
    <ScrollReveal delay={250} distance="sm" className="md:col-span-4 flex flex-col mb-8">
      <Link href={`/proyectos/detalle/?slug=${project.slug || ''}`} className="flex flex-col w-full h-full">
      <div className="h-full min-h-[400px] bg-primary p-8 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <AppIcon name={project.icon || 'eco'} className="text-[200px] absolute -bottom-10 -right-10" />
        </div>
        <span className="font-serif text-[14px] font-medium leading-none text-primary-foreground/60 mb-4 relative z-10">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h4 className="font-serif text-[24px] font-semibold leading-[1.3] text-primary-foreground mb-4 relative z-10">
          {project.title}
        </h4>
        <p className="text-[16px] leading-[1.6] text-primary-foreground/80 relative z-10 mb-8 flex-grow">
          {project.description}
        </p>
        <span className="self-start border border-primary-foreground text-primary-foreground px-4 py-2 text-[12px] font-semibold tracking-[0.1em] leading-none hover:bg-primary-foreground hover:text-primary transition-colors duration-300 rounded-none relative z-10 uppercase">
          Conocer Más
        </span>
      </div>
      </Link>
    </ScrollReveal>
  );
}

const PAGE_SIZE = 6;

export default function Proyectos() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    api.get<ProyectoRecord[]>('/proyectos')
      .then(data => setProjects(data.map(toProjectCard)))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const visibleProjects = projects.slice(0, visibleCount);
  const hasMore = projects.length > visibleCount;

  return (
    <PublicLayout className="landing-typography">
      <main className="flex-grow pt-32 pb-[120px] px-[20px] md:px-[64px] max-w-[1280px] mx-auto w-full">
        {/* Header Section */}
        <header className="mb-24 grid grid-cols-1 md:grid-cols-12 gap-[24px] items-end">
          <ScrollReveal delay={0} distance="sm" className="md:col-span-8">
            <h1 className="font-serif font-semibold text-[32px] leading-[1.2] md:text-[52px] md:leading-[1.2] tracking-[-0.015em] text-primary mb-6">
              Iniciativas de<br />Desarrollo Rural.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={200} distance="sm" className="md:col-span-4 pb-2">
            <p className="text-[18px] leading-[1.6] text-muted">
              Proyectos enfocados en la innovación tecnológica, sostenibilidad ambiental y el empoderamiento de las comunidades productoras de café robusta en la región.
            </p>
          </ScrollReveal>
        </header>

        <div className="w-full h-[1px] bg-primary/10 mb-12"></div>

        {loading ? (
          <div className="py-24 text-center text-muted">Cargando proyectos...</div>
        ) : projects.length === 0 ? (
          <EmptyState
            title="Sin proyectos disponibles"
            description="Aún no se han publicado proyectos públicos. Vuelve a consultar más adelante."
          />
        ) : (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-[24px] gap-y-16 items-stretch">
              {visibleProjects.map((project, i) => {
                const style = project.layoutStyle || 'standard';

                switch (style) {
                  case 'hero-right':
                    return <HeroRightProject key={project.id} project={project} index={i} />;
                  case 'hero-left':
                    return <HeroLeftProject key={project.id} project={project} index={i} />;
                  case 'wide':
                    return <WideProject key={project.id} project={project} index={i} />;
                  case 'half':
                    return <HalfProject key={project.id} project={project} index={i} />;
                  case 'solid':
                    return <SolidProject key={project.id} project={project} index={i} />;
                  case 'standard':
                  default:
                    return <StandardProject key={project.id} project={project} index={i} />;
                }
              })}
            </div>

            {hasMore && (
              <div className="mt-16 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount(count => count + PAGE_SIZE)}
                  className="px-8 py-3 border border-primary text-primary text-xs font-bold tracking-widest uppercase hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Cargar más
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </PublicLayout>
  );
}
