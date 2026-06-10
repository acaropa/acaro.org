import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminBiblioteca() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Biblioteca</h1>
      <EmptyState title="Gestión de Documentos" description="No hay documentos cargados todavía." />
    </div>
  );
}
