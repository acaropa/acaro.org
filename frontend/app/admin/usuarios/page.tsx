import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminUsuarios() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Usuarios</h1>
      <EmptyState title="Gestión de Usuarios" description="Administra los accesos al sistema." />
    </div>
  );
}
