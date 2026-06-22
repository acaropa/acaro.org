export interface LibraryRecord {
  id: number;
  titulo: string;
  slug?: string;
  descripcion: string | null;
  archivo_url?: string;
  categoria?: string;
  imagen_portada?: string | null;
  fecha_creacion?: string;
  creado_por_email?: string;
  creado_por_nombre?: string | null;
  autor?: string;
  fecha?: string;
  link?: string;
  etiquetas?: string[] | string | null;
  serie?: string | null;
  orden_lectura?: number | null;
}

export type ResourceType = "pdf" | "video" | "link" | "doc";
export type LibraryCategory =
  | "Agronomía"
  | "Procesamiento"
  | "Mercados"
  | "Sostenibilidad"
  | "Estándares OBC";

export interface LibraryDocument {
  id: number;
  slug?: string;
  resourceType: ResourceType;
  type: string;
  title: string;
  description: string;
  category: string;
  coverImage: string | null;
  date: string;
  dateValue: string;
  year: string;
  contributor: string;
  meta: string;
  link: string;
  tags: string[];
  serie: string | null;
  ordenLectura: number | null;
}

export const libraryCategories: LibraryCategory[] = [
  "Agronomía",
  "Procesamiento",
  "Mercados",
  "Sostenibilidad",
  "Estándares OBC",
];

function inferCategory(text: string): LibraryCategory {
  const value = text.toLocaleLowerCase("es");

  if (/(mercado|precio|comercial|export|venta|costo)/.test(value)) return "Mercados";
  if (/(ferment|secado|beneficiado|proceso|poscosecha|tost)/.test(value)) {
    return "Procesamiento";
  }
  if (/(norma|estándar|estandar|calidad|clasificación|clasificacion|defecto|protocolo)/.test(value)) {
    return "Estándares OBC";
  }
  if (/(sosteni|clima|ambient|sombra|agua|conserv)/.test(value)) return "Sostenibilidad";
  return "Agronomía";
}

export function toLibraryDocument(record: LibraryRecord): LibraryDocument {
  const link = record.archivo_url || record.link || "";
  const pathname = (() => {
    try {
      return new URL(link).pathname.toLowerCase();
    } catch {
      return link.toLowerCase();
    }
  })();

  const resourceType: ResourceType = pathname.endsWith(".pdf")
    ? "pdf"
    : /\.(mp4|webm|mov)$/.test(pathname)
      ? "video"
      : /\.(doc|docx|odt|xlsx|xls)$/.test(pathname)
        ? "doc"
        : "link";

  const type =
    resourceType === "pdf"
      ? "Documento PDF"
      : resourceType === "video"
        ? "Recurso audiovisual"
        : resourceType === "doc"
          ? "Documento técnico"
          : "Recurso externo";
  const description =
    record.descripcion || "Recurso disponible en la biblioteca técnica de ACARO.";
  const dateValue = (record.fecha_creacion || record.fecha || new Date().toISOString()).slice(0, 10);

  return {
    id: record.id,
    slug: record.slug,
    resourceType,
    type,
    title: record.titulo,
    description,
    category: record.categoria || inferCategory(`${record.titulo} ${description}`),
    coverImage: record.imagen_portada || null,
    date: new Date(`${dateValue}T00:00:00`).toLocaleDateString("es-PA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    dateValue,
    year: dateValue.slice(0, 4),
    contributor: record.creado_por_nombre || record.creado_por_email || record.autor || "ACARO",
    meta: resourceType === "link" ? "Enlace externo" : "Abrir documento",
    link,
    tags: (() => {
      if (!record.etiquetas) return [];
      if (typeof record.etiquetas === 'string') {
        try { return JSON.parse(record.etiquetas); } catch { return []; }
      }
      return Array.isArray(record.etiquetas) ? record.etiquetas : [];
    })(),
    serie: record.serie || null,
    ordenLectura: record.orden_lectura ?? null,
  };
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  "Agronomía": "from-[#3d4b37] to-[#8a9c7c]",
  "Procesamiento": "from-[#6b4226] to-[#c98b4a]",
  "Mercados": "from-[#8a5c25] to-[#e3bc7e]",
  "Sostenibilidad": "from-[#1f3d2b] to-[#6fa384]",
  "Estándares OBC": "from-[#4a3c30] to-[#b7a89c]",
};
const DEFAULT_GRADIENT = "from-[#25160e] to-[#8a766a]";

export function categoryGradient(category: string) {
  return CATEGORY_GRADIENTS[category] || DEFAULT_GRADIENT;
}

export function matchesLibraryQuery(document: LibraryDocument, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase("es");
  if (!normalizedQuery) return true;

  return [
    document.title,
    document.description,
    document.type,
    document.category,
    document.contributor,
    ...(document.tags || []),
    document.serie || '',
  ].some(value => value.toLocaleLowerCase("es").includes(normalizedQuery));
}
