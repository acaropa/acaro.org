import type { ActorTypeOption } from "./types";

export const DEFAULT_API_BASE_URL = "/api/mapa/cadena-valor";
export const DEFAULT_GEOJSON_URL = "/data/panama-distritos-simplified.geojson";

export const FALLBACK_FILTERS: ActorTypeOption[] = [
  { code: "todos", label: "Todos" },
  { code: "productor", label: "Productores" },
  { code: "comercializador", label: "Comercializadores" },
  { code: "procesador", label: "Procesadores" },
  { code: "viverista", label: "Viveristas" },
  { code: "tostador", label: "Tostadores" },
  { code: "transportista", label: "Transportistas" },
  { code: "proveedor", label: "Proveedores" },
  { code: "investigador", label: "Investigadores" },
  { code: "institucion", label: "Instituciones" },
  { code: "aliado", label: "Aliados" },
];

export const MAP_WIDTH = 1280;
export const MAP_HEIGHT = 560;
export const MAP_PADDING = 34;
export const INTENSITY_LEVELS = 5;
