const {
  findUserByEmail,
  createUser,
  verifyPassword,
  generateToken,
  publicUser,
} = require('../services/auth.service');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const user = await findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    if (!user.activo) {
      return res.status(403).json({ error: 'Cuenta desactivada' });
    }

    const token = generateToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

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
