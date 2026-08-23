const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const { uploadRoot } = require('../config/uploads');

const UPLOAD_ROOT = uploadRoot;

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const PDF_EXTENSIONS = new Set(['.pdf']);
const DOCUMENT_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv',
  '.jpg', '.jpeg', '.png', '.webp',
]);

const MAGIC_SIGNATURES = {
  '.jpg': { offset: 0, bytes: Buffer.from([0xFF, 0xD8, 0xFF]) },
  '.jpeg': { offset: 0, bytes: Buffer.from([0xFF, 0xD8, 0xFF]) },
  '.png': { offset: 0, bytes: Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]) },
  '.webp': {
    check: buf =>
      buf.length >= 12 &&
      buf.slice(0, 4).toString('ascii') === 'RIFF' &&
      buf.slice(8, 12).toString('ascii') === 'WEBP',
  },
  '.pdf': { offset: 0, bytes: Buffer.from([0x25, 0x50, 0x44, 0x46]) },
  '.doc': { offset: 0, bytes: Buffer.from([0xD0, 0xCF, 0x11, 0xE0]) },
  '.xls': { offset: 0, bytes: Buffer.from([0xD0, 0xCF, 0x11, 0xE0]) },
  '.ppt': { offset: 0, bytes: Buffer.from([0xD0, 0xCF, 0x11, 0xE0]) },
  '.docx': { offset: 0, bytes: Buffer.from([0x50, 0x4B]) },
  '.xlsx': { offset: 0, bytes: Buffer.from([0x50, 0x4B]) },
  '.pptx': { offset: 0, bytes: Buffer.from([0x50, 0x4B]) },
  '.txt': null,
  '.csv': null,
};

const IMAGE_MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};
const RESPONSIVE_WIDTHS = [480, 768, 1200, 1920, 2560];
const MAX_INPUT_PIXELS = 45_000_000;

function validateMagicBytes(buffer, extension) {
  const sig = MAGIC_SIGNATURES[extension];
  if (sig === undefined) return false;
  if (sig === null) return true;
  if (sig.check) return sig.check(buffer);

  const slice = buffer.slice(sig.offset, sig.offset + sig.bytes.length);
  return slice.length === sig.bytes.length && slice.equals(sig.bytes);
}

function validateMimeType(mimeType, extension) {
  const expected = IMAGE_MIME_TYPES[extension];
  if (!expected) return true;
  return mimeType === expected;
}

function optimizedWidths(originalWidth) {
  const maxWidth = Math.min(originalWidth, RESPONSIVE_WIDTHS[RESPONSIVE_WIDTHS.length - 1]);
  const widths = RESPONSIVE_WIDTHS.filter(width => width <= maxWidth);
  if (!widths.includes(maxWidth)) widths.push(maxWidth);
  return widths;
}

async function saveOptimizedImageUpload({ buffer, subdir }) {
  const targetDir = path.join(UPLOAD_ROOT, subdir);
  const responsiveDir = path.join(targetDir, 'responsive');
  await fs.mkdir(responsiveDir, { recursive: true });

  const image = sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS }).rotate();
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) {
    const err = new Error('Imagen invalida');
    err.status = 400;
    throw err;
  }

  const widths = optimizedWidths(metadata.width);
  const maxWidth = widths[widths.length - 1];
  const baseName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  const variants = [];

  for (const width of widths) {
    const webpName = `${baseName}-${width}.webp`;
    const avifName = `${baseName}-${width}.avif`;
    const webpPath = path.join(responsiveDir, webpName);
    const avifPath = path.join(responsiveDir, avifName);

    await sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS })
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 86 })
      .toFile(webpPath);

    await sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS })
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .avif({ quality: 55, effort: 2 })
      .toFile(avifPath);

    variants.push(
      { format: 'webp', width, url: `/uploads/${subdir}/responsive/${webpName}` },
      { format: 'avif', width, url: `/uploads/${subdir}/responsive/${avifName}` }
    );
  }

  const canonicalName = `${baseName}-${maxWidth}.webp`;
  await fs.copyFile(
    path.join(responsiveDir, canonicalName),
    path.join(targetDir, canonicalName)
  );

  const canonicalStats = await fs.stat(path.join(targetDir, canonicalName));
  return {
    url: `/uploads/${subdir}/${canonicalName}`,
    savedName: canonicalName,
    mimeType: 'image/webp',
    sizeBytes: canonicalStats.size,
    extension: '.webp',
    originalWidth: metadata.width,
    originalHeight: metadata.height,
    width: maxWidth,
    variants,
  };
}

async function saveBase64Upload({ base64, fileName, subdir, maxBytes, allowedExtensions, messages = {} }) {
  const errorMessages = {
    required: 'Selecciona un archivo.',
    tooLarge: `El archivo supera el limite de ${Math.round(maxBytes / (1024 * 1024))} MB.`,
    invalidType: 'El formato del archivo no esta permitido.',
    invalidContent: 'El archivo no coincide con su tipo.',
    ...messages,
  };

  const match = String(base64 || '').match(/^data:([^;]+);base64,(.+)$/);
  if (!match || !fileName) {
    const err = new Error(errorMessages.required);
    err.status = 400;
    throw err;
  }

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > maxBytes) {
    const err = new Error(errorMessages.tooLarge);
    err.status = 413;
    throw err;
  }

  const extension = path.extname(fileName).slice(0, 20).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    const err = new Error(errorMessages.invalidType);
    err.status = 400;
    throw err;
  }

  if (!validateMimeType(match[1], extension)) {
    const err = new Error('El MIME type no coincide con la extension declarada');
    err.status = 400;
    throw err;
  }

  if (!validateMagicBytes(buffer, extension)) {
    const err = new Error(errorMessages.invalidContent);
    err.status = 400;
    throw err;
  }

  if (allowedExtensions === IMAGE_EXTENSIONS) {
    return saveOptimizedImageUpload({ buffer, subdir });
  }

  const savedName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;
  const targetDir = path.join(UPLOAD_ROOT, subdir);
  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(path.join(targetDir, savedName), buffer, { flag: 'wx' });

  return {
    url: `/uploads/${subdir}/${savedName}`,
    savedName,
    mimeType: match[1],
    sizeBytes: buffer.length,
    extension,
  };
}

module.exports = { saveBase64Upload, IMAGE_EXTENSIONS, PDF_EXTENSIONS, DOCUMENT_EXTENSIONS };
