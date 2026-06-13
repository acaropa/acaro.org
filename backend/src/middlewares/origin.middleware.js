function requireTrustedOrigin(req, res, next) {
  const origin = req.headers.origin;
  if (!origin) return next();

  const allowedOrigins = new Set([
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL,
    'https://acaro.org',
    'https://www.acaro.org',
  ].filter(Boolean));

  if (!allowedOrigins.has(origin)) {
    return res.status(403).json({ error: 'Origen no permitido' });
  }
  next();
}

module.exports = requireTrustedOrigin;
