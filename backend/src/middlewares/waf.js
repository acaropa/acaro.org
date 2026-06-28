const logger = require('../utils/logger');

// Patrones de ataque XSS en URLs/query params
const XSS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /vbscript:/i,
  /on\w+\s*=/i,         // onerror=, onload=, onclick=, etc.
  /<iframe/i,
  /<object/i,
  /<embed/i,
  /data:text\/html/i,
];

// Patrones de inyección SQL en URLs/query params
const SQLI_PATTERNS = [
  /'\s*(or|and)\s*['"\d]/i,   // ' OR '1  /  ' OR 1
  /union\s+(all\s+)?select/i,
  /drop\s+(table|database)/i,
  /delete\s+from/i,
  /insert\s+into/i,
  /;\s*(drop|delete|insert|update|select)/i,
];

// Patrones de path traversal
const TRAVERSAL_PATTERNS = [
  /\.\.[/\\]/,          // ../  ..\
  /%2e%2e[%2f%5c]/i,   // URL-encoded ../
  /\0/,                  // null byte
];

// Herramientas de ataque conocidas por su User-Agent
const ATTACK_TOOLS = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /burp\s*suite/i,
  /dirbuster/i,
  /nessus/i,
  /openvas/i,
  /w3af/i,
  /havij/i,
  /acunetix/i,
  /zgrab/i,
];

function matches(str, patterns) {
  return patterns.some(p => p.test(str));
}

module.exports = function waf(req, res, next) {
  const ip   = req.ip || 'unknown';
  const path = req.path || '';
  const ua   = req.headers['user-agent'] || '';
  const query = JSON.stringify(req.query || {});

  // 1. Herramientas de ataque por User-Agent → bloquear
  if (matches(ua, ATTACK_TOOLS)) {
    logger.warn(`WAF [bad-ua] ${req.method} ${path} ua="${ua}" ip=${ip}`);
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  // 2. Path traversal en la URL → bloquear
  if (matches(path, TRAVERSAL_PATTERNS)) {
    logger.warn(`WAF [traversal] ${req.method} ${path} ip=${ip}`);
    return res.status(400).json({ error: 'Solicitud inválida' });
  }

  // 3. XSS en query params → bloquear (no pasan por sanitize.js)
  if (matches(query, XSS_PATTERNS)) {
    logger.warn(`WAF [xss-query] ${req.method} ${path} query=${query} ip=${ip}`);
    return res.status(400).json({ error: 'Solicitud inválida' });
  }

  // 4. SQLi en query params → bloquear
  if (matches(query, SQLI_PATTERNS)) {
    logger.warn(`WAF [sqli-query] ${req.method} ${path} query=${query} ip=${ip}`);
    return res.status(400).json({ error: 'Solicitud inválida' });
  }

  // 5. XSS o SQLi detectado en body → solo registrar (sanitize.js ya lo limpia antes de guardarlo)
  if (req.body && typeof req.body === 'object') {
    const body = JSON.stringify(req.body);
    if (matches(body, XSS_PATTERNS)) {
      logger.warn(`WAF [xss-body] ${req.method} ${path} ip=${ip}`);
    } else if (matches(body, SQLI_PATTERNS)) {
      logger.warn(`WAF [sqli-body] ${req.method} ${path} ip=${ip}`);
    }
  }

  next();
};
