const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { uploadRoot } = require('../config/uploads');

const UPLOAD_ROOT = uploadRoot;

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const PDF_EXTENSIONS = new Set(['.pdf']);
const DOCUMENT_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv',
  '.jpg', '.jpeg', '.png', '.webp',
]);

// Firmas binarias (magic bytes) por extensión.
// Cada entrada tiene `offset` y `bytes` para comparación directa,
// o una función `check(buffer)` para formatos más complejos.
const MAGIC_SIGNATURES = {
  '.jpg':  { offset: 0, bytes: Buffer.from([0xFF, 0xD8, 0xFF]) },
  '.jpeg': { offset: 0, bytes: Buffer.from([0xFF, 0xD8, 0xFF]) },
  '.png':  { offset: 0, bytes: Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]) },
  '.webp': {
    check: buf =>
      buf.length >= 12 &&
      buf.slice(0, 4).toString('ascii') === 'RIFF' &&
      buf.slice(8, 12).toString('ascii') === 'WEBP',
  },
  '.pdf':  { offset: 0, bytes: Buffer.from([0x25, 0x50, 0x44, 0x46]) }, // %PDF
  '.doc':  { offset: 0, bytes: Buffer.from([0xD0, 0xCF, 0x11, 0xE0]) }, // OLE2
  '.xls':  { offset: 0, bytes: Buffer.from([0xD0, 0xCF, 0x11, 0xE0]) },
  '.ppt':  { offset: 0, bytes: Buffer.from([0xD0, 0xCF, 0x11, 0xE0]) },
  // OOXML (.docx, .xlsx, .pptx) son archivos ZIP
  '.docx': { offset: 0, bytes: Buffer.from([0x50, 0x4B]) },
  '.xlsx': { offset: 0, bytes: Buffer.from([0x50, 0x4B]) },
  '.pptx': { offset: 0, bytes: Buffer.from([0x50, 0x4B]) },
  // Texto plano y CSV no tienen firma confiable; se omite la verificación
  '.txt':  null,
  '.csv':  null,
};

function validateMagicBytes(buffer, extension) {
  const sig = MAGIC_SIGNATURES[extension];
  if (sig === undefined) return false; // extensión desconocida → rechazar
  if (sig === null) return true;       // sin firma confiable → aceptar si extensión ya está en la whitelist
  if (sig.check) return sig.check(buffer);

  const slice = buffer.slice(sig.offset, sig.offset + sig.bytes.length);
  return slice.length === sig.bytes.length && slice.equals(sig.bytes);
}

async function saveBase64Upload({ base64, fileName, subdir, maxBytes, allowedExtensions, messages = {} }) {
  const errorMessages = {
    required: 'Selecciona un archivo.',
    tooLarge: `El archivo supera el límite de ${Math.round(maxBytes / (1024 * 1024))} MB.`,
    invalidType: 'El formato del archivo no está permitido.',
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

  // Verificar firma binaria real del archivo para detectar archivos renombrados.
  if (!validateMagicBytes(buffer, extension)) {
    const err = new Error(errorMessages.invalidContent);
    err.status = 400;
    throw err;
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
