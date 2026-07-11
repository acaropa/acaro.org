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
const mapaRoutes = require('./routes/mapa.routes');
const notasConceptualesRoutes = require('./routes/notasConceptuales.routes');
const logsRoutes = require('./routes/logs.routes');
const settingsRoutes = require('./routes/settings.routes');
const contactRoutes = require('./routes/contact.routes');
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

  // CSP completa para la API. Se listan todos los directives explícitamente
  // para que Helmet v8 no inyecte sus defaults (https: wildcard en font-src/style-src,
  // unsafe-inline en style-src). Una API pura no sirve HTML con recursos externos.
  contentSecurityPolicy: {
    directives: {
      defaultSrc:            ["'none'"],
      scriptSrc:             ["'self'"],
      scriptSrcAttr:         ["'none'"],
      styleSrc:              ["'self'"],
      fontSrc:               ["'self'"],
      imgSrc:                ["'self'"],
      connectSrc:            ["'self'"],
      objectSrc:             ["'none'"],
      baseUri:               ["'self'"],
      formAction:            ["'self'"],
      frameAncestors:        ["'none'"],
      upgradeInsecureRequests: [],
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

// Default: nunca cachear. Las rutas que sirven contenido público usan
// publicCache() o smartCache() para sobreescribir este header.
app.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'ACARO API' });
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
app.use('/api/mapa', mapaRoutes);
app.use('/api/notas-conceptuales', notasConceptualesRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/contacto', contactRoutes);
app.use('/api/encuestas', encuestasRoutes);

const uploadStaticOptions = { fallthrough: false, maxAge: '1d' };
const allowEmbedFromFrontend = (_req, res, next) => {
  res.removeHeader('X-Frame-Options');
  res.set('Content-Security-Policy', 'frame-ancestors https://acaro.org https://www.acaro.org');
  next();
};
app.use('/uploads', allowEmbedFromFrontend, express.static(uploadRoot, uploadStaticOptions));
app.use('/api/uploads', allowEmbedFromFrontend, express.static(uploadRoot, uploadStaticOptions));

app.use(errorHandler);

module.exports = app;
