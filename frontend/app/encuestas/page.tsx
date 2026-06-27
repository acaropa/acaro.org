'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AppIcon } from '@/components/ui/AppIcon'

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
      .then((data) => {
        setSurveys(data);
      })
      .catch((err) => {
        console.error('Error fetching surveys:', err);
        setSurveys([]);
      })
      .finally(() => setLoading(false))
  }, [])

  // IntersectionObserver for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-visible', 'true');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [surveys, loading]);

  return (
    <PublicLayout className="theme-public-surveys bg-surface">
      <div className="flex flex-col lg:flex-row items-start w-full min-h-[calc(100vh-72px)]">
        <section className="relative lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)] w-full lg:w-1/2 h-[35vh] min-h-[300px] bg-[#120C08] flex flex-col justify-end p-6 lg:p-[64px] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div 
              className="w-full h-full bg-cover bg-center opacity-80" 
              style={{backgroundImage: "url('/coffee_farmers_survey.png')"}}>
            </div>
            {/* Improved overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#120C08]/95 via-[#120C08]/60 to-[#120C08]/20"></div>
          </div>
          <div className="relative z-10 space-y-4 max-w-xl">
            <h1 className="font-headline-lg text-headline-lg-mobile lg:text-display-lg text-[#f8efe3] leading-none drop-shadow-lg">
              Nuestras <br/> <span className="italic font-normal">Encuestas</span>
            </h1>
            <p className="font-body-lg text-body-lg text-[#d8c9bb] max-w-md drop-shadow-md">
              Su participación es fundamental para elevar los estándares de la industria y asegurar la prosperidad de nuestra comunidad cafetalera.
            </p>
          </div>
        </section>

        {/* Right Panel: Scrollable Content */}
        <section className="w-full lg:w-1/2 bg-[#FAF8F5] dark:bg-surface pt-16 pb-24 px-[24px] lg:px-[80px]">
          <div className="max-w-2xl mx-auto space-y-12">
            
            <div className="mb-12 scroll-reveal" data-direction="up" data-distance="md">
              <div className="w-16 h-[2px] bg-primary mb-6"></div>
              <h2 className="font-headline-lg text-on-surface mb-3">Encuestas Disponibles</h2>
              <p className="font-body-lg text-on-surface-variant max-w-md">
                Su voz moldea el futuro del café robusta. Seleccione una encuesta para participar.
              </p>
            </div>

            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center text-primary/60 animate-pulse space-y-6">
                <AppIcon name="loader_2" className="w-10 h-10 animate-spin" />
                <p className="font-label-caps">CARGANDO...</p>
              </div>
            ) : surveys.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 scroll-reveal" data-direction="up" data-distance="lg">
                <AppIcon name="inbox" className="text-5xl text-outline-variant" />
                <div className="space-y-3">
                  <h3 className="font-headline-md text-on-surface">No hay encuestas en este momento</h3>
                  <p className="font-body-md text-on-surface-variant max-w-sm mx-auto">
                    Agradecemos su interés. Pronto publicaremos nuevas consultas para nuestros productores.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {surveys.map((survey, index) => {
                  const watermarks = ['coffee', 'eco', 'groups'];
                  const watermark = watermarks[index % watermarks.length];
                  // Stagger delay for elements appearing together
                  const delayStyle = { transitionDelay: `${(index % 4) * 150}ms` } as React.CSSProperties;
                  
                  return (
                    <Link 
                      href={`/encuestas/responder?slug=${survey.slug}`}
                      key={survey.id} 
                      className="block group bg-white dark:bg-surface-container-low p-7 lg:p-10 border-l-[3px] border-l-transparent hover:border-l-primary border-y border-r border-outline-variant/30 hover:border-outline-variant/60 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-700 relative overflow-hidden scroll-reveal"
                      data-direction="up"
                      data-distance="lg"
                      style={delayStyle}
                    >
                      {/* Subtle background motif to differentiate surveys */}
                      <div className="absolute -right-8 -bottom-8 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700 pointer-events-none transform group-hover:-translate-y-4 group-hover:-translate-x-4">
                        <AppIcon name={watermark} className="text-[160px] lg:text-[180px] text-primary" />
                      </div>

                      <div className="relative z-10">
                        <div className="flex flex-wrap items-center gap-4 mb-5">
                          <span className="font-label-caps text-on-surface-variant/70 flex items-center gap-1.5">
                            <AppIcon name="clock" className="w-3.5 h-3.5" />
                            {Math.max(5, (survey.question_count || 0) * 0.5)} MIN ESTIMADOS
                          </span>
                        </div>
                        
                        <h3 className="font-headline-md text-on-surface group-hover:text-primary transition-colors duration-500 mb-4 lg:pr-12">
                          {survey.titulo}
                        </h3>
                        
                        {survey.descripcion && (
                          <p className="font-body-md text-on-surface-variant/90 mb-8 max-w-xl">
                            {survey.descripcion}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between pt-6 border-t border-outline-variant/20">
                          <div className="flex items-center gap-2 text-on-surface-variant font-label-caps">
                            <AppIcon name="list_checks" className="w-4 h-4" />
                            <span>{survey.question_count || 0} PREGUNTAS</span>
                          </div>
                          
                          <span 
                            className="inline-flex items-center gap-3 px-5 py-2.5 lg:px-6 lg:py-3 bg-transparent border border-primary/30 text-primary font-label-caps group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500"
                          >
                            RESPONDER
                            <AppIcon name="arrow_forward" className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Support Section */}
            <div className="pt-16 mt-8 scroll-reveal" data-direction="up" data-distance="sm">
              <div className="border-t border-outline-variant/30 pt-8 flex items-start gap-6">
                <AppIcon name="info" className="text-primary/60 text-2xl shrink-0 mt-1" />
                <div>
                  <h4 className="font-label-caps text-on-surface mb-3">ASISTENCIA TÉCNICA</h4>
                  <p className="font-body-md text-on-surface-variant">
                    Si encuentra dificultades al completar su encuesta, nuestro equipo está a su disposición en su cooperativa local o contactando a soporte técnico.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
