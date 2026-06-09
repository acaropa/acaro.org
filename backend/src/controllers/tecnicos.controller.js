const tecnicos = require('../services/tecnicos.service');

async function getAll(req, res, next) {
  try {
    res.json(await tecnicos.getAll());
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const tecnico = await tecnicos.getById(req.params.id);
    if (!tecnico) return res.status(404).json({ error: 'Técnico no encontrado' });
    res.json(tecnico);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { email, password, nombre, apellido } = req.body;

    if (!email || !password || !nombre || !apellido) {
      return res.status(400).json({ error: 'email, password, nombre y apellido son requeridos' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const tecnico = await tecnicos.create(req.body);
    res.status(201).json(tecnico);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const tecnico = await tecnicos.update(req.params.id, req.body);
    if (!tecnico) return res.status(404).json({ error: 'Técnico no encontrado' });
    res.json(tecnico);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await tecnicos.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Técnico no encontrado' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
