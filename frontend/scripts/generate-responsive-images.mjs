import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const publicDir = path.resolve("public");
const manifestPath = path.join(publicDir, "responsive-images-manifest.json");

const targets = [
  "/assets/landing-hero-main.jpg",
  "/assets/landing-hero-v2.jpg",
  "/assets/login-bg-v2.jpg",
  "/assets/hero-bg.jpg",
  "/assets/library-hero-v2.png",
  "/assets/projects-fallback.jpg",
  "/assets/community-bg.jpg",
  "/assets/productores-card.jpg",
  "/assets/coffee-beans-texture.png",
  "/assets/biblioteca-card.jpg",
  "/assets/theme-proyectos.jpg",
  "/assets/theme-institucional.jpg",
  "/assets/theme-guias.jpg",
  "/assets/theme-formacion.jpg",
  "/coffee_farmers_survey.png",
];

const defaultWidths = [480, 768, 1200, 1920];
const fullBleedWidths = [480, 768, 1200, 1920, 2560];
const compactWidths = [480, 768, 1200];
const widthProfiles = {
  "/assets/landing-hero-main.jpg": fullBleedWidths,
  "/assets/landing-hero-v2.jpg": fullBleedWidths,
  "/assets/login-bg-v2.jpg": fullBleedWidths,
  "/assets/hero-bg.jpg": defaultWidths,
  "/assets/library-hero-v2.png": defaultWidths,
  "/assets/projects-fallback.jpg": defaultWidths,
  "/assets/community-bg.jpg": defaultWidths,
  "/assets/productores-card.jpg": defaultWidths,
  "/assets/coffee-beans-texture.png": defaultWidths,
  "/assets/biblioteca-card.jpg": defaultWidths,
  "/assets/theme-proyectos.jpg": compactWidths,
  "/assets/theme-institucional.jpg": compactWidths,
  "/assets/theme-guias.jpg": compactWidths,
  "/assets/theme-formacion.jpg": compactWidths,
  "/coffee_farmers_survey.png": fullBleedWidths,
};
const quality = {
  avif: 82,
  webp: 86,
  jpeg: 88,
  png: 88,
};
const assetQuality = {
  "/assets/landing-hero-main.jpg": {
    avif: 70,
    webp: 84,
  },
  "/assets/landing-hero-v2.jpg": {
    avif: 46,
    webp: 84,
  },
};

function publicPathToFile(src) {
  return path.join(publicDir, src.replace(/^\//, ""));
}

function variantPath(src, width, format) {
  const parsed = path.parse(src);
  return path.posix.join(parsed.dir, "responsive", `${parsed.name}-${width}.${format}`);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function generate() {
  const manifest = {};
  await fs.rm(path.join(publicDir, "assets", "responsive"), { recursive: true, force: true });
  await fs.rm(path.join(publicDir, "responsive"), { recursive: true, force: true });

  for (const src of targets) {
    const input = publicPathToFile(src);
    if (!(await fileExists(input))) continue;

    const metadata = await sharp(input).metadata();
    const originalWidth = metadata.width;
    const originalHeight = metadata.height;
    if (!originalWidth || !originalHeight) continue;

    const originalFormat = metadata.format === "jpeg" ? "jpg" : metadata.format;
    const candidates = widthProfiles[src] || defaultWidths;
    const maxGeneratedWidth = Math.min(originalWidth, Math.max(...candidates));
    const widths = candidates.filter(width => width <= maxGeneratedWidth);
    if (!widths.includes(maxGeneratedWidth)) widths.push(maxGeneratedWidth);

    const formats = ["avif", "webp"];
    const variants = {};

    for (const format of formats) {
      variants[format] = [];
      for (const width of widths) {
        const outputPublicPath = variantPath(src, width, format);
        const output = publicPathToFile(outputPublicPath);
        await fs.mkdir(path.dirname(output), { recursive: true });

        if (await fileExists(output)) {
          const stats = await fs.stat(output);
          variants[format].push({
            src: outputPublicPath,
            width,
            bytes: stats.size,
          });
          continue;
        }

        const formatQuality = assetQuality[src]?.[format] || quality[format];
        let pipeline = sharp(input).resize({ width, withoutEnlargement: true });
        if (format === "avif") pipeline = pipeline.avif({ quality: formatQuality, effort: 4 });
        if (format === "webp") pipeline = pipeline.webp({ quality: formatQuality });
        if (format === "jpg") pipeline = pipeline.jpeg({ quality: quality.jpeg, mozjpeg: true });
        if (format === "png") pipeline = pipeline.png({ quality: quality.png, compressionLevel: 9 });

        await pipeline.toFile(output);
        const stats = await fs.stat(output);
        variants[format].push({
          src: outputPublicPath,
          width,
          bytes: stats.size,
        });
      }
    }

    manifest[src] = {
      src,
      width: originalWidth,
      height: originalHeight,
      format: originalFormat,
      variants,
    };
  }

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Generated responsive image variants for ${Object.keys(manifest).length} assets.`);
}

generate().catch(error => {
  console.error(error);
  process.exit(1);
});
