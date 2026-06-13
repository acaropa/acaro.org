import { PublicLayout } from '@/components/layout/PublicLayout';
import { ScrollReveal } from '@/components/landing/LandingMotion';
import { mockProjects, Project } from '@/data/mock-projects';

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
        <button className="self-start border border-primary text-primary px-6 py-3 text-[12px] font-semibold tracking-[0.1em] leading-none hover:bg-primary hover:text-primary-foreground transition-colors duration-300 rounded-none uppercase">
          Ver Detalles
        </button>
      </div>
      <div className="md:col-span-9 order-1 md:order-2">
        <div className="w-full h-[600px] bg-surface relative overflow-hidden">
          {project.imageUrl && (
            <img alt={project.title} className="w-full h-full object-cover" src={project.imageUrl} />
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
            <img alt={project.title} className="w-full h-full object-cover" src={project.imageUrl} />
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
        <button className="self-end border border-primary text-primary px-6 py-3 text-[12px] font-semibold tracking-[0.1em] leading-none hover:bg-primary hover:text-primary-foreground transition-colors duration-300 rounded-none uppercase">
          Ver Detalles
        </button>
      </div>
    </ScrollReveal>
  );
}

// 3. Wide Card (Tarjeta ancha horizontal, 8 columnas)
function WideProject({ project, index }: { project: Project, index: number }) {
  return (
    <ScrollReveal delay={100} distance="sm" className="md:col-span-8 flex flex-col md:flex-row bg-surface overflow-hidden mb-8 group">
      <article className="flex flex-col md:flex-row w-full h-full">
      <div className="md:w-1/2 h-80 md:h-auto relative">
        {project.imageUrl && (
          <img 
            alt={project.title} 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
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
      </article>
    </ScrollReveal>
  );
}

// 4. Half Card (Tarjeta cuadrada/ancha, 6 columnas)
function HalfProject({ project, index }: { project: Project, index: number }) {
  return (
    <ScrollReveal delay={150} distance="sm" className="md:col-span-6 flex flex-col mb-8">
      <article className="flex flex-col w-full h-full">
      <div className="h-[400px] bg-surface mb-6 overflow-hidden relative">
        {project.imageUrl && (
          <img 
            alt={project.title} 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" 
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
      </article>
    </ScrollReveal>
  );
}

// 5. Standard Card (Tarjeta vertical de un tercio, 4 columnas)
function StandardProject({ project, index }: { project: Project, index: number }) {
  return (
    <ScrollReveal delay={200} distance="sm" className="md:col-span-4 flex flex-col mb-8">
      <article className="flex flex-col w-full h-full">
      <div className="h-80 bg-surface mb-6 overflow-hidden relative">
        {project.imageUrl && (
          <img 
            alt={project.title} 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" 
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
      </article>
    </ScrollReveal>
  );
}

// 6. Solid Block (Bloque sólido con icono, 4 columnas)
function SolidProject({ project, index }: { project: Project, index: number }) {
  return (
    <ScrollReveal delay={250} distance="sm" className="md:col-span-4 flex flex-col mb-8">
      <article className="flex flex-col w-full h-full">
      <div className="h-full min-h-[400px] bg-primary p-8 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <span className="material-symbols-outlined text-[200px] absolute -bottom-10 -right-10" data-weight="fill">
            {project.icon || 'eco'}
          </span>
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
        <button className="self-start border border-primary-foreground text-primary-foreground px-4 py-2 text-[12px] font-semibold tracking-[0.1em] leading-none hover:bg-primary-foreground hover:text-primary transition-colors duration-300 rounded-none relative z-10 uppercase">
          Conocer Más
        </button>
      </div>
      </article>
    </ScrollReveal>
  );
}

export default function Proyectos() {
  return (
    <PublicLayout className="landing-typography">
      <main className="flex-grow pt-32 pb-[120px] px-[20px] md:px-[64px] max-w-[1280px] mx-auto w-full">
        {/* Header Section */}
        <header className="mb-24 grid grid-cols-1 md:grid-cols-12 gap-[24px] items-end">
          <ScrollReveal delay={0} distance="sm" className="md:col-span-8">
            <h1 className="landing-hero-title font-serif text-[40px] leading-[1.1] md:text-[64px] md:leading-[1.1] tracking-[-0.04em] text-primary mb-6">
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

        {/* Dynamic Editorial Projects Grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-[24px] gap-y-16 items-stretch">
            {mockProjects.map((project, i) => {
              // El layout ahora está 100% definido por el dato del proyecto. 
              // No hay patrones automáticos repetitivos, todo es diseño manual para la máxima libertad.
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
        </section>
      </main>
    </PublicLayout>
  );
}
