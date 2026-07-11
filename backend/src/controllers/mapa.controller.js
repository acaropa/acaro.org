const mapaService = require('../services/mapa.service');

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function getMapData(req, res, next) {
  try {
    const { tipo } = req.query;
    const data = await mapaService.getValueChainMapData(tipo || 'todos');
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getProvincias(req, res, next) {
  try {
    const data = await mapaService.getProvincias();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getDistritosByProvincia(req, res, next) {
  try {
    const { provincia } = req.params;
    if (!provincia) {
      return res.status(400).json({ error: 'Provincia es requerida' });
    }
    const data = await mapaService.getDistritosByProvincia(provincia);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getActores(req, res, next) {
  try {
    const status = req.query.status || 'todos';
    if (!['activos', 'inactivos', 'todos'].includes(status)) {
      return res.status(400).json({ error: 'Estado de filtro inválido. Debe ser activos, inactivos o todos.' });
    }
    const data = await mapaService.getActores(status);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function createActor(req, res, next) {
  try {
    const { nombre, tipo_entidad, distrito_id } = req.body || {};
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'nombre es requerido' });
    }
    if (!tipo_entidad) {
      return res.status(400).json({ error: 'tipo_entidad es requerido' });
    }
    if (!distrito_id) {
      return res.status(400).json({ error: 'distrito_id es requerido' });
    }

    const userId = req.user?.id || null;
    const actorId = await mapaService.createActor(req.body, userId);
    
    res.status(201).json({ id: actorId, message: 'Actor de cadena de valor registrado con éxito' });
  } catch (err) {
    next(err);
  }
}

async function updateActor(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Identificador inválido' });

    const success = await mapaService.updateActor(id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Actor no encontrado o sin cambios aplicados' });
    }
    res.json({ message: 'Actor actualizado con éxito' });
  } catch (err) {
    next(err);
  }
}

async function softDeleteActor(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Identificador inválido' });

    const success = await mapaService.softDeleteActor(id);
    if (!success) {
      return res.status(404).json({ error: 'Actor no encontrado' });
    }
    res.json({ message: 'Actor desactivado con éxito' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMapData,
  getProvincias,
  getDistritosByProvincia,
  getActores,
  createActor,
  updateActor,
  softDeleteActor,
};
