const app = require('./app');
const db = require('./config/db');
const logger = require('./utils/logger');
const { cleanupOldSessions } = require('./services/sessions.service');
const { uploadRoot } = require('./config/uploads');

const PORT = process.env.PORT || 3000;
const SESSION_CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

// ── Validación de arranque ─────────────────────────────────────────────────────
// Si falta una variable crítica, el proceso termina antes de aceptar conexiones.
function validateEnv() {
  const errors = [];
  const isProd = process.env.NODE_ENV === 'production';

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET debe tener al menos 32 caracteres');
  }
  if (!process.env.DB_HOST)     errors.push('DB_HOST no está definido');
  if (!process.env.DB_NAME)     errors.push('DB_NAME no está definido');
  if (!process.env.DB_USER)     errors.push('DB_USER no está definido');
  if (!process.env.DB_PASSWORD) errors.push('DB_PASSWORD no está definido');

  if (isProd) {
    if (!process.env.FRONTEND_URL) errors.push('FRONTEND_URL no está definido');
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 64) {
      logger.warn('JWT_SECRET tiene menos de 64 caracteres — se recomienda mínimo 64 para producción');
    }
  }

  if (errors.length > 0) {
    errors.forEach(e => logger.error(`[CONFIG] ${e}`));
    logger.error('El servidor no puede iniciarse con la configuración actual.');
    process.exit(1);
  }
}

validateEnv();

// ── Arranque ───────────────────────────────────────────────────────────────────
function runSessionCleanup() {
  cleanupOldSessions()
    .then(deleted => { if (deleted > 0) logger.info(`Deleted ${deleted} old user sessions`); })
    .catch(err => logger.error(`Could not clean old user sessions: ${err.message}`));
}

const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
  logger.info(`Uploads directory: ${uploadRoot}`);
  runSessionCleanup();
});

const sessionCleanupTimer = setInterval(runSessionCleanup, SESSION_CLEANUP_INTERVAL_MS);
sessionCleanupTimer.unref();

// ── Apagado graceful ───────────────────────────────────────────────────────────
function shutdown(signal) {
  logger.info(`${signal} received. Shutting down gracefully…`);
  clearInterval(sessionCleanupTimer);
  server.close(async () => {
    try { await db.end(); } catch { /* pool may already be closed */ }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
