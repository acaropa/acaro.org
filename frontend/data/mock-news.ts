export interface News {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: string;
  content?: string;
}

export const mockNews: News[] = [
  {
    id: '1',
    title: 'Asamblea Anual 2026: Nuevos retos para el Robusta',
    summary: 'La Asociación Café Robusta OBC celebra su asamblea anual definiendo las líneas estratégicas de exportación para este año.',
    date: '15 Mayo, 2026',
    category: 'Institucional'
  },
  {
    id: '2',
    title: 'Nuevas alianzas para exportación a Europa',
    summary: 'Se ha firmado un preacuerdo comercial que permitirá enviar micro-lotes de robusta de especialidad a tostadores europeos.',
    date: '02 Abril, 2026',
    category: 'Comercialización'
  },
  {
    id: '3',
    title: 'Lanzamiento de plataforma de trazabilidad',
    summary: 'Iniciamos la marcha blanca de nuestra nueva herramienta digital para monitorear la calidad desde la finca hasta la taza.',
    date: '20 Marzo, 2026',
    category: 'Tecnología'
  }
];
