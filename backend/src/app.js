require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const crypto = require('crypto');

const { defaultLimiter } = require('./middlewares/rateLimiter');
const idempotency = require('./middlewares/idempotency.middleware');
const waf = require('./middlewares/waf');
const sanitize = require('./middlewares/sanitize');
const errorHandler = require('./middlewares/errorHandler');
const healthRoutes = require('./routes/health.routes');
const authRoutes   = require('./routes/auth.routes');
const sociosRoutes   = require('./routes/socios.routes');
const tecnicosRoutes  = require('./routes/tecnicos.routes');
const proyectosRoutes  = require('./routes/proyectos.routes');
const bibliotecaRoutes = require('./routes/biblioteca.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const noticiasRoutes = require('./routes/noticias.routes');
const productoresRoutes = require('./routes/productores.routes');
const notasConceptualesRoutes = require('./routes/notasConceptuales.routes');
const logsRoutes = require('./routes/logs.routes');
const encuestasRoutes = require('./routes/encuestas.routes');
const { uploadRoot } = require('./config/uploads');

const app = express();

// Hostinger/LiteSpeed terminates HTTPS before forwarding requests to Node.
// Trust one proxy hop so rate limiting uses the visitor IP instead of the proxy IP.
app.set('trust proxy', 1);

const isProd = process.env.NODE_ENV === 'production';

app.use(helmet({
  // El frontend carga imágenes y archivos desde api.acaro.org cross-origin.
  crossOriginResourcePolicy: false,

  // CSP mínima para una API pura; el frontend tiene su propia CSP.
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'none'"],
      imgSrc:         ["'self'"],
      connectSrc:     ["'self'"],
      frameAncestors: ["'none'"],
    },
  },

  frameguard: { action: 'deny' },

  // HSTS solo en producción (Hostinger gestiona el certificado TLS).
  hsts: isProd
    ? { maxAge: 31_536_000, includeSubDomains: true }
    : false,

  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

  // Previene MIME-sniffing en archivos servidos desde /uploads.
  noSniff: true,

  xssFilter: true,
}));

const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  'https://acaro.org',
  'https://www.acaro.org',
].filter(Boolean);

const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);

    if (isDev) {
      const isLocalIp = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin);
      if (isLocalIp) return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Asigna un ID único a cada petición para rastrear errores entre frontend y backend.
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.requestId = requestId;
  res.set('X-Request-Id', requestId);
  next();
});

app.use(morgan('dev'));
app.use(express.json({ limit: '12mb' }));
app.use(waf);
app.use(sanitize);
app.use(defaultLimiter);
app.use(idempotency);

// Garantiza que POST/PUT/PATCH/DELETE nunca sean cacheados por el CDN.
// Los GET públicos establecen sus propios headers Cache-Control en cada ruta.
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.set('Cache-Control', 'private, no-store, max-age=0');
  }
  next();
});

app.use('/api/health', healthRoutes);
app.use('/api/auth',   authRoutes);
app.use('/api/socios',   sociosRoutes);
app.use('/api/tecnicos',  tecnicosRoutes);
app.use('/api/proyectos',  proyectosRoutes);
app.use('/api/biblioteca', bibliotecaRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/noticias', noticiasRoutes);
app.use('/api/productores', productoresRoutes);
app.use('/api/notas-conceptuales', notasConceptualesRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/encuestas', encuestasRoutes);

const uploadStaticOptions = { fallthrough: false, maxAge: '1d' };
app.use('/uploads', express.static(uploadRoot, uploadStaticOptions));
app.use('/api/uploads', express.static(uploadRoot, uploadStaticOptions));

app.use(errorHandler);

module.exports = app;
