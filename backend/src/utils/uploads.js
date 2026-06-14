const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const DOCUMENT_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv',
  '.jpg', '.jpeg', '.png', '.webp',
]);

async function saveBase64Upload({ base64, fileName, subdir, maxBytes, allowedExtensions }) {
  const match = String(base64 || '').match(/^data:([^;]+);base64,(.+)$/);
  if (!match || !fileName) {
    const err = new Error('Archivo y nombre son requeridos');
    err.status = 400;
    throw err;
  }

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > maxBytes) {
    const err = new Error(`El archivo supera el límite de ${Math.round(maxBytes / (1024 * 1024))} MB`);
    err.status = 413;
    throw err;
  }

  const extension = path.extname(fileName).slice(0, 20).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    const err = new Error('Tipo de archivo no permitido');
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

module.exports = { saveBase64Upload, IMAGE_EXTENSIONS, DOCUMENT_EXTENSIONS };
