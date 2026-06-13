const crypto = require('crypto');
const db = require('../config/db');

const REFRESH_COOKIE = 'acaro_refresh';
const SESSION_HOURS = Number(process.env.SESSION_HOURS || 8);

function createRefreshToken() {
  return crypto.randomBytes(48).toString('base64url');
}

function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function parseRefreshToken(token) {
  const separator = token?.indexOf('.');
  if (!separator) return null;
  const sessionId = Number(token.slice(0, separator));
  const secret = token.slice(separator + 1);
  if (!Number.isInteger(sessionId) || sessionId <= 0 || !secret) return null;
  return { sessionId, secret };
}

function hashesMatch(left, right) {
  if (!left || !right || left.length !== right.length) return false;
  return crypto.timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

function sessionExpiry() {
  return new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
  };
}

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, cookieOptions());
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, cookieOptions());
}

async function createSession(userId, req) {
  const secret = createRefreshToken();
  const [result] = await db.query(
    `INSERT INTO user_sessions
      (user_id, refresh_token_hash, user_agent, ip_address, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    [
      userId,
      hashRefreshToken(secret),
      String(req.headers['user-agent'] || '').slice(0, 500) || null,
      req.ip || null,
      sessionExpiry(),
    ]
  );
  return { id: result.insertId, refreshToken: `${result.insertId}.${secret}` };
}

async function rotateSession(refreshToken, req) {
  const parsed = parseRefreshToken(refreshToken);
  if (!parsed) return null;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(
      `SELECT s.id, s.user_id, s.refresh_token_hash,
              s.previous_token_hash, s.rotated_at,
              s.expires_at, s.revoked_at,
              u.email, u.role, u.activo
       FROM user_sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?
       LIMIT 1
       FOR UPDATE`,
      [parsed.sessionId]
    );
    const session = rows[0];
    if (
      !session ||
      session.revoked_at ||
      !session.activo ||
      new Date(session.expires_at).getTime() <= Date.now()
    ) {
      await conn.rollback();
      return null;
    }

    const requestHash = hashRefreshToken(parsed.secret);
    const matchesCurrent = hashesMatch(session.refresh_token_hash, requestHash);
    const matchesPrevious = hashesMatch(session.previous_token_hash, requestHash);
    const rotatedRecently = Boolean(
      session.rotated_at &&
      Date.now() - new Date(session.rotated_at).getTime() < 10_000
    );

    if (!matchesCurrent && !(matchesPrevious && rotatedRecently)) {
      if (rotatedRecently) {
        await conn.rollback();
        return { retry: true };
      }
      await conn.query(
        'UPDATE user_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE id = ?',
        [session.id]
      );
      await conn.commit();
      return null;
    }

    const nextSecret = createRefreshToken();
    await conn.query(
      `UPDATE user_sessions
       SET previous_token_hash = refresh_token_hash,
           refresh_token_hash = ?, rotated_at = CURRENT_TIMESTAMP,
           last_used_at = CURRENT_TIMESTAMP,
           user_agent = ?, ip_address = ?
       WHERE id = ?`,
      [
        hashRefreshToken(nextSecret),
        String(req.headers['user-agent'] || '').slice(0, 500) || null,
        req.ip || null,
        session.id,
      ]
    );
    await conn.commit();
    return {
      id: session.id,
      refreshToken: `${session.id}.${nextSecret}`,
      user: {
        id: session.user_id,
        email: session.email,
        role: session.role,
        activo: Boolean(session.activo),
      },
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getActiveSession(sessionId, userId) {
  const [rows] = await db.query(
    `SELECT id
     FROM user_sessions
     WHERE id = ? AND user_id = ? AND revoked_at IS NULL
       AND expires_at > CURRENT_TIMESTAMP
     LIMIT 1`,
    [sessionId, userId]
  );
  return rows[0] || null;
}

async function revokeSessionByRefreshToken(refreshToken) {
  const parsed = parseRefreshToken(refreshToken);
  if (!parsed) return;
  const [rows] = await db.query(
    'SELECT refresh_token_hash FROM user_sessions WHERE id = ? LIMIT 1',
    [parsed.sessionId]
  );
  if (!hashesMatch(rows[0]?.refresh_token_hash, hashRefreshToken(parsed.secret))) return;
  await db.query(
    `UPDATE user_sessions
     SET revoked_at = COALESCE(revoked_at, CURRENT_TIMESTAMP)
     WHERE id = ?`,
    [parsed.sessionId]
  );
}

async function revokeSessionById(sessionId, userId) {
  await db.query(
    `UPDATE user_sessions
     SET revoked_at = COALESCE(revoked_at, CURRENT_TIMESTAMP)
     WHERE id = ? AND user_id = ?`,
    [sessionId, userId]
  );
}

async function revokeAllUserSessions(userId) {
  await db.query(
    `UPDATE user_sessions
     SET revoked_at = COALESCE(revoked_at, CURRENT_TIMESTAMP)
     WHERE user_id = ? AND revoked_at IS NULL`,
    [userId]
  );
}

module.exports = {
  REFRESH_COOKIE,
  setRefreshCookie,
  clearRefreshCookie,
  createSession,
  rotateSession,
  getActiveSession,
  revokeSessionByRefreshToken,
  revokeSessionById,
  revokeAllUserSessions,
};
