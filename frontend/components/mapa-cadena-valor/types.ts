export type ActorTypeCode = string;

export interface ActorTypeOption {
  code: ActorTypeCode;
  label: string;
}

export interface DistrictMapDatum {
  codigoDistrito: string;
  provincia: string;
  distrito: string;
  cantidad: number;
}

export interface ValueChainMapResponse {
  tipo: ActorTypeCode;
  totalActores: number;
  distritos: DistrictMapDatum[];
  filtros?: ActorTypeOption[];
  meta?: {
    mode?: "DEMO" | "DATABASE";
    generatedAt?: string;
  };
}

export interface GeoJsonDistrictProperties {
  ID_Distrito?: string | number;
  Provincia?: string;
  Distrito?: string;
  id_distrito?: string | number;
  provincia?: string;
  distrito?: string;
}

export type Position = [number, number];
export type LinearRing = Position[];
export type PolygonCoordinates = LinearRing[];
export type MultiPolygonCoordinates = PolygonCoordinates[];

export interface DistrictGeometry {
  type: "Polygon" | "MultiPolygon";
  coordinates: PolygonCoordinates | MultiPolygonCoordinates;
}

export interface DistrictFeature {
  type: "Feature";
  properties: GeoJsonDistrictProperties;
  geometry: DistrictGeometry;
}

export interface DistrictFeatureCollection {
  type: "FeatureCollection";
  features: DistrictFeature[];
}

export interface SelectedDistrict {
  districtId: string;
  district: string;
  province: string;
  count: number;
}

export interface TooltipModel extends SelectedDistrict {
  x: number;
  y: number;
}

export interface PanamaValueChainMapProps {
  apiBaseUrl?: string;
  geoJsonUrl?: string;
  title?: string;
  description?: string;
  eyebrow?: string;
  initialFilter?: ActorTypeCode;
  onDistrictClick?: (district: SelectedDistrict) => void;
}
