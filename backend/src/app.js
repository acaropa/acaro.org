require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const { defaultLimiter } = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');
const healthRoutes = require('./routes/health.routes');
const authRoutes   = require('./routes/auth.routes');
const sociosRoutes   = require('./routes/socios.routes');
const tecnicosRoutes  = require('./routes/tecnicos.routes');
const proyectosRoutes  = require('./routes/proyectos.routes');
const bibliotecaRoutes = require('./routes/biblioteca.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const noticiasRoutes = require('./routes/noticias.routes');
const { cleanupOldSessions } = require('./services/sessions.service');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

// Hostinger/LiteSpeed terminates HTTPS before forwarding requests to Node.
// Trust one proxy hop so rate limiting uses the visitor IP instead of the proxy IP.
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
    'https://acaro.org',
    'https://www.acaro.org',
  ].filter(Boolean),
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(defaultLimiter);

app.use('/api/health', healthRoutes);
app.use('/api/auth',   authRoutes);
app.use('/api/socios',   sociosRoutes);
app.use('/api/tecnicos',  tecnicosRoutes);
app.use('/api/proyectos',  proyectosRoutes);
app.use('/api/biblioteca', bibliotecaRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/noticias', noticiasRoutes);

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
  runSessionCleanup();
});

const sessionCleanupTimer = setInterval(runSessionCleanup, SESSION_CLEANUP_INTERVAL_MS);
sessionCleanupTimer.unref();

module.exports = app;
