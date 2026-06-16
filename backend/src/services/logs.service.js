const db = require('../config/db');

async function getAuditLogs({ limit = 200, module: modulo, search } = {}) {
  const cap = Math.min(Math.max(1, Number(limit) || 200), 1000);
  const conditions = ['1=1'];
  const params = [];

  if (modulo) {
    conditions.push('a.modulo = ?');
    params.push(modulo);
  }
  if (search) {
    conditions.push('(a.descripcion LIKE ? OR u.email LIKE ? OR a.accion LIKE ?)');
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  const [rows] = await db.query(
    `SELECT
       a.id,
       a.modulo,
       a.accion,
       a.descripcion,
       a.entidad_id,
       a.ip_address,
       a.created_at,
       u.email AS user_email,
       u.full_name AS user_name,
       u.role AS user_role
     FROM auditoria a
     LEFT JOIN users u ON u.id = a.user_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY a.created_at DESC
     LIMIT ?`,
    [...params, cap]
  );
  return rows;
}

async function getSessionLogs({ limit = 100 } = {}) {
  const cap = Math.min(Math.max(1, Number(limit) || 100), 500);
  const [rows] = await db.query(
    `SELECT
       s.id,
       s.ip_address,
       s.user_agent,
       s.created_at,
       s.last_used_at,
       s.revoked_at,
       s.expires_at,
       u.email AS user_email,
       u.full_name AS user_name,
       u.role AS user_role
     FROM user_sessions s
     LEFT JOIN users u ON u.id = s.user_id
     ORDER BY s.created_at DESC
     LIMIT ?`,
    [cap]
  );
  return rows;
}

async function getModules() {
  const [rows] = await db.query(
    'SELECT DISTINCT modulo FROM auditoria ORDER BY modulo ASC'
  );
  return rows.map(r => r.modulo);
}

module.exports = { getAuditLogs, getSessionLogs, getModules };
