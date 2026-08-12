import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const inputPath = path.resolve("data/panama-distritos.raw.geojson");
const outputPath = path.resolve("public/data/panama-distritos-simplified.geojson");
const tolerance = Number(process.argv[2] ?? 0.0015);

function sqr(value) {
  return value * value;
}

function sqDistance(point, start, end) {
  let x = start[0];
  let y = start[1];
  let dx = end[0] - x;
  let dy = end[1] - y;

  if (dx !== 0 || dy !== 0) {
    const t = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = end[0];
      y = end[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  return sqr(point[0] - x) + sqr(point[1] - y);
}

function simplifyDPStep(points, first, last, sqTolerance, simplified) {
  let maxSqDistance = sqTolerance;
  let index = -1;

  for (let i = first + 1; i < last; i += 1) {
    const distance = sqDistance(points[i], points[first], points[last]);
    if (distance > maxSqDistance) {
      index = i;
      maxSqDistance = distance;
    }
  }

  if (index > -1) {
    if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
    simplified.push(points[index]);
    if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
  }
}

function simplifyRing(ring, sqTolerance) {
  if (ring.length <= 5) return ring;

  const lastPoint = ring[ring.length - 1];
  const closed = ring[0][0] === lastPoint[0] && ring[0][1] === lastPoint[1];
  const points = closed ? ring.slice(0, -1) : ring;

  if (points.length <= 4) return ring;

  const simplified = [points[0]];
  simplifyDPStep(points, 0, points.length - 1, sqTolerance, simplified);
  simplified.push(points[points.length - 1]);

  const result = closed ? [...simplified, simplified[0]] : simplified;
  return result.length >= 4 ? result : ring;
}

function simplifyGeometry(geometry, sqTolerance) {
  if (geometry.type === "Polygon") {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((ring) => simplifyRing(ring, sqTolerance)),
    };
  }

  return {
    ...geometry,
    coordinates: geometry.coordinates.map((polygon) =>
      polygon.map((ring) => simplifyRing(ring, sqTolerance)),
    ),
  };
}

function countPointsGeometry(geometry) {
  if (geometry.type === "Polygon") {
    return geometry.coordinates.reduce((total, ring) => total + ring.length, 0);
  }
  return geometry.coordinates.reduce(
    (total, polygon) => total + polygon.reduce((sum, ring) => sum + ring.length, 0),
    0,
  );
}

const source = JSON.parse(await readFile(inputPath, "utf8"));
const sqTolerance = tolerance * tolerance;
let before = 0;
let after = 0;

const simplified = {
  type: source.type,
  name: source.name,
  attribution: source.attribution,
  features: source.features.map((feature) => {
    before += countPointsGeometry(feature.geometry);
    const geometry = simplifyGeometry(feature.geometry, sqTolerance);
    after += countPointsGeometry(geometry);

    return {
      type: "Feature",
      properties: {
        ID_Distrito: feature.properties.ID_Distrito,
        Provincia: feature.properties.Provincia,
        Distrito: feature.properties.Distrito,
      },
      geometry,
    };
  }),
};

if (simplified.features.length !== 82) {
  throw new Error(`Expected 82 districts, got ${simplified.features.length}`);
}

await writeFile(outputPath, `${JSON.stringify(simplified)}\n`, "utf8");
console.log(`Simplified ${before.toLocaleString()} points to ${after.toLocaleString()} points.`);
console.log(`Wrote ${path.relative(process.cwd(), outputPath)} with tolerance ${tolerance}.`);