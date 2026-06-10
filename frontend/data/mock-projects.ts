export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'Planificación' | 'Activo' | 'En seguimiento' | 'Finalizado';
  date: string;
  category: string;
}

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Mejoramiento Genético de Robusta',
    description: 'Investigación y desarrollo de nuevas variedades de café robusta con mayor resistencia a plagas y mejor rendimiento en taza.',
    status: 'Activo',
    date: 'Enero 2026 - Presente',
    category: 'Investigación'
  },
  {
    id: '2',
    title: 'Capacitación en Poda Sostenible',
    description: 'Programa de formación técnica para más de 100 familias productoras enfocado en técnicas de poda y manejo de sombras.',
    status: 'En seguimiento',
    date: 'Marzo 2025 - Noviembre 2025',
    category: 'Formación'
  },
  {
    id: '3',
    title: 'Centro de Acopio Regional',
    description: 'Construcción del nuevo centro de acopio y procesamiento para garantizar la trazabilidad y calidad del grano verde.',
    status: 'Planificación',
    date: 'Inicio proyectado: Agosto 2026',
    category: 'Infraestructura'
  },
  {
    id: '4',
    title: 'Certificación de Fincas',
    description: 'Acompañamiento técnico para la obtención de sellos de calidad y sostenibilidad internacional para fincas asociadas.',
    status: 'Activo',
    date: 'Febrero 2026 - Presente',
    category: 'Calidad'
  }
];
