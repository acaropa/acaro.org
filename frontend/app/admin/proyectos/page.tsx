import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminProyectos() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Proyectos</h1>
      <EmptyState title="No hay proyectos" description="Aún no hay proyectos registrados. Crea el primer proyecto para comenzar la gestión." />
    </div>
  );
}
