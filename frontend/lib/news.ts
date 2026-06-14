export interface NoticiaRecord {
  id: number;
  titulo: string;
  slug: string;
  resumen: string | null;
  contenido: string;
  categoria: string;
  imagen_portada: string | null;
  estado: "borrador" | "pendiente" | "publicada" | "archivada";
  visibilidad: "publica" | "interna";
  creado_por?: number;
  publicado_por?: number | null;
  fecha_creacion: string;
  fecha_publicacion: string | null;
  creado_por_email?: string;
}

export const newsCategories = [
  "Institucional",
  "Comercialización",
  "Tecnología",
  "Sostenibilidad",
  "Capacitación",
  "Comunidad",
  "General",
];

export function formatNoticiaDate(record: Pick<NoticiaRecord, "fecha_creacion" | "fecha_publicacion">) {
  const value = record.fecha_publicacion || record.fecha_creacion;
  return new Date(value).toLocaleDateString("es-PA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
