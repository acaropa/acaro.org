const { createLogger, format, transports } = require('winston');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

const baseFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, stack, requestId, ...meta }) => {
    const rid = requestId ? ` [${requestId}]` : '';
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return stack
      ? `${timestamp} [${level.toUpperCase()}]${rid} ${message}\n${stack}${metaStr}`
      : `${timestamp} [${level.toUpperCase()}]${rid} ${message}${metaStr}`;
  })
);

const logger = createLogger({
  level: 'info',
  format: baseFormat,
  transports: [
    new transports.Console({
      format: isProd
        ? format.uncolorize()
        : format.combine(format.colorize(), format.simple()),
    }),
  ],
});

if (isProd) {
  const logsDir = path.join(__dirname, '../../logs');

  // Errores de aplicación
  logger.add(new transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
  }));

  // Log combinado general
  logger.add(new transports.File({
    filename: path.join(logsDir, 'combined.log'),
  }));

  // Eventos de seguridad (WAF, auth failures, rate limits, CORS violations)
  logger.add(new transports.File({
    filename: path.join(logsDir, 'security.log'),
    level: 'warn',
    format: format.combine(
      baseFormat,
      format.json(),
    ),
  }));
}

// Logger de auditoría: registra acciones de usuarios sobre recursos.
// Escribe en audit.log en producción y en consola en desarrollo.
const auditLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json(),
  ),
  transports: [
    ...(isProd
      ? [new transports.File({ filename: path.join(__dirname, '../../logs/audit.log') })]
      : [new transports.Console({ silent: true })]),
  ],
});

function audit({ userId, email, action, resource, resourceId, projectId, ip, success, details }) {
  auditLogger.info({
    type:       'audit',
    userId:     userId ?? null,
    email:      email ?? null,
    action,
    resource,
    resourceId: resourceId ?? null,
    projectId:  projectId ?? null,
    ip:         ip ?? null,
    success:    success !== false,
    details:    details ?? null,
  });
}

module.exports = logger;
module.exports.audit = audit;
