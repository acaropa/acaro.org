import { Suspense } from 'react';
import ProjectWorkspaceClient from '@/components/projects/ProjectWorkspaceClient';

export default function ProjectWorkspacePage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-muted">Cargando expediente...</div>}>
      <ProjectWorkspaceClient />
    </Suspense>
  );
}
