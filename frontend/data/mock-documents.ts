import type { LibraryRecord } from "@/lib/library";

export const mockLibraryRecords: LibraryRecord[] = [
  {
    id: 1001,
    titulo: "Estrategias de adaptación climática para fincas de café robusta",
    descripcion:
      "Estudio sobre integración de sombra, conservación de suelos y retención de humedad para afrontar temporadas secas.",
    autor: "Comité Técnico ACARO",
    fecha: "2026-05-18",
    link: "https://example.com/documentos/adaptacion-climatica.pdf",
  },
  {
    id: 1002,
    titulo: "Perfil sensorial del robusta fino panameño",
    descripcion:
      "Metodología para evaluar fragancia, cuerpo, dulzor y notas de taza en muestras regionales.",
    autor: "Laboratorio de Calidad",
    fecha: "2026-04-26",
    link: "https://example.com/documentos/perfil-sensorial.pdf",
  },
  {
    id: 1003,
    titulo: "Calendario de fertilización 2026-2027",
    descripcion:
      "Programa nutricional por etapa productiva con recomendaciones para suelos de la región.",
    autor: "Ing. Mariana Quirós",
    fecha: "2026-04-10",
    link: "https://example.com/documentos/calendario-fertilizacion.xlsx",
  },
  {
    id: 1004,
    titulo: "Manual de poda para plantaciones de alta densidad",
    descripcion:
      "Guía práctica para poda de formación, mantenimiento y renovación de tejidos productivos.",
    autor: "Equipo de Extensión Agrícola",
    fecha: "2026-03-22",
    link: "https://example.com/documentos/manual-poda.pdf",
  },
  {
    id: 1005,
    titulo: "Protocolo de fermentación anaeróbica controlada",
    descripcion:
      "Procedimiento para controlar temperatura, tiempo y pH durante la fermentación del café robusta.",
    autor: "Comité de Procesamiento",
    fecha: "2026-03-08",
    link: "https://example.com/documentos/fermentacion-anaerobica.docx",
  },
  {
    id: 1006,
    titulo: "Manejo integrado de la broca del café",
    descripcion:
      "Identificación, monitoreo y control biológico de la broca en sistemas agroforestales.",
    autor: "Dra. Elena Ríos",
    fecha: "2026-02-19",
    link: "https://example.com/documentos/manejo-broca.pdf",
  },
  {
    id: 1007,
    titulo: "Técnicas de secado en camas africanas",
    descripcion:
      "Capacitación audiovisual sobre volteo, medición de humedad y almacenamiento del grano.",
    autor: "Centro de Beneficiado ACARO",
    fecha: "2026-02-03",
    link: "https://example.com/videos/secado-camas-africanas.mp4",
  },
  {
    id: 1008,
    titulo: "Reporte de precios internacionales del robusta",
    descripcion:
      "Análisis trimestral de cotizaciones, tendencias de exportación y oportunidades comerciales.",
    autor: "Área de Mercados",
    fecha: "2026-01-25",
    link: "https://example.com/documentos/precios-robusta.pdf",
  },
  {
    id: 1009,
    titulo: "Matriz de clasificación de defectos físicos v2.1",
    descripcion:
      "Estándar OBC para clasificar humedad, tamaño de zaranda y defectos primarios del café verde.",
    autor: "Consejo de Calidad OBC",
    fecha: "2026-01-12",
    link: "https://example.com/documentos/matriz-defectos.xlsx",
  },
  {
    id: 1010,
    titulo: "Guía para la conservación de fuentes de agua",
    descripcion:
      "Prácticas de protección de nacientes, manejo de aguas mieles y reducción del consumo en finca.",
    autor: "Programa de Sostenibilidad",
    fecha: "2025-12-14",
    link: "https://example.com/documentos/conservacion-agua.pdf",
  },
  {
    id: 1011,
    titulo: "Calculadora de costos de producción por hectárea",
    descripcion:
      "Herramienta para estimar mano de obra, insumos, rendimiento y punto de equilibrio.",
    autor: "Área de Gestión",
    fecha: "2025-11-28",
    link: "https://example.com/herramientas/calculadora-costos",
  },
  {
    id: 1012,
    titulo: "Buenas prácticas para el beneficiado húmedo",
    descripcion:
      "Manual para recepción, despulpado, lavado y gestión responsable de residuos del proceso.",
    autor: "Comité de Procesamiento",
    fecha: "2025-10-16",
    link: "https://example.com/documentos/beneficiado-humedo.pdf",
  },
  {
    id: 1013,
    titulo: "Norma de trazabilidad para lotes de café robusta",
    descripcion:
      "Requisitos mínimos de identificación, registro y seguimiento desde la finca hasta el comprador.",
    autor: "Consejo de Calidad OBC",
    fecha: "2025-09-05",
    link: "https://example.com/documentos/norma-trazabilidad.pdf",
  },
  {
    id: 1014,
    titulo: "Introducción a sistemas agroforestales",
    descripcion:
      "Video sobre selección de especies de sombra y diseño de arreglos para fincas sostenibles.",
    autor: "Programa de Sostenibilidad",
    fecha: "2025-07-21",
    link: "https://example.com/videos/sistemas-agroforestales.webm",
  },
  {
    id: 1015,
    titulo: "Boletín de oportunidades de exportación",
    descripcion:
      "Resumen de compradores, requisitos de acceso y tendencias de consumo para café robusta.",
    autor: "Área Comercial",
    fecha: "2025-05-30",
    link: "https://example.com/mercados/oportunidades-exportacion",
  },
];

// Conserva compatibilidad con el contador usado por el dashboard administrativo.
export const mockDocuments = mockLibraryRecords;
