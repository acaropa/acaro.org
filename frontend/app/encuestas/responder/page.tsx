'use client'

import { DataLoadingState } from "@/components/ui/TypingIndicator";

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
        <DataLoadingState label="Cargando encuesta..." />
      </main>
    }>
      <SurveyInner />
    </Suspense>
  )
}
