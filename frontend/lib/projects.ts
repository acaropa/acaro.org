import { apiAssetUrl } from "./api";
import type { Project, ProjectStatus, LayoutStyle } from "@/data/mock-projects";

export interface ProyectoTecnico {
  id: number;
  user_id: number;
  nombre: string;
  apellido: string;
  especialidad: string | null;
  fecha_asignacion: string;
}

export interface ProyectoFaseImagen {
  id: number;
  fase_id: number;
  url: string;
  descripcion: string | null;
}

export interface ProyectoFase {
  id: number;
  nombre: string;
  descripcion: string | null;
  orden: number;
  estado: string;
  porcentaje_avance: number;
  peso_porcentaje: number;
  responsable_id: number | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  imagenes: ProyectoFaseImagen[];
}

export interface ProyectoArchivo {
  id: number;
  fase_id: number | null;
  titulo: string;
  descripcion: string | null;
  tipo: string;
  archivo_url: string;
  extension: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
}

export interface ProyectoRecord {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  tipo: "publico" | "privado";
  clasificacion: string | null;
  imagen_portada: string | null;
  estado: "pendiente" | "en_progreso" | "completado" | "cancelado";
  fecha_inicio: string | null;
  fecha_fin: string | null;
  responsable_id?: number | null;
  supervisor_id: number | null;
  created_at: string;
  responsable_email?: string | null;
  responsable_nombre?: string | null;
  supervisor_email?: string | null;
  supervisor_nombre?: string | null;
  progreso?: number | null;
  tecnicos?: ProyectoTecnico[];
  fases?: ProyectoFase[];
  evidencias?: ProyectoArchivo[];
}

export const STATUS_MAP: Record<ProyectoRecord["estado"], ProjectStatus> = {
  pendiente: "Planificación",
  en_progreso: "Activo",
  completado: "Finalizado",
  cancelado: "Finalizado",
};

const LAYOUT_CYCLE: LayoutStyle[] = ["hero-right", "wide", "standard", "half", "hero-left", "solid"];

export function formatMonthYear(value: string) {
  const formatted = new Date(value).toLocaleDateString("es-PA", { month: "long", year: "numeric" });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatProjectDate(proyecto: ProyectoRecord) {
  if (!proyecto.fecha_inicio) return "";
  const start = formatMonthYear(proyecto.fecha_inicio);
  if (proyecto.estado === "completado") {
    return proyecto.fecha_fin ? `${start} - ${formatMonthYear(proyecto.fecha_fin)}` : start;
  }
  if (proyecto.estado === "pendiente") {
    return `Inicio proyectado: ${start}`;
  }
  return `${start} - Presente`;
}

export function toProjectCard(proyecto: ProyectoRecord, index: number): Project {
  return {
    id: String(proyecto.id),
    slug: proyecto.slug,
    title: proyecto.nombre,
    description: proyecto.descripcion || "",
    status: STATUS_MAP[proyecto.estado] || "Planificación",
    date: formatProjectDate(proyecto),
    category: (proyecto.clasificacion || "General").toUpperCase(),
    imageUrl: apiAssetUrl(proyecto.imagen_portada) || undefined,
    layoutStyle: LAYOUT_CYCLE[index % LAYOUT_CYCLE.length],
    progress: proyecto.progreso ?? null,
    responsable: proyecto.responsable_nombre || proyecto.responsable_email || null,
  };
}
