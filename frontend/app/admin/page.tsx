'use client';

import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <>
      {/* Header Section */}
      <section className="mb-8">
        <div className="border-b border-border pb-6">
          <h1 className="font-headline-lg text-[40px] md:text-[56px] text-foreground leading-tight mb-3 tracking-tight">
            Panorama Institucional
          </h1>
          <p className="font-body-lg text-[16px] md:text-[18px] text-muted max-w-2xl">
            Supervisa proyectos, comunidad, documentos, participación y crecimiento de la Asociación Café Robusta OBC.
          </p>
        </div>
      </section>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main KPI Card - Asymmetric Large Block */}
        <div className="md:col-span-8 bg-card border border-border rounded-xl p-8 relative overflow-hidden">
          <div className="flex justify-between items-start mb-12">
            <div>
              <span className="font-label-caps text-label-caps text-muted mb-2 block">Producción Total Anual</span>
              <div className="font-display-number text-display-number text-foreground">
                1,245<span className="text-headline-md font-headline-md text-muted ml-2">Ton</span>
              </div>
            </div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-1 font-data-mono text-data-mono">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              +12.4%
            </div>
          </div>
          <div className="h-48 w-full border-b border-border relative">
            {/* Simple visual representation of a chart */}
            <div className="absolute bottom-0 left-0 w-1/6 h-[40%] bg-primary/20 border-t border-primary"></div>
            <div className="absolute bottom-0 left-[16.6%] w-1/6 h-[60%] bg-primary/40 border-t border-primary"></div>
            <div className="absolute bottom-0 left-[33.3%] w-1/6 h-[50%] bg-primary/30 border-t border-primary"></div>
            <div className="absolute bottom-0 left-[50%] w-1/6 h-[80%] bg-primary/60 border-t border-primary"></div>
            <div className="absolute bottom-0 left-[66.6%] w-1/6 h-[75%] bg-primary/50 border-t border-primary"></div>
            <div className="absolute bottom-0 left-[83.3%] w-1/6 h-[100%] bg-primary/80 border-t border-primary"></div>
          </div>
          <div className="flex justify-between mt-2 font-data-mono text-[10px] text-muted uppercase">
            <span>Ene</span>
            <span>Mar</span>
            <span>May</span>
            <span>Jul</span>
            <span>Sep</span>
            <span>Nov</span>
          </div>
        </div>

        {/* Secondary KPIs - Narrow Block */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="bg-card border border-border rounded-xl p-8 flex-1">
            <span className="font-label-caps text-label-caps text-muted mb-2 block">Miembros Activos</span>
            <div className="font-headline-lg text-headline-lg text-foreground mb-4">432</div>
            <div className="flex items-center gap-2 text-muted font-data-mono text-data-mono">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Nuevos este mes: 18
            </div>
          </div>
          <div className="bg-primary rounded-xl p-8 text-primary-foreground flex-1 flex flex-col justify-between">
            <div>
              <span className="font-label-caps text-label-caps text-primary-foreground/70 mb-2 block">Calidad Exportación</span>
              <div className="font-headline-lg text-headline-lg mb-4">94%</div>
            </div>
            <button className="bg-primary-foreground text-primary px-4 py-3 font-label-caps text-label-caps rounded-lg hover:bg-accent hover:text-primary-foreground transition-colors w-full mt-4">
              Ver Reporte
            </button>
          </div>
        </div>
      </div>

      {/* Proyectos Ejecutivos */}
      <section>
        <div className="flex justify-between items-end mb-8 border-b border-border pb-4 mt-12">
          <h2 className="font-headline-md text-headline-md text-foreground">Proyectos en Curso</h2>
          <Link href="/admin/proyectos" className="font-label-caps text-label-caps text-muted hover:text-primary flex items-center gap-1 transition-colors">
            Ver todos <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Proyecto 1 */}
          <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-caps text-[10px] text-muted tracking-widest uppercase">Renovación</span>
              <span className="w-2 h-2 bg-primary rounded-full"></span>
            </div>
            <h3 className="font-body-lg text-body-lg font-semibold text-foreground mb-2">Renovación de Cafetales Zona Norte</h3>
            <div className="w-full bg-border h-1.5 rounded-full mt-6 mb-2 overflow-hidden">
              <div className="bg-primary h-1.5 rounded-full w-[65%]"></div>
            </div>
            <div className="flex justify-between font-data-mono text-[12px] text-muted">
              <span>Progreso</span>
              <span>65%</span>
            </div>
          </div>

          {/* Proyecto 2 */}
          <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-caps text-[10px] text-muted tracking-widest uppercase">Infraestructura</span>
              <span className="w-2 h-2 bg-primary/50 rounded-full"></span>
            </div>
            <h3 className="font-body-lg text-body-lg font-semibold text-foreground mb-2">Nuevo Centro de Beneficiado</h3>
            <div className="w-full bg-border h-1.5 rounded-full mt-6 mb-2 overflow-hidden">
              <div className="bg-primary h-1.5 rounded-full w-[30%]"></div>
            </div>
            <div className="flex justify-between font-data-mono text-[12px] text-muted">
              <span>Progreso</span>
              <span>30%</span>
            </div>
          </div>

          {/* Proyecto 3 */}
          <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-caps text-[10px] text-muted tracking-widest uppercase">Sostenibilidad</span>
              <span className="w-2 h-2 bg-primary rounded-full"></span>
            </div>
            <h3 className="font-body-lg text-body-lg font-semibold text-foreground mb-2">Certificación Orgánica Lote B</h3>
            <div className="w-full bg-border h-1.5 rounded-full mt-6 mb-2 overflow-hidden">
              <div className="bg-primary h-1.5 rounded-full w-[85%]"></div>
            </div>
            <div className="flex justify-between font-data-mono text-[12px] text-muted">
              <span>Progreso</span>
              <span>85%</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
