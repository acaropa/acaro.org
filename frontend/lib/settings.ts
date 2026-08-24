import { api } from "@/lib/api";

export type LandingMetadataItem = {
  label: string;
  value: string;
};

export type LandingSettings = {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  metadata: LandingMetadataItem[];
};

export const defaultLandingSettings: LandingSettings = {
  heroTitle: "Asociación Café Robusta OBC",
  heroSubtitle:
    "Acompañamos el desarrollo del café robusta con organización, conocimiento técnico y visión productiva.",
  heroImage: "/assets/landing-hero-v2.jpg",
  metadata: [
    { label: "Altitud promedio", value: "0 - 800 msnm" },
    { label: "Precipitación anual", value: "2,000 - 3,000 mm" },
    { label: "Variedades", value: "Coffea canephora" },
    { label: "Estándar de calidad", value: "OBC Premium" },
  ],
};

export async function getLandingSettings() {
  try {
    const data = await api.get<Partial<LandingSettings>>("/settings/landing");
    return { ...defaultLandingSettings, ...data };
  } catch {
    return defaultLandingSettings;
  }
}

export type LibraryThemes = Record<string, string | null>;

export const defaultLibraryThemes: LibraryThemes = {
  Institucional: null,
  Proyectos: null,
  Formación: null,
  "Guías técnicas": null,
};

export async function getLibraryThemes(): Promise<LibraryThemes> {
  try {
    return await api.get<LibraryThemes>("/settings/library-themes");
  } catch {
    return defaultLibraryThemes;
  }
}
