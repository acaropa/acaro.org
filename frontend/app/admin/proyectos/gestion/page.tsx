import { DataLoadingState } from "@/components/ui/TypingIndicator";

import { Suspense } from 'react';
import ProjectWorkspaceClient from '@/components/projects/ProjectWorkspaceClient';

export default function ProjectWorkspacePage() {
  return (
    <Suspense fallback={<DataLoadingState label="Cargando expediente..." className="py-24" />}>
      <ProjectWorkspaceClient />
    </Suspense>
  );
}
