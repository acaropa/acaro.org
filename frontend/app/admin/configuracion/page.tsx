import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminConfiguracion() {
  return (
    <>
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
          <div className="max-w-2xl">
            <h1 className="font-headline-lg text-[40px] md:text-[56px] text-foreground leading-tight mb-3 tracking-tight">
              Configuración
            </h1>
            <p className="font-body-lg text-[16px] md:text-[18px] text-muted">
              Opciones generales y ajustes del sistema.
            </p>
          </div>
        </div>
      </section>

      <div className="bg-surface/30 border border-border border-dashed p-16 flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-[48px] text-muted mb-4 opacity-50">settings</span>
        <h3 className="font-headline-md text-xl font-bold text-foreground mb-2">Próximamente</h3>
        <p className="font-body-md text-muted max-w-md">Las configuraciones de la plataforma estarán disponibles en futuras actualizaciones.</p>
      </div>
    </>
  );
}
