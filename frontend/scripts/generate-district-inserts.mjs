import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const INPUT = resolve("public/data/panama-distritos.geojson");
const OUTPUT = resolve("sql/distritos-panama.generated.sql");

function escapeSql(value) {
  return String(value).replaceAll("'", "''");
}

async function main() {
  const geoJson = JSON.parse(await readFile(INPUT, "utf8"));

  if (
    geoJson?.type !== "FeatureCollection" ||
    !Array.isArray(geoJson.features) ||
    geoJson.features.length !== 82
  ) {
    throw new Error("El GeoJSON debe contener exactamente 82 distritos.");
  }

  const values = geoJson.features
    .map((feature) => {
      const properties = feature.properties ?? {};
      const code = String(properties.ID_Distrito ?? "").padStart(4, "0");
      const province = escapeSql(properties.Provincia ?? "");
      const district = escapeSql(properties.Distrito ?? "");

      return `('${escapeSql(code)}', '${province}', '${district}')`;
    })
    .join(",\n  ");

  const sql = `-- GENERADO DESDE panama-distritos.geojson\n` +
    `INSERT INTO distritos_panama (codigo_distrito, provincia, distrito)\n` +
    `VALUES\n  ${values}\n` +
    `ON DUPLICATE KEY UPDATE\n` +
    `  provincia = VALUES(provincia),\n` +
    `  distrito = VALUES(distrito);\n`;

  await writeFile(OUTPUT, sql, "utf8");
  console.log(`SQL creado: ${OUTPUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
