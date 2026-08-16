'use client'

import { DataLoadingState } from "@/components/ui/TypingIndicator";

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SurveyEditorWizard } from '@/components/encuestas/SurveyEditorWizard'

function EditorInner() {
  const params = useSearchParams()
  const id = params.get('id')
  if (!id) return <p className="py-12 text-center text-sm text-[#765e50]">ID de encuesta no proporcionado.</p>
  return <SurveyEditorWizard encuestaId={Number(id)} />
}

export default function EditarEncuesta() {
  return (
    <Suspense fallback={<DataLoadingState label="Cargando..." className="py-12" />}>
      <EditorInner />
    </Suspense>
  )
}
