import Link from 'next/link';

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/admin/configuracion/logs"
          className="group flex flex-col gap-4 p-6 rounded-xl border border-border bg-surface/30 hover:bg-surface/60 hover:border-primary/40 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700 group-hover:border-zinc-600 transition-colors">
              <span className="material-symbols-outlined text-green-400 text-[20px]">terminal</span>
            </div>
            <h2 className="font-headline-md text-[18px] font-bold text-foreground">Logs</h2>
          </div>
          <p className="font-body-md text-[14px] text-muted leading-relaxed">
            Visualiza el registro de actividad de auditoría y sesiones del sistema en tiempo real.
          </p>
          <div className="mt-auto flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
            <span>Ver logs</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </div>
        </Link>

        <div className="flex flex-col gap-4 p-6 rounded-xl border border-border border-dashed bg-surface/10 opacity-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-container border border-border">
              <span className="material-symbols-outlined text-muted text-[20px]">tune</span>
            </div>
            <h2 className="font-headline-md text-[18px] font-bold text-foreground">Ajustes generales</h2>
          </div>
          <p className="font-body-md text-[14px] text-muted leading-relaxed">
            Próximamente disponible.
          </p>
        </div>

        <div className="flex flex-col gap-4 p-6 rounded-xl border border-border border-dashed bg-surface/10 opacity-50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-container border border-border">
              <span className="material-symbols-outlined text-muted text-[20px]">shield</span>
            </div>
            <h2 className="font-headline-md text-[18px] font-bold text-foreground">Seguridad</h2>
          </div>
          <p className="font-body-md text-[14px] text-muted leading-relaxed">
            Próximamente disponible.
          </p>
        </div>
      </div>
    </>
  );
}
