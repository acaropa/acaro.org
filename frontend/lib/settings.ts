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
  heroTitle: "Asociacion Cafe Robusta OBC",
  heroSubtitle:
    "Impulsamos el desarrollo del cafe robusta con organizacion, conocimiento tecnico y vision productiva.",
  heroImage: "/assets/landing-hero-v2.jpg",
  metadata: [
    { label: "Altitud Promedio", value: "0 - 800 msnm" },
    { label: "Precipitacion Anual", value: "2,000 - 3,000 mm" },
    { label: "Variedades", value: "Coffea canephora" },
    { label: "Estandar de Calidad", value: "OBC Premium" },
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
  Formacion: null,
  "Guias tecnicas": null,
};

export async function getLibraryThemes(): Promise<LibraryThemes> {
  try {
    return await api.get<LibraryThemes>("/settings/library-themes");
  } catch {
    return defaultLibraryThemes;
  }
}
