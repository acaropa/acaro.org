import { PublicLayout } from '@/components/layout/PublicLayout';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { mockProjects } from '@/data/mock-projects';

export default function Proyectos() {
  return (
    <PublicLayout>
      <div className="p-24 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Proyectos</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockProjects.map(p => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
