import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const SOURCE_URL = "https://services2.arcgis.com/HRY6x8qt5qjGnAA9/ArcGIS/rest/services/Panama_Distritos_Boundaries_2024/FeatureServer/0/query?where=1%3D1&outFields=ID_Distrito%2CProvincia%2CDistrito&returnGeometry=true&outSR=4326&f=geojson";
const OUTPUT_FILE = resolve("public/data/panama-distritos.geojson");
const EXPECTED_DISTRICTS = 82;

function normalizeCode(value) {
  return String(value ?? "").trim().padStart(4, "0");
}

function cleanFeature(feature) {
  const properties = feature?.properties ?? {};

  return {
    type: "Feature",
    properties: {
      ID_Distrito: normalizeCode(
        properties.ID_Distrito ?? properties.id_distrito,
      ),
      Provincia: String(
        properties.Provincia ?? properties.provincia ?? "",
      ).trim(),
      Distrito: String(
        properties.Distrito ?? properties.distrito ?? "",
      ).trim(),
    },
    geometry: feature.geometry,
  };
}

async function main() {
  const response = await fetch(SOURCE_URL, {
    headers: {
      Accept: "application/geo+json, application/json",
      "User-Agent": "ACARO-OBC-Map-Builder/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(
      `ArcGIS respondió ${response.status} ${response.statusText}`,
    );
  }

  const raw = await response.json();

  if (raw?.type !== "FeatureCollection" || !Array.isArray(raw.features)) {
    throw new Error("La respuesta no es un FeatureCollection GeoJSON.");
  }

  const features = raw.features
    .filter((feature) => feature?.geometry)
    .map(cleanFeature)
    .sort((a, b) =>
      a.properties.ID_Distrito.localeCompare(
        b.properties.ID_Distrito,
      ),
    );

  const uniqueCodes = new Set(
    features.map((feature) => feature.properties.ID_Distrito),
  );

  if (features.length !== EXPECTED_DISTRICTS) {
    throw new Error(
      `Se esperaban ${EXPECTED_DISTRICTS} distritos y llegaron ${features.length}.`,
    );
  }

  if (uniqueCodes.size !== EXPECTED_DISTRICTS) {
    throw new Error(
      `Se esperaban ${EXPECTED_DISTRICTS} códigos únicos y llegaron ${uniqueCodes.size}.`,
    );
  }

  const output = {
    type: "FeatureCollection",
    name: "panama-distritos",
    attribution: "IGNTG-ANATI",
    features,
  };

  await mkdir(dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(
    OUTPUT_FILE,
    JSON.stringify(output),
    "utf8",
  );

  console.log(
    `GeoJSON creado correctamente: ${OUTPUT_FILE} (${features.length} distritos).`,
  );
}

main().catch((error) => {
  console.error("No se pudo generar el GeoJSON:", error);
  process.exitCode = 1;
});
