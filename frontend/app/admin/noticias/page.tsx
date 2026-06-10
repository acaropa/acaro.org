import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminNoticias() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Noticias</h1>
      <EmptyState title="No hay noticias" description="Aún no se han publicado noticias." />
    </div>
  );
}
