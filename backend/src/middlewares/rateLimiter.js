const rateLimit = require('express-rate-limit');

// Helper para leer límites configurables por env, con fallback a un valor por defecto.
function envInt(name, fallback) {
  const v = parseInt(process.env[name], 10);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

// ── Tráfico general público ────────────────────────────────────────────────────
const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: envInt('RATE_LIMIT_DEFAULT', 600),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta nuevamente en unos minutos.' },
  skip: req => req.path === '/api/health',
});

// ── Autenticación ──────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: envInt('RATE_LIMIT_LOGIN', 10),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Demasiados intentos fallidos. Intenta nuevamente en 15 minutos.' },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: envInt('RATE_LIMIT_REGISTER', 5),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados registros desde esta dirección. Intenta nuevamente más tarde.' },
});

// ── Recuperación de contraseña ─────────────────────────────────────────────────
const passwordRecoveryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: envInt('RATE_LIMIT_PASSWORD_RECOVERY', 5),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes de recuperación. Intenta nuevamente en 1 hora.' },
});

// ── Formulario de contacto ─────────────────────────────────────────────────────
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: envInt('RATE_LIMIT_CONTACT', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados mensajes de contacto. Intenta nuevamente más tarde.' },
});

// ── Subida de archivos ─────────────────────────────────────────────────────────
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: envInt('RATE_LIMIT_UPLOAD', 30),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas subidas de archivo. Intenta nuevamente en 1 hora.' },
});

// ── Respuestas de encuestas públicas ──────────────────────────────────────────
const surveyResponseLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: envInt('RATE_LIMIT_SURVEY_RESPONSE', 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas respuestas desde esta dirección. Intenta más tarde.' },
});

// ── Creación de encuestas ──────────────────────────────────────────────────────
const surveyCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: envInt('RATE_LIMIT_SURVEY_CREATE', 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas encuestas creadas. Intenta más tarde.' },
});

// ── Rutas administrativas sensibles ───────────────────────────────────────────
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: envInt('RATE_LIMIT_ADMIN', 200),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes administrativas. Intenta más tarde.' },
});

module.exports = {
  defaultLimiter,
  loginLimiter,
  registerLimiter,
  passwordRecoveryLimiter,
  contactLimiter,
  uploadLimiter,
  surveyResponseLimiter,
  surveyCreateLimiter,
  adminLimiter,
};
