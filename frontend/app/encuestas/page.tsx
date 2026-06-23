'use client'


import { AppIcon } from "@/components/ui/AppIcon"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { ScrollReveal } from '@/components/landing/LandingMotion'
import { EmptyState } from '@/components/ui/EmptyState'
import { api } from '@/lib/api'

type PublishedSurvey = {
  id: number
  titulo: string
  slug: string
  descripcion: string | null
  logo_url: string | null
  question_count?: number
}

export default function EncuestasPublicas() {
  const [surveys, setSurveys] = useState<PublishedSurvey[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<PublishedSurvey[]>('/encuestas/publicas')
      .then(setSurveys)
      .catch(() => setSurveys([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PublicLayout className="landing-typography">
      <main className="flex-grow max-w-[1280px] mx-auto w-full px-[20px] md:px-[64px] py-[80px]">

        {/* Header */}
        <header className="mb-[40px]">
          <ScrollReveal delay={0} distance="sm">
            <h1 className="landing-hero-title text-[48px] md:text-[72px] leading-[1.1] tracking-[-0.04em] text-primary max-w-4xl mb-[32px]">
              Encuestas
            </h1>
            <p className="text-[20px] leading-[1.6] text-muted max-w-3xl">
              Tu opinión es importante. Responde nuestras encuestas activas y contribuye al desarrollo
              de la comunidad cafetalera.
            </p>
          </ScrollReveal>
        </header>

        <div className="h-[1px] bg-primary/20 w-full mb-[48px]" />

        {loading ? (
          <div className="py-24 text-center text-muted">Cargando encuestas...</div>
        ) : surveys.length === 0 ? (
          <EmptyState
            title="Sin encuestas activas"
            description="No hay encuestas disponibles en este momento. Vuelve a consultar más adelante."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[32px]">
            {surveys.map((survey, index) => (
              <ScrollReveal key={survey.id} delay={100 * (index % 3)} distance="sm">
                <Link
                  href={`/encuestas/responder?slug=${survey.slug}`}
                  className="group flex flex-col h-full bg-background border border-primary/20 transition-colors hover:border-accent/40"
                >
                  {/* Card image area */}
                  <div className="h-[200px] bg-surface overflow-hidden flex items-center justify-center relative">
                    {survey.logo_url?.trim() ? (
                      <img
                        src={survey.logo_url}
                        alt={survey.titulo}
                        loading="lazy"
                        className="h-24 w-auto object-contain grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    ) : (
                      <AppIcon name="assignment" className="text-[64px] text-primary/20 group-hover:text-accent/40 transition-colors duration-500" />
                    )}
                    <div className="absolute top-[16px] left-[16px] flex items-center gap-[8px]">
                      <span className="px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase bg-accent text-white">
                        Encuesta
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="flex flex-col flex-grow p-[24px]">
                    <div className="flex items-center gap-[12px] mb-[12px]">
                      <span className="text-xs font-semibold tracking-wider uppercase text-accent">
                        {survey.question_count ?? 0} preguntas
                      </span>
                      <span className="w-1 h-1 rounded-full bg-primary/30" />
                      <span className="text-xs font-semibold tracking-wider uppercase text-muted">
                        Activa
                      </span>
                    </div>

                    <h3 className="font-bold text-[22px] leading-[1.3] text-primary mb-[12px]">
                      {survey.titulo}
                    </h3>

                    {survey.descripcion && (
                      <p className="text-[15px] leading-[1.6] text-muted flex-grow line-clamp-3">
                        {survey.descripcion}
                      </p>
                    )}

                    <span className="mt-[20px] text-xs font-bold tracking-widest uppercase text-primary border-b border-accent w-max pb-1 group-hover:border-b-2 transition-all">
                      Responder encuesta
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
      </main>
    </PublicLayout>
  )
}
