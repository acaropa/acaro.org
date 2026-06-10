import Link from "next/link"
import { ArrowRight, BookOpen, Coffee, Leaf, Users } from "lucide-react"

import Image from "next/image"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { Button } from "@/components/ui/button"
import { ProjectCard } from "@/components/ui/ProjectCard"
import { NewsCard } from "@/components/ui/NewsCard"
import { mockProjects } from "@/data/mock-projects"
import { mockNews } from "@/data/mock-news"

export default function Home() {
  const featuredProjects = mockProjects.slice(0, 3)
  const recentNews = mockNews.slice(0, 3)

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative bg-background overflow-hidden flex min-h-[85vh] lg:min-h-[90vh] pt-28 lg:pt-40 pb-20">
        {/* Background Image & Gradient */}
        <div className="absolute inset-0 z-0 lg:left-1/2 lg:w-1/2">
          {/* Gradient for smooth transition */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent lg:bg-gradient-to-r lg:from-background lg:via-background/50 lg:to-transparent z-10" />
          <Image 
            src="/assets/hero-bg.jpg"
            alt="Cerezas de café robusta"
            fill
            className="object-cover object-center lg:object-left-top"
            priority
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-2xl text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-primary dark:text-foreground mb-6 tracking-tight drop-shadow-sm">
              Asociación Café Robusta OBC
            </h1>
            <p className="text-xl md:text-2xl text-foreground lg:text-muted font-medium lg:font-normal mb-10 leading-relaxed drop-shadow-md lg:drop-shadow-none">
              Impulsando el desarrollo del café robusta con organización, tecnología y visión productiva.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto text-base shadow-lg">
                <Link href="/nosotros">Conocer la asociación</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-base bg-background/50 backdrop-blur hover:bg-background/80">
                <Link href="/proyectos">Ver proyectos</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-base hidden sm:flex bg-background/50 backdrop-blur hover:bg-background/80">
                <Link href="/biblioteca">Biblioteca técnica</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Identidad */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-primary mb-6">Nuestra Identidad</h2>
          <p className="text-lg text-muted leading-relaxed">
            Somos una organización comprometida con la excelencia agrícola, trabajando mano a mano con productores locales para elevar el estándar del café robusta. Fusionamos las prácticas tradicionales con innovación tecnológica y gestión profesional para asegurar trazabilidad, calidad y sostenibilidad en cada etapa del proceso.
          </p>
        </div>
      </section>

      {/* Proyectos Destacados */}
      <section className="py-24 bg-surface/50 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-2">Proyectos Destacados</h2>
              <p className="text-muted">Iniciativas activas para el desarrollo del sector.</p>
            </div>
            <Link href="/proyectos" className="text-accent hover:text-accent-hover font-medium hidden sm:flex items-center">
              Ver todos <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Button asChild variant="outline" className="w-full">
              <Link href="/proyectos">Ver todos los proyectos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Noticias */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-2">Noticias y Comunicados</h2>
              <p className="text-muted">Mantente al tanto de las últimas novedades institucionales.</p>
            </div>
            <Link href="/noticias" className="text-accent hover:text-accent-hover font-medium hidden sm:flex items-center">
              Ver todas <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentNews.map(news => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6 text-white">¿Deseas más información o unirte a la asociación?</h2>
          <p className="text-primary-foreground/80 mb-10 text-lg">
            Estamos abiertos a nuevas colaboraciones, alianzas estratégicas y afiliaciones de productores.
          </p>
          <Button asChild size="lg" variant="secondary" className="px-8 text-lg bg-accent hover:bg-accent-hover text-white border-none">
            <Link href="/contacto">Contáctanos ahora</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  )
}

