import { apiAssetUrl } from "./api";

export interface ProductorRecord {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagen_url: string | null;
  comunidad: string | null;
  rol: string | null;
  anios_experiencia: number | null;
  activo: boolean;
  destacado: boolean;
  creado_por?: number;
  created_at: string;
  updated_at?: string;
  creado_por_email?: string;
  creado_por_nombre?: string | null;
}

export function producerImage(record: Pick<ProductorRecord, "imagen_url">) {
  return apiAssetUrl(record.imagen_url) || "/assets/landing-hero-v2.jpg";
}

export function formatExperience(years: number | null | undefined) {
  if (years === null || years === undefined) return null;
  if (years === 1) return "1 año de experiencia";
  return `${years} años de experiencia`;
}

export function formatProducerDate(value: string) {
  return new Date(value).toLocaleDateString("es-PA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
