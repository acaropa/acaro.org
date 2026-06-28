const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  if (err.code === 'ENOENT' && req.path.includes('/uploads/')) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }

  const status = err.status || 500;
  const isDatabaseError =
    typeof err.code === 'string' &&
    (
      err.code.startsWith('ER_') ||
      ['ECONNREFUSED', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST'].includes(err.code)
    );

  if (status >= 500 || isDatabaseError) {
    logger.error(`${req.method} ${req.path} → ${err.stack || err}`, {
      requestId: req.requestId,
      ip: req.ip,
    });
  }

  if (isDatabaseError) {
    return res.status(503).json({
      error: 'No se pudo conectar con la base de datos. Intenta nuevamente más tarde.',
      requestId: req.requestId,
    });
  }

  const message =
    status >= 500 && process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message || 'Error interno del servidor';

  res.status(status).json({
    error: message,
    ...(req.requestId ? { requestId: req.requestId } : {}),
  });
}

module.exports = errorHandler;
