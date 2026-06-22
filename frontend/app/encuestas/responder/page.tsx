'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SurveyPublicContainer } from '@/components/encuestas/SurveyPublicContainer'

function SurveyInner() {
  const params = useSearchParams()
  const slug = params.get('slug')
  if (!slug) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="rounded-[26px] border border-[#ebe6dc] bg-white px-6 py-5 text-[#7b6c5f] shadow-[0_22px_55px_-40px_rgba(80,58,33,0.25)]">
          No se especificó una encuesta.
        </div>
      </main>
    )
  }
  return <SurveyPublicContainer slug={slug} />
}

export default function EncuestaResponder() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex items-center gap-3 text-[#7b6c5f]">
          <svg className="h-5 w-5 animate-spin text-[#306131]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Cargando encuesta...
        </div>
      </main>
    }>
      <SurveyInner />
    </Suspense>
  )
}
