const {
  findUserByEmail,
  createUser,
  verifyPassword,
  verifyUnknownUserPassword,
  isLoginLocked,
  clearExpiredLoginLock,
  recordFailedLogin,
  resetLoginSecurity,
  generateAccessToken,
  publicUser,
} = require('../services/auth.service');
const {
  REFRESH_COOKIE,
  setRefreshCookie,
  clearRefreshCookie,
  createSession,
  rotateSession,
  revokeSessionByRefreshToken,
  revokeSessionById,
  revokeAllUserSessions,
} = require('../services/sessions.service');
const { parseCookies } = require('../utils/cookies');
const { validateNewPassword, isLoginPasswordValid } = require('../utils/password');

const INVALID_LOGIN_MESSAGE = 'No se pudo iniciar sesión con las credenciales proporcionadas';

async function login(req, res, next) {
  try {
    const email = typeof req.body?.email === 'string'
      ? req.body.email.trim().toLowerCase()
      : '';
    const password = typeof req.body?.password === 'string'
      ? req.body.password
      : '';

    if (!email || !isLoginPasswordValid(password)) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      await verifyUnknownUserPassword(password);
      return res.status(401).json({ error: INVALID_LOGIN_MESSAGE });
    }

    await clearExpiredLoginLock(user);

    if (isLoginLocked(user)) {
      await verifyUnknownUserPassword(password);
      return res.status(401).json({ error: INVALID_LOGIN_MESSAGE });
    }

    if (!(await verifyPassword(password, user.password_hash))) {
      await recordFailedLogin(user.id);
      return res.status(401).json({ error: INVALID_LOGIN_MESSAGE });
    }

    if (!user.activo) {
      return res.status(401).json({ error: INVALID_LOGIN_MESSAGE });
    }

    await resetLoginSecurity(user.id);
    const session = await createSession(user.id, req);
    setRefreshCookie(res, session.refreshToken);
    res.json({
      accessToken: generateAccessToken(user, session.id),
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const email = typeof req.body?.email === 'string'
      ? req.body.email.trim().toLowerCase()
      : '';
    const password = typeof req.body?.password === 'string'
      ? req.body.password
      : '';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const passwordError = validateNewPassword(password);
    if (passwordError) return res.status(400).json({ error: passwordError });

    const user = await createUser(email, password, 'visitante');
    const activeUser = { ...user, activo: true };
    const session = await createSession(user.id, req);
    setRefreshCookie(res, session.refreshToken);
    res.status(201).json({
      accessToken: generateAccessToken(activeUser, session.id),
      user: publicUser(activeUser),
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json({ user: req.user });
}

async function refresh(req, res, next) {
  try {
    const refreshToken = parseCookies(req)[REFRESH_COOKIE];
    if (!refreshToken) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Sesión no disponible' });
    }

    const session = await rotateSession(refreshToken, req);
    if (session?.retry) {
      return res.status(409).json({ error: 'Renovación concurrente; reintenta' });
    }
    if (!session) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Sesión expirada o revocada' });
    }

    setRefreshCookie(res, session.refreshToken);
    res.json({
      accessToken: generateAccessToken(session.user, session.id),
      user: publicUser(session.user),
    });
  } catch (err) { next(err); }
}

async function logout(req, res, next) {
  try {
    const refreshToken = parseCookies(req)[REFRESH_COOKIE];
    if (refreshToken) await revokeSessionByRefreshToken(refreshToken);
    if (req.user?.sessionId) {
      await revokeSessionById(req.user.sessionId, req.user.id);
    }
    clearRefreshCookie(res);
    res.status(204).send();
  } catch (err) { next(err); }
}

async function logoutAll(req, res, next) {
  try {
    await revokeAllUserSessions(req.user.id);
    clearRefreshCookie(res);
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { login, register, me, refresh, logout, logoutAll };
