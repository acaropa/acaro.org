const { isIP } = require('node:net');

function isLocalOrigin(origin) {
  let url;
  try { url = new URL(origin); } catch { return false; }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return false;
  if (url.pathname !== '/' || url.search || url.hash) return false;
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return true;
  if (isIP(url.hostname) !== 4) return false;
  const [network, subnet] = url.hostname.split('.').map(Number);
  return network === 10 || (network === 192 && subnet === 168) || (network === 172 && subnet >= 16 && subnet <= 31);
}

module.exports = { isLocalOrigin };
