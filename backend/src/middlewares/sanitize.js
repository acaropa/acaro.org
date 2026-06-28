const sanitizeHtml = require('sanitize-html');

// Campos que NUNCA se deben modificar: passwords y datos binarios base64
function isUntouchable(key) {
  const k = key.toLowerCase();
  return k.includes('password') || k.endsWith('_base64') || k === 'base64';
}

function cleanString(str) {
  return sanitizeHtml(str.trim(), { allowedTags: [], allowedAttributes: {} });
}

function sanitizeValue(key, value) {
  // Solo proteger strings cuyo campo sea binario/password — arrays y objetos siempre se recorren
  if (typeof value === 'string') return isUntouchable(key) ? value : cleanString(value);
  if (Array.isArray(value)) return value.map(item => sanitizeValue(key, item));
  if (value !== null && typeof value === 'object') return sanitizeObject(value);
  return value;
}

function sanitizeObject(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, sanitizeValue(k, v)])
  );
}

module.exports = function sanitize(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};
