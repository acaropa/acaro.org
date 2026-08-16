'use client'

import { DataLoadingState } from "@/components/ui/TypingIndicator";

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AnalyticsDashboard } from '@/components/encuestas/AnalyticsDashboard'

function ResultadosInner() {
  const params = useSearchParams()
  const id = params.get('id')
  if (!id) return <p className="py-12 text-center text-sm text-[#765e50]">ID de encuesta no proporcionado.</p>
  return <AnalyticsDashboard encuestaId={Number(id)} />
}

export default function ResultadosEncuesta() {
  return (
    <Suspense fallback={<DataLoadingState label="Cargando..." className="py-12" />}>
      <ResultadosInner />
    </Suspense>
  )
}
