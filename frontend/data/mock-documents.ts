export interface Document {
  id: string;
  resourceType: 'pdf' | 'video' | 'link' | 'doc';
  type: string;
  title: string;
  description: string;
  category: string;
  date: string;
  contributor: string;
  meta: string;
  featured?: boolean;
}

export const documentCategories = ['Todos', 'Producción', 'Calidad', 'Organización', 'Comercialización', 'Investigación'];

export const mockDocuments: Document[] = [
  {
    id: '1', resourceType: 'pdf', type: 'Manual',
    title: 'Manual de Buenas Prácticas Agrícolas',
    description: 'Protocolo de manejo agronómico para el cultivo de café robusta: suelos, sombra, nutrición y cosecha.',
    category: 'Producción', date: '10 Ene, 2026', contributor: 'ACARO', meta: '2.4 MB', featured: true,
  },
  {
    id: '2', resourceType: 'pdf', type: 'Guía técnica',
    title: 'Guía de Manejo de Plagas — Broca del café',
    description: 'Estrategias de monitoreo y control integrado de la broca para reducir pérdidas en finca.',
    category: 'Producción', date: '22 Feb, 2026', contributor: 'Comité Técnico', meta: '3.5 MB', featured: true,
  },
  {
    id: '3', resourceType: 'pdf', type: 'Investigación',
    title: 'Perfil de taza del Robusta Fino regional',
    description: 'Resultados del estudio sensorial de micro-lotes y su potencial en mercados de especialidad.',
    category: 'Calidad', date: '18 Mar, 2026', contributor: 'Laboratorio de Calidad', meta: '5.1 MB', featured: true,
  },
  {
    id: '4', resourceType: 'pdf', type: 'Documento',
    title: 'Estatutos — Asociación Café Robusta OBC',
    description: 'Marco normativo, derechos y deberes de las y los asociados de la organización.',
    category: 'Organización', date: '05 Mar, 2025', contributor: 'Junta Directiva', meta: '1.1 MB',
  },
  {
    id: '5', resourceType: 'video', type: 'Capacitación',
    title: 'Técnicas de Poda y Manejo de Sombra',
    description: 'Video formativo grabado en finca demostrativa para productores asociados.',
    category: 'Producción', date: '02 Feb, 2026', contributor: 'Ing. M. Quirós', meta: '12 min',
  },
  {
    id: '6', resourceType: 'link', type: 'Guía técnica',
    title: 'Calculadora de Costos de Producción',
    description: 'Hoja de cálculo en línea para estimar costos por hectárea y el punto de equilibrio.',
    category: 'Comercialización', date: '14 Ene, 2026', contributor: 'Área de Gestión', meta: 'Enlace externo',
  },
  {
    id: '7', resourceType: 'pdf', type: 'Manual',
    title: 'Protocolo de Beneficiado y Secado',
    description: 'Buenas prácticas de procesamiento húmedo y seco para preservar la calidad del grano.',
    category: 'Calidad', date: '20 Dic, 2025', contributor: 'Comité Técnico', meta: '2.0 MB',
  },
  {
    id: '8', resourceType: 'link', type: 'Investigación',
    title: 'Portal de Precios Internacionales del Robusta',
    description: 'Referencia de cotizaciones diarias del mercado internacional para la planeación comercial.',
    category: 'Comercialización', date: '08 Dic, 2025', contributor: 'Área Comercial', meta: 'Enlace externo',
  },
  {
    id: '9', resourceType: 'pdf', type: 'Documento',
    title: 'Acta de Asamblea General 2025',
    description: 'Resoluciones y acuerdos de la asamblea anual de las y los asociados.',
    category: 'Organización', date: '15 Nov, 2025', contributor: 'Secretaría', meta: '780 KB',
  },
];
