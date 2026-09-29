function validateDocumentUrl(data, trustedFileUrl) {
  if (!('archivo_url' in data) || trustedFileUrl) return null;
  try {
    const url = new URL(data.archivo_url);
    if (!['http:', 'https:'].includes(url.protocol)) return 'El enlace debe ser una URL válida.';
    if (!url.pathname.toLowerCase().endsWith('.pdf')) return 'El enlace debe ser un PDF.';
  } catch {
    return 'El enlace debe ser una URL válida.';
  }
  return null;
}

function validateOptionalText(data) {
  for (const field of ['serie', 'descripcion', 'imagen_portada']) {
    if (field in data && data[field] !== null && typeof data[field] !== 'string') return `${field} debe ser texto`;
  }
  return null;
}

function validateReadingOrder(data) {
  for (const field of ['orden_lectura', 'orden_portada']) {
    if (!(field in data) || data[field] === null) continue;
    const value = Number(data[field]);
    if (!Number.isInteger(value) || value < 1) return `${field} debe ser un entero positivo`;
  }
  return null;
}

function validateDocumentMetadata(data, visibilities) {
  if ('visibilidad' in data && !visibilities.includes(data.visibilidad)) return 'visibilidad inválida';
  if ('etiquetas' in data && data.etiquetas !== null) {
    if (!Array.isArray(data.etiquetas) || data.etiquetas.some(tag => typeof tag !== 'string')) return 'etiquetas debe ser un arreglo de textos';
  }
  if ('destacado' in data && typeof data.destacado !== 'boolean') return 'destacado debe ser booleano';
  return validateOptionalText(data) || validateReadingOrder(data);
}

module.exports = { validateDocumentUrl, validateDocumentMetadata };
