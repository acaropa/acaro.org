function isContactEmail(value) {
  if (typeof value !== 'string' || value.length > 254 || /\s/.test(value)) return false;
  const parts = value.split('@');
  if (parts.length !== 2 || !parts[0] || parts[0].length > 64) return false;
  const labels = parts[1].split('.');
  return labels.length > 1 && labels.every(label => label.length > 0 && label.length <= 63);
}

module.exports = { isContactEmail };
