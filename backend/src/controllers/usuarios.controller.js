const usuarios = require('../services/usuarios.service');
const { validateNewPassword } = require('../utils/password');
const { revokeAllUserSessions } = require('../services/sessions.service');

async function getAll(req, res, next) {
  try {
    res.json(await usuarios.getAll());
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { email, password, role, full_name } = req.body || {};
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'email, password y role son requeridos' });
    }
    const passwordError = validateNewPassword(password);
    if (passwordError) return res.status(400).json({ error: passwordError });
    res.status(201).json(await usuarios.create({ email, password, role, full_name }));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const user = await usuarios.update(req.params.id, req.body || {});
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    await revokeAllUserSessions(user.id);
    res.json(user);
  } catch (err) { next(err); }
}

async function assignRole(req, res, next) {
  try {
    const { role } = req.body || {};
    if (!role) return res.status(400).json({ error: 'role es requerido' });
    const user = await usuarios.assignRole(req.params.id, role);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    await revokeAllUserSessions(user.id);
    res.json(user);
  } catch (err) { next(err); }
}

async function disable(req, res, next) {
  try {
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta' });
    }
    const user = await usuarios.update(req.params.id, { activo: false });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    await revokeAllUserSessions(user.id);
    res.json(user);
  } catch (err) { next(err); }
}

module.exports = { getAll, create, update, assignRole, disable };
