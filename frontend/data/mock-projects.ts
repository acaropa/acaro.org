export type ProjectStatus = 'Planificación' | 'Fase 1 - Piloto' | 'Fase 2 - Ejecución' | 'Activo' | 'En seguimiento' | 'Finalizado';
export type LayoutStyle = 'hero-right' | 'hero-left' | 'wide' | 'standard' | 'solid' | 'half';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  date: string;
  category: string;
  imageUrl?: string;
  icon?: string;
  layoutStyle: LayoutStyle;
}

export const mockProjects: Project[] = [
  {
    id: 'p1',
    title: 'Renovación de Cultivos Sombra',
    description: 'Implementación de sistemas agroforestales para mejorar la calidad del suelo y preservar la biodiversidad local, asegurando la resiliencia climática de las fincas.',
    status: 'Activo',
    date: 'Enero 2026 - Presente',
    category: 'SOSTENIBILIDAD',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX53EWZLrpxVEIDP9ag-mYTWEYBOkx2rpaHacLlXKn-_CuM50Zll_7WTV4ZjVtr0hgaPYvHMw_Tak5B3hxm-PwE-CYb2N1zS_i9N0EuUbhSwCHYk5FDaq0AaKa2XEVMqYAT8xJB49kosoZfWU9_I-NiL-FixmHnaACebVXmOi8WWYllaKeWdKn11pTFcSuRKPqRGpdkuTx3dMgzOCLKb89sLQzLKEqKSx0tK2_W-Y3pCRnlisHV5cVz74x5IWiekGzrgd9wViuTKOU',
    layoutStyle: 'hero-right'
  },
  {
    id: 'p2',
    title: 'Infraestructura de Secado Solar',
    description: 'Construcción de marquesinas solares parabólicas para optimizar el proceso de secado del grano, reduciendo la dependencia de combustibles fósiles.',
    status: 'Fase 2 - Ejecución',
    date: 'Marzo 2026 - Presente',
    category: 'INFRAESTRUCTURA',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCffWxDTmDdalLSuh6Ey5MOvpIoZ7sWsPfIv3OEWPInS1QTKWBwwOHx_AJB-Fz3KyO2bH6CmEDZGdrelKkXzLHWk-2oINtSbDG1_0P5BsyBa-0O8Yb24-_8w0h1fPjLkbFYC0jfwsR7qRmtI4Oii34QCV9cHsKFqx7kKssLPoXD8qw7CniRk11PVZZ6srCIlffsHBpKCTtl4o8cx8bZ-6R3eToxnVkSJiAzaXVQ9yS6Z86iiMfmTOyuDIYGESve-gd4GI7ZXM2L4uOP',
    layoutStyle: 'wide'
  },
  {
    id: 'p3',
    title: 'Trazabilidad Blockchain',
    description: 'Implementación de un sistema de registro digital inmutable para garantizar la transparencia desde la finca hasta la taza, aumentando el valor en origen.',
    status: 'Fase 1 - Piloto',
    date: 'Febrero 2026 - Presente',
    category: 'TECNOLOGÍA',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmShSJK-WJK6aFURT2v7Ov2ubZqt0nl6yzJrch3ehzoqxO1B3W-nMQEIp-3nF4jgKxmZ3aw5oabROkFv3f2oRA-DL2cewJ3p3Hquut4FXnmlj3xAaQkmeGbM33H1rxtJlh5oW6HOsSB3zVPSXx22isCoMPwrE9hHMjXXzyU2UKHACht_aP9LTZcYN1tBCyK0CgRi3gTbof0B6JX_pjy5fVfvKY0vvHIfQlNbVRyLHsAQe-s1DLX8NTNR1NHr0xWPZRs2czHEUUhHhT',
    layoutStyle: 'standard'
  },
  {
    id: 'p4',
    title: 'Fondo de Resiliencia Comunitaria',
    description: 'Un mecanismo financiero diseñado para apoyar a las familias productoras frente a eventualidades climáticas extremas.',
    status: 'Activo',
    date: 'Enero 2026 - Presente',
    category: 'FINANZAS',
    icon: 'eco',
    layoutStyle: 'solid'
  },
  {
    id: 'p5',
    title: 'Mejoramiento Genético de Robusta',
    description: 'Investigación y desarrollo de nuevas variedades de café robusta con mayor resistencia a plagas y mejor rendimiento en taza.',
    status: 'Activo',
    date: 'Enero 2026 - Presente',
    category: 'INVESTIGACIÓN',
    imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=1600',
    layoutStyle: 'hero-left'
  },
  {
    id: 'p6',
    title: 'Capacitación en Poda Sostenible',
    description: 'Programa de formación técnica para más de 100 familias productoras enfocado en técnicas de poda y manejo de sombras.',
    status: 'En seguimiento',
    date: 'Marzo 2025 - Noviembre 2025',
    category: 'FORMACIÓN',
    imageUrl: 'https://images.unsplash.com/photo-1524350876685-274059332603?auto=format&fit=crop&q=80&w=800',
    layoutStyle: 'half'
  },
  {
    id: 'p7',
    title: 'Centro de Acopio Regional',
    description: 'Construcción del nuevo centro de acopio y procesamiento para garantizar la trazabilidad y calidad del grano verde.',
    status: 'Planificación',
    date: 'Inicio proyectado: Agosto 2026',
    category: 'INFRAESTRUCTURA',
    imageUrl: 'https://images.unsplash.com/photo-1596568359542-a2a9e22e9603?auto=format&fit=crop&q=80&w=800',
    layoutStyle: 'half'
  },
  {
    id: 'p8',
    title: 'Certificación de Fincas',
    description: 'Acompañamiento técnico para la obtención de sellos de calidad y sostenibilidad internacional para fincas asociadas.',
    status: 'Activo',
    date: 'Febrero 2026 - Presente',
    category: 'CALIDAD',
    icon: 'verified',
    layoutStyle: 'solid'
  }
];
