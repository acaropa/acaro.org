const {
  findUserByEmail,
  createUser,
  verifyPassword,
  verifyUnknownUserPassword,
  isLoginLocked,
  clearExpiredLoginLock,
  recordFailedLogin,
  resetLoginSecurity,
  generateToken,
  publicUser,
} = require('../services/auth.service');
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
    const token = generateToken(user);
    res.json({ token, user: publicUser(user) });
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
    const token = generateToken(user);
    res.status(201).json({ token, user: publicUser({ ...user, activo: true }) });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, register, me };
