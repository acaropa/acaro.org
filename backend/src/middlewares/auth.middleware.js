const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { permissionsForRole } = require('../config/permissions');

async function loadActiveUser(payload) {
  const [rows] = await db.query(
    'SELECT id, email, role, activo FROM users WHERE id = ? LIMIT 1',
    [payload.id]
  );
  const user = rows[0];
  if (!user || !user.activo) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    permissions: permissionsForRole(user.role),
  };
}

async function verifyToken(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Autenticación requerida' });
  }

  let payload;
  try {
    payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  try {
    const user = await loadActiveUser(payload);
    if (!user) {
      return res.status(401).json({ error: 'La cuenta no existe o está desactivada' });
    }
    req.user = user;
    next();
  } catch (err) { next(err); }
}

function requirePermission(...permissions) {
  return (req, res, next) => {
    const allowed = permissions.some(permission => req.user?.permissions?.includes(permission));
    if (!allowed) {
      return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
    }
    next();
  };
}

async function optionalAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (header && header.startsWith('Bearer ')) {
    let payload;
    try {
      payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    } catch {
      req.user = null;
      return next();
    }
    try {
      req.user = await loadActiveUser(payload);
    } catch (err) { return next(err); }
  }
  next();
}

module.exports = { verifyToken, requirePermission, optionalAuth };
