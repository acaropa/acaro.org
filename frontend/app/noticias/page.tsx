import { PublicLayout } from '@/components/layout/PublicLayout';
import { ScrollReveal } from '@/components/landing/LandingMotion';
import Image from 'next/image';
import Link from 'next/link';

export default function Noticias() {
  return (
    <PublicLayout className="landing-typography">
      <main className="flex-grow max-w-[1280px] mx-auto w-full px-[20px] md:px-[64px] py-[80px]">
        
        {/* Header Section */}
        <header className="mb-[40px]">
          <ScrollReveal delay={0} distance="sm">
            <h1 className="landing-hero-title text-[48px] md:text-[72px] leading-[1.1] tracking-[-0.04em] text-primary max-w-4xl mb-[32px]">
              Noticias y novedades de la Asociación
            </h1>
            <p className="text-[20px] leading-[1.6] text-muted max-w-3xl">
              Explora los últimos avances, eventos y proyectos que están transformando la industria del café robusta. Una mirada profunda a nuestra comunidad y sus logros.
            </p>
          </ScrollReveal>
        </header>

        <div className="h-[1px] bg-primary/20 w-full mb-[32px]"></div>

        {/* Filters */}
        <section className="mb-[80px]">
          <ScrollReveal delay={100} distance="sm" className="flex flex-wrap gap-[12px]">
            <button className="px-4 py-2 border border-primary bg-primary text-primary-foreground text-xs font-bold tracking-widest uppercase transition-colors">TODAS</button>
            <button className="px-4 py-2 border border-primary text-primary text-xs font-bold tracking-widest uppercase bg-transparent hover:bg-primary/5 transition-colors">EVENTOS</button>
            <button className="px-4 py-2 border border-primary text-primary text-xs font-bold tracking-widest uppercase bg-transparent hover:bg-primary/5 transition-colors">PROYECTOS</button>
            <button className="px-4 py-2 border border-primary text-primary text-xs font-bold tracking-widest uppercase bg-transparent hover:bg-primary/5 transition-colors">COMUNIDAD</button>
            <button className="px-4 py-2 border border-primary text-primary text-xs font-bold tracking-widest uppercase bg-transparent hover:bg-primary/5 transition-colors">FORMACIÓN</button>
            <button className="px-4 py-2 border border-primary text-primary text-xs font-bold tracking-widest uppercase bg-transparent hover:bg-primary/5 transition-colors">ALIANZAS</button>
            <button className="px-4 py-2 border border-primary text-primary text-xs font-bold tracking-widest uppercase bg-transparent hover:bg-primary/5 transition-colors">CAFÉ ROBUSTA</button>
          </ScrollReveal>
        </section>

        {/* Section 01: Hero Editorial Story */}
        <section className="mb-[120px]">
          <ScrollReveal delay={200} distance="md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px] relative">
              <div className="absolute top-0 left-0 text-xs font-bold tracking-widest uppercase text-primary -mt-6">SECTION 01</div>
              
              <div className="lg:col-span-8 h-[600px] bg-surface relative">
                <img 
                  alt="Café" 
                  className="w-full h-full object-cover filter brightness-95 grayscale-[20%]" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsmwvN8buI2FV8ZusssHQM778z5975j-h3cJGmlz5LI45Eu7hrF4Lpc3dvxakn0qJaqcay14MUTgE-bgkZxgdnhbUJzvyql_suKHd_D1oqfSFspSubrnXFdc_8YAWx81cIN89R8hKccXClC0rHMPPlsWg6xp6PyFmbWlTmvI4B36RqFznSo_nHIyWHvFpah8iKK36kZsSVdjHsHvnFKay2H_T1I7vijuTL5qYoJrgST3vc53U7McOJlH_8MdrnW0jSaUjLJ2T_jc8"
                />
              </div>
              
              <div className="lg:col-span-4 flex flex-col justify-center bg-background p-[32px] md:p-[48px] relative border border-primary/20">
                <div className="flex items-center gap-[16px] mb-[16px]">
                  <span className="text-xs font-bold tracking-widest uppercase text-accent">Proyectos</span>
                  <span className="w-1 h-1 rounded-full bg-primary/30"></span>
                  <span className="text-xs font-bold tracking-widest uppercase text-muted">24 OCT 2024</span>
                </div>
                <h2 className="font-bold text-[32px] md:text-[48px] leading-[1.2] text-primary mb-[24px]">
                  El Futuro Sostenible del Cultivo en Altura
                </h2>
                <p className="text-[16px] leading-[1.6] text-muted mb-[32px]">
                  <span className="font-semibold text-primary">Avances Clave.</span> Nuestra última investigación revela métodos innovadores para mantener la calidad del robusta mientras se reduce drásticamente el consumo de agua en zonas montañosas.
                </p>
                
                <div className="mt-auto flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase text-primary mb-1">Por</p>
                    <p className="text-[16px] font-semibold text-primary">Dra. Elena Costa</p>
                  </div>
                  <Link href="#" className="text-xs font-bold tracking-widest uppercase text-primary border-b border-accent hover:border-b-2 transition-all pb-1 flex items-center gap-2">
                    Leer noticia
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* 3-Column Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-[32px]">
          
          {/* Column 1: Featured Story (Spans 5 cols) */}
          <article className="md:col-span-5 flex flex-col gap-[32px] bg-background p-[32px] border border-primary/20">
            <ScrollReveal delay={100} distance="sm" className="h-full flex flex-col">
              <div className="relative w-full aspect-[4/5] overflow-hidden mb-[32px]">
                <img 
                  alt="Coffee beans processing" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2vVH-YORhuT-BdTiLFB8ceoj0MyTHN1WLb6U4l1yEro9PTRqxsCDXICPVcC2cLtly9s0OuE0rg7_wyBTFbEi-0Kqy3rRgxpxrjQ9m_4a_KlEz24W8CKCsXPbB5cC2S79etukHZ1_dyGYL2IbnGszNalZ_2bnl8yUQg2L0e04o_Yy5M1E_ljbYuGQrUNlfhb3joBHzE5VaZONSrF4GB1c4hGtK4pp3oxSXEZdxNy7f94SH0IFT5R2Crrg9DZrugC0a8KkvqRLCwDA"
                />
              </div>
              <div className="flex-grow flex flex-col">
                <span className="text-xs font-semibold tracking-wider uppercase text-accent block mb-[12px]">ACTUALIZACIÓN 01</span>
                <h2 className="font-bold text-[32px] md:text-[48px] leading-[1.2] tracking-[-0.02em] text-primary mb-[12px]">Nuevos Estándares de Exportación</h2>
                <p className="text-[20px] leading-[1.6] text-muted mb-[32px] flex-grow">
                  <span className="font-bold text-primary">Bruselas, UE —</span> La comisión europea aprueba el nuevo marco regulatorio para la importación de café robusta, estableciendo pautas más estrictas sobre trazabilidad y sostenibilidad ambiental que afectarán directamente a los productores locales.
                </p>
                <Link href="#" className="text-xs font-bold tracking-widest uppercase text-primary inline-block border-b-2 border-transparent hover:border-accent transition-colors pb-1 w-max">
                  LEER ARTÍCULO COMPLETO
                </Link>
              </div>
            </ScrollReveal>
          </article>

          {/* Column 2: Secondary Stories Stack (Spans 4 cols) */}
          <div className="md:col-span-4 flex flex-col gap-[40px] md:gap-[80px]">
            <article className="border-b border-primary/20 pb-[32px] flex flex-col h-full">
              <ScrollReveal delay={200} distance="sm">
                <span className="text-xs font-semibold tracking-wider uppercase text-primary/60 block mb-[12px]">MERCADOS • 12 OCT</span>
                <h3 className="font-bold text-[24px] leading-[1.3] text-primary mb-[12px]">El precio del quintal alcanza máximos históricos en el Q3</h3>
                <p className="text-[16px] leading-[1.6] text-muted mb-[16px]">La escasez climática en regiones clave impulsa el valor del grano robusta, presentando oportunidades inéditas para cooperativas organizadas.</p>
                <Link href="#" className="text-xs font-bold tracking-widest uppercase text-primary inline-block border-b-2 border-transparent hover:border-accent transition-colors pb-1 w-max">
                  ANÁLISIS DE MERCADO
                </Link>
              </ScrollReveal>
            </article>
            
            <article className="border-b border-primary/20 pb-[32px] flex flex-col h-full">
              <ScrollReveal delay={300} distance="sm">
                <span className="text-xs font-semibold tracking-wider uppercase text-primary/60 block mb-[12px]">INNOVACIÓN • 10 OCT</span>
                <h3 className="font-bold text-[24px] leading-[1.3] text-primary mb-[12px]">Implementación de secado solar automatizado</h3>
                <div className="w-full h-[128px] bg-surface mb-[12px] overflow-hidden">
                  <img 
                    alt="Coffee farm" 
                    className="w-full h-full object-cover opacity-80" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDTHakyEqOcOS0YXYCQWeSSF6PPDXQEeaKRaQ_UvFC3m1K06y6Q5BiyM9pyreXiemsZeSUzjvJywCXDiirGioX65wHPLSv_FQhhhOjq_eNyOeWI0kKX3EbnoEEjgjrXNb5VJUZxzEk88GYzQx6Jwk9kXenRH-soLjkN5fXWiQ2P0U5sCv82nV1oA3UE1QwsyZZvyPtfNaBph7yeucEam1UrPb-l8QDx2i1cEwNWY5ELniD-LiQo7cLnZJ2OwHkUTqQYXg5zsqsPVo"
                  />
                </div>
                <p className="text-[16px] leading-[1.6] text-muted mb-[12px]">Tres fincas piloto reportan un aumento del 15% en la eficiencia térmica durante el proceso de beneficiado seco.</p>
              </ScrollReveal>
            </article>

            <article className="flex flex-col h-full">
              <ScrollReveal delay={400} distance="sm">
                <span className="text-xs font-semibold tracking-wider uppercase text-primary/60 block mb-[12px]">COMUNIDAD • 08 OCT</span>
                <h3 className="font-bold text-[24px] leading-[1.3] text-primary mb-[12px]">Programa de becas para jóvenes agrónomos</h3>
                <p className="text-[16px] leading-[1.6] text-muted mb-[12px]">Apertura de inscripciones para el diplomado en gestión integral de cafetales robusta.</p>
              </ScrollReveal>
            </article>
          </div>

          {/* Column 3: Quick News & Announcements (Spans 3 cols) */}
          <aside className="md:col-span-3 bg-surface p-[32px] border border-primary/20 flex flex-col gap-[32px]">
            <ScrollReveal delay={300} distance="sm" className="flex flex-col h-full">
              <div className="border-b border-primary/20 pb-[12px] mb-[24px]">
                <h4 className="text-xs font-bold tracking-widest uppercase text-primary/60">ÚLTIMAS NOVEDADES</h4>
              </div>
              
              <ul className="flex flex-col flex-grow">
                <li className="pb-[24px] border-b border-primary/10">
                  <p className="text-xs font-bold tracking-widest uppercase text-primary/60 mb-[8px]">24 OCTUBRE 2024</p>
                  <p className="text-[20px] leading-[1.3] text-primary font-bold">Nueva certificación orgánica para 50 fincas afiliadas.</p>
                </li>
                <li className="py-[24px] border-b border-primary/10">
                  <p className="text-xs font-bold tracking-widest uppercase text-primary/60 mb-[8px]">18 OCTUBRE 2024</p>
                  <p className="text-[20px] leading-[1.3] text-primary font-bold">Asamblea general: Votación de la nueva mesa directiva.</p>
                </li>
                <li className="pt-[24px]">
                  <p className="text-xs font-bold tracking-widest uppercase text-primary/60 mb-[8px]">05 OCTUBRE 2024</p>
                  <p className="text-[20px] leading-[1.3] text-primary font-bold">Apertura del programa de financiamiento rural.</p>
                </li>
              </ul>

              <div className="mt-auto pt-[32px]">
                <div className="bg-primary text-primary-foreground p-[24px] text-center">
                  <span className="text-xs font-semibold tracking-wider uppercase block mb-[8px] opacity-80">PRÓXIMO EVENTO</span>
                  <p className="text-xs font-bold tracking-widest uppercase mb-[16px]">ASAMBLEA GENERAL EXTRAORDINARIA</p>
                  <p className="text-[16px] leading-[1.6] font-bold mb-[4px]">25 DE OCTUBRE, 2024</p>
                  <p className="text-[14px] leading-[1.6] opacity-80 mb-[16px]">Sede Administrativa</p>
                  <button className="border border-primary-foreground text-primary-foreground text-xs font-bold tracking-widest uppercase px-4 py-3 hover:bg-primary-foreground hover:text-primary transition-colors w-full">
                    CONFIRMAR ASISTENCIA
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </aside>

        </div>

        {/* Load More Button */}
        <div className="mt-[64px] flex justify-center">
          <ScrollReveal delay={100} distance="sm">
            <button className="text-xs font-bold tracking-widest uppercase text-primary border border-primary px-8 py-4 hover:bg-primary hover:text-primary-foreground transition-colors">
              Cargar más noticias
            </button>
          </ScrollReveal>
        </div>
      </main>
    </PublicLayout>
  );
}
