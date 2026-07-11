import {
  INTENSITY_LEVELS,
  MAP_HEIGHT,
  MAP_PADDING,
  MAP_WIDTH,
} from "./constants";
import type {
  DistrictFeature,
  DistrictFeatureCollection,
  DistrictGeometry,
  GeoJsonDistrictProperties,
  Position,
} from "./types";

export interface ProjectedDistrict {
  feature: DistrictFeature;
  districtId: string;
  path: string;
}

export interface Point {
  x: number;
  y: number;
}

export function normalizeDistrictCode(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return raw.padStart(4, "0");
}

export function getDistrictCode(
  properties: GeoJsonDistrictProperties,
): string {
  return normalizeDistrictCode(
    properties.ID_Distrito ?? properties.id_distrito,
  );
}

export function getDistrictName(
  properties: GeoJsonDistrictProperties,
): string {
  return String(
    properties.Distrito ?? properties.distrito ?? "Distrito",
  ).trim();
}

export function getProvinceName(
  properties: GeoJsonDistrictProperties,
): string {
  return String(
    properties.Provincia ?? properties.provincia ?? "",
  ).trim();
}

export function geometryPolygons(
  geometry: DistrictGeometry,
): Position[][][] {
  if (geometry.type === "Polygon") {
    return [geometry.coordinates as Position[][]];
  }
  return geometry.coordinates as Position[][][];
}

export function visitGeometryPoints(
  geometry: DistrictGeometry,
  visitor: (longitude: number, latitude: number) => void,
): void {
  for (const polygon of geometryPolygons(geometry)) {
    for (const ring of polygon) {
      for (const [longitude, latitude] of ring) {
        visitor(longitude, latitude);
      }
    }
  }
}

export function createProjector(
  collection: DistrictFeatureCollection,
  width = MAP_WIDTH,
  height = MAP_HEIGHT,
  padding = MAP_PADDING,
): (position: Position) => Point {
  let minLongitude = Number.POSITIVE_INFINITY;
  let minLatitude = Number.POSITIVE_INFINITY;
  let maxLongitude = Number.NEGATIVE_INFINITY;
  let maxLatitude = Number.NEGATIVE_INFINITY;

  for (const feature of collection.features) {
    visitGeometryPoints(feature.geometry, (longitude, latitude) => {
      minLongitude = Math.min(minLongitude, longitude);
      minLatitude = Math.min(minLatitude, latitude);
      maxLongitude = Math.max(maxLongitude, longitude);
      maxLatitude = Math.max(maxLatitude, latitude);
    });
  }

  if (
    !Number.isFinite(minLongitude) ||
    !Number.isFinite(minLatitude) ||
    !Number.isFinite(maxLongitude) ||
    !Number.isFinite(maxLatitude)
  ) {
    throw new Error("El GeoJSON no contiene coordenadas válidas.");
  }

  const geographicWidth = maxLongitude - minLongitude;
  const geographicHeight = maxLatitude - minLatitude;

  if (geographicWidth <= 0 || geographicHeight <= 0) {
    throw new Error("Los límites geográficos del GeoJSON son inválidos.");
  }

  const availableWidth = width - padding * 2;
  const availableHeight = height - padding * 2;
  const scale = Math.min(
    availableWidth / geographicWidth,
    availableHeight / geographicHeight,
  );

  const projectedWidth = geographicWidth * scale;
  const projectedHeight = geographicHeight * scale;
  const offsetX = (width - projectedWidth) / 2;
  const offsetY = (height - projectedHeight) / 2;

  return ([longitude, latitude]: Position): Point => ({
    x: offsetX + (longitude - minLongitude) * scale,
    y: height - (offsetY + (latitude - minLatitude) * scale),
  });
}

export function featureToSvgPath(
  feature: DistrictFeature,
  project: (position: Position) => Point,
): string {
  return geometryPolygons(feature.geometry)
    .map((polygon) =>
      polygon
        .map((ring) => {
          if (ring.length === 0) return "";

          return (
            ring
              .map((position, index) => {
                const point = project(position);
                const command = index === 0 ? "M" : "L";
                return `${command}${point.x.toFixed(2)},${point.y.toFixed(2)}`;
              })
              .join(" ") + " Z"
          );
        })
        .filter(Boolean)
        .join(" "),
    )
    .filter(Boolean)
    .join(" ");
}

export function projectDistricts(
  collection: DistrictFeatureCollection,
): ProjectedDistrict[] {
  const project = createProjector(collection);

  return collection.features.map((feature) => {
    const districtId = getDistrictCode(feature.properties);

    if (!districtId) {
      throw new Error(
        "Existe una geometría sin ID_Distrito. No se puede relacionar con la API.",
      );
    }

    return {
      feature,
      districtId,
      path: featureToSvgPath(feature, project),
    };
  });
}

export function getIntensityLevel(
  count: number,
  maximumCount: number,
  levels = INTENSITY_LEVELS,
): number {
  if (count <= 0 || maximumCount <= 0) return 0;

  const normalized = count / maximumCount;
  return Math.max(1, Math.min(levels, Math.ceil(normalized * levels)));
}

export function validateDistrictCollection(
  value: unknown,
): DistrictFeatureCollection {
  if (!value || typeof value !== "object") {
    throw new Error("El GeoJSON no es un objeto válido.");
  }

  const candidate = value as Partial<DistrictFeatureCollection>;

  if (
    candidate.type !== "FeatureCollection" ||
    !Array.isArray(candidate.features)
  ) {
    throw new Error("Se esperaba un GeoJSON FeatureCollection.");
  }

  if (candidate.features.length !== 82) {
    throw new Error(
      `Se esperaban 82 distritos y se recibieron ${candidate.features.length}.`,
    );
  }

  const codes = new Set<string>();

  for (const feature of candidate.features) {
    if (
      feature?.type !== "Feature" ||
      !feature.geometry ||
      !["Polygon", "MultiPolygon"].includes(feature.geometry.type)
    ) {
      throw new Error(
        "El GeoJSON contiene una geometría distinta de Polygon/MultiPolygon.",
      );
    }

    const code = getDistrictCode(feature.properties ?? {});
    if (!code) {
      throw new Error("Existe un distrito sin ID_Distrito.");
    }
    if (codes.has(code)) {
      throw new Error(`El código distrital ${code} está duplicado.`);
    }
    codes.add(code);
  }

  return candidate as DistrictFeatureCollection;
}

export function clampTooltipPosition(
  pointerX: number,
  pointerY: number,
  containerWidth: number,
  containerHeight: number,
  tooltipWidth = 210,
  tooltipHeight = 112,
  gap = 14,
): Point {
  const maxX = Math.max(gap, containerWidth - tooltipWidth - gap);
  const maxY = Math.max(gap, containerHeight - tooltipHeight - gap);

  return {
    x: Math.min(Math.max(gap, pointerX + gap), maxX),
    y: Math.min(Math.max(gap, pointerY + gap), maxY),
  };
}
