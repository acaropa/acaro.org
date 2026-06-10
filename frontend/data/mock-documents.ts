export interface Document {
  id: string;
  title: string;
  category: string;
  date: string;
  size: string;
}

export const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Manual de Buenas Prácticas Agrícolas',
    category: 'Producción de café',
    date: '10 Ene, 2026',
    size: '2.4 MB'
  },
  {
    id: '2',
    title: 'Estatutos Asociación Café Robusta OBC',
    category: 'Documentos institucionales',
    date: '05 Mar, 2025',
    size: '1.1 MB'
  },
  {
    id: '3',
    title: 'Guía de Manejo de Plagas (Broca)',
    category: 'Manuales técnicos',
    date: '22 Feb, 2026',
    size: '3.5 MB'
  },
  {
    id: '4',
    title: 'Formulario de Afiliación 2026',
    category: 'Formularios',
    date: '01 Ene, 2026',
    size: '500 KB'
  }
];
