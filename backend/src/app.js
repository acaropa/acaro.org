require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const { defaultLimiter } = require('./middlewares/rateLimiter');
const idempotency = require('./middlewares/idempotency.middleware');
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
const settingsRoutes = require('./routes/settings.routes');
const contactRoutes = require('./routes/contact.routes');
const encuestasRoutes = require('./routes/encuestas.routes');
const { cleanupOldSessions } = require('./services/sessions.service');
const { uploadRoot } = require('./config/uploads');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

// Hostinger/LiteSpeed terminates HTTPS before forwarding requests to Node.
// Trust one proxy hop so rate limiting uses the visitor IP instead of the proxy IP.
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: false, frameguard: false }));
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
app.use(morgan('dev'));
app.use(express.json({ limit: '12mb' }));
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
app.use('/api/settings', settingsRoutes);
app.use('/api/contacto', contactRoutes);
app.use('/api/encuestas', encuestasRoutes);
const uploadStaticOptions = {
  fallthrough: false,
  maxAge: '1d',
};
app.use('/uploads', express.static(uploadRoot, uploadStaticOptions));
app.use('/api/uploads', express.static(uploadRoot, uploadStaticOptions));

app.use(errorHandler);

function runSessionCleanup() {
  cleanupOldSessions()
    .then(deleted => {
      if (deleted > 0) console.log(`Deleted ${deleted} old user sessions`);
    })
    .catch(err => console.error('Could not clean old user sessions:', err.message));
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Uploads directory: ${uploadRoot}`);
  runSessionCleanup();
});

const sessionCleanupTimer = setInterval(runSessionCleanup, SESSION_CLEANUP_INTERVAL_MS);
sessionCleanupTimer.unref();

module.exports = app;
