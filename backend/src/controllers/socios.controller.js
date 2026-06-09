const socios = require('../services/socios.service');

async function getAll(req, res, next) {
  try {
    const data = await socios.getAll();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const socio = await socios.getById(req.params.id);
    if (!socio) return res.status(404).json({ error: 'Socio no encontrado' });
    res.json(socio);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { nombre, apellido, fecha_ingreso } = req.body;
    if (!nombre || !apellido || !fecha_ingreso) {
      return res.status(400).json({ error: 'nombre, apellido y fecha_ingreso son requeridos' });
    }
    const socio = await socios.create(req.body);
    res.status(201).json(socio);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const socio = await socios.update(req.params.id, req.body);
    if (!socio) return res.status(404).json({ error: 'Socio no encontrado' });
    res.json(socio);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await socios.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Socio no encontrado' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
