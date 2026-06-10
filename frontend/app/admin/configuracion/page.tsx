import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminConfiguracion() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>
      <EmptyState title="Configuración del Sistema" description="Opciones generales de la plataforma." />
    </div>
  );
}
