export interface LibraryRecord {
  id: number;
  titulo: string;
  descripcion: string | null;
  autor: string;
  fecha: string;
  link: string;
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
  resourceType: ResourceType;
  type: string;
  title: string;
  description: string;
  category: LibraryCategory;
  date: string;
  dateValue: string;
  year: string;
  contributor: string;
  meta: string;
  link: string;
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
  const pathname = (() => {
    try {
      return new URL(record.link).pathname.toLowerCase();
    } catch {
      return record.link.toLowerCase();
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
  const dateValue = record.fecha.slice(0, 10);

  return {
    id: record.id,
    resourceType,
    type,
    title: record.titulo,
    description,
    category: inferCategory(`${record.titulo} ${description}`),
    date: new Date(`${dateValue}T00:00:00`).toLocaleDateString("es-PA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    dateValue,
    year: dateValue.slice(0, 4),
    contributor: record.autor,
    meta: resourceType === "link" ? "Enlace externo" : "Abrir documento",
    link: record.link,
  };
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
  ].some(value => value.toLocaleLowerCase("es").includes(normalizedQuery));
}
