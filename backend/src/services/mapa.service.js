const db = require('../config/db');

// SQL queries based on repository example
const ALL_DISTRICTS_SQL = `
SELECT
  d.codigo_distrito AS codigoDistrito,
  d.provincia AS provincia,
  d.distrito AS distrito,
  SUM(source.cantidad) AS cantidad
FROM (
  SELECT
    p.distrito_id,
    COUNT(DISTINCT p.id) AS cantidad
  FROM productores p
  WHERE p.activo = 1
    AND p.distrito_id IS NOT NULL
  GROUP BY p.distrito_id

  UNION ALL

  SELECT
    a.distrito_id,
    COUNT(DISTINCT a.id) AS cantidad
  FROM actores_cadena_valor a
  WHERE a.activo = 1
  GROUP BY a.distrito_id
) source
INNER JOIN distritos_panama d
  ON d.id = source.distrito_id
GROUP BY
  d.id,
  d.codigo_distrito,
  d.provincia,
  d.distrito
ORDER BY d.codigo_distrito
`;

const PRODUCERS_SQL = `
SELECT
  d.codigo_distrito AS codigoDistrito,
  d.provincia AS provincia,
  d.distrito AS distrito,
  COUNT(DISTINCT p.id) AS cantidad
FROM productores p
INNER JOIN distritos_panama d
  ON d.id = p.distrito_id
WHERE p.activo = 1
  AND p.distrito_id IS NOT NULL
GROUP BY
  d.id,
  d.codigo_distrito,
  d.provincia,
  d.distrito
ORDER BY d.codigo_distrito
`;

const ACTOR_TYPE_SQL = `
SELECT
  d.codigo_distrito AS codigoDistrito,
  d.provincia AS provincia,
  d.distrito AS distrito,
  COUNT(DISTINCT a.id) AS cantidad
FROM actores_cadena_valor a
INNER JOIN distritos_panama d
  ON d.id = a.distrito_id
INNER JOIN actor_tipos actor_type
  ON actor_type.actor_id = a.id
INNER JOIN tipos_actor type
  ON type.id = actor_type.tipo_actor_id
WHERE a.activo = 1
  AND type.activo = 1
  AND type.codigo = ?
GROUP BY
  d.id,
  d.codigo_distrito,
  d.provincia,
  d.distrito
ORDER BY d.codigo_distrito
`;

const ACTOR_TYPES_SQL = `
SELECT
  codigo AS code,
  nombre AS label
FROM tipos_actor
WHERE activo = 1
ORDER BY orden ASC, nombre ASC
`;

function normalizeRows(rows) {
  return rows.map((row) => ({
    codigoDistrito: String(row.codigoDistrito).padStart(4, '0'),
    provincia: row.provincia,
    distrito: row.distrito,
    cantidad: Number(row.cantidad),
  }));
}

async function getValueChainMapData(type = 'todos') {
  let rows;

  if (type === 'todos') {
    [rows] = await db.query(ALL_DISTRICTS_SQL);
  } else if (type === 'productor') {
    [rows] = await db.query(PRODUCERS_SQL);
  } else {
    [rows] = await db.query(ACTOR_TYPE_SQL, [type]);
  }

  const [databaseTypes] = await db.query(ACTOR_TYPES_SQL);

  const distritos = normalizeRows(rows);
  const totalActores = distritos.reduce(
    (total, district) => total + district.cantidad,
    0,
  );

  return {
    tipo: type,
    totalActores,
    distritos,
    filtros: [
      { code: 'todos', label: 'Todos' },
      { code: 'productor', label: 'Productores' },
      ...databaseTypes.filter((item) => item.code !== 'productor'),
    ],
    meta: {
      mode: 'DATABASE',
      generatedAt: new Date().toISOString(),
    },
  };
}

async function getProvincias() {
  const [rows] = await db.query(
    'SELECT DISTINCT provincia FROM distritos_panama ORDER BY provincia ASC'
  );
  return rows.map(r => r.provincia);
}

async function getDistritosByProvincia(provincia) {
  const [rows] = await db.query(
    'SELECT id, codigo_distrito AS codigoDistrito, distrito FROM distritos_panama WHERE provincia = ? ORDER BY distrito ASC',
    [provincia]
  );
  return rows;
}

async function getActores(statusFilter = 'todos') {
  let where = '';
  const params = [];
  if (statusFilter === 'activos') {
    where = 'WHERE a.activo = 1';
  } else if (statusFilter === 'inactivos') {
    where = 'WHERE a.activo = 0';
  }

  const query = `
    SELECT a.id, a.nombre, a.tipo_entidad, a.distrito_id, a.comunidad, a.activo, a.creado_por, a.created_at, a.updated_at,
           d.provincia, d.distrito,
           GROUP_CONCAT(t.codigo) AS tipos_codigos,
           GROUP_CONCAT(t.nombre) AS tipos_nombres
    FROM actores_cadena_valor a
    JOIN distritos_panama d ON d.id = a.distrito_id
    LEFT JOIN actor_tipos at ON at.actor_id = a.id
    LEFT JOIN tipos_actor t ON t.id = at.tipo_actor_id
    ${where}
    GROUP BY a.id
    ORDER BY a.created_at DESC
  `;

  const [rows] = await db.query(query, params);
  
  return rows.map(row => ({
    id: row.id,
    nombre: row.nombre,
    tipo_entidad: row.tipo_entidad,
    distrito_id: row.distrito_id,
    comunidad: row.comunidad,
    activo: Boolean(row.activo),
    creado_por: row.creado_por,
    created_at: row.created_at,
    updated_at: row.updated_at,
    provincia: row.provincia,
    distrito: row.distrito,
    tipos: row.tipos_codigos ? row.tipos_codigos.split(',') : [],
    tipos_nombres: row.tipos_nombres ? row.tipos_nombres.split(',') : [],
  }));
}

async function createActor(data, userId) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO actores_cadena_valor (nombre, tipo_entidad, distrito_id, comunidad, activo, creado_por)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.nombre,
        data.tipo_entidad,
        data.distrito_id,
        data.comunidad || null,
        data.activo ?? true,
        userId,
      ]
    );

    const actorId = result.insertId;

    if (data.tipos && data.tipos.length > 0) {
      // Resolve tipo_actor_id from code
      const [typeRows] = await connection.query(
        'SELECT id, codigo FROM tipos_actor WHERE codigo IN (?)',
        [data.tipos]
      );

      for (const typeRow of typeRows) {
        await connection.query(
          'INSERT INTO actor_tipos (actor_id, tipo_actor_id) VALUES (?, ?)',
          [actorId, typeRow.id]
        );
      }
    }

    await connection.commit();
    return actorId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateActor(id, data) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Update basic fields if present
    const allowed = ['nombre', 'tipo_entidad', 'distrito_id', 'comunidad', 'activo'];
    const fields = Object.keys(data).filter(field => allowed.includes(field));

    if (fields.length > 0) {
      await connection.query(
        `UPDATE actores_cadena_valor SET ${fields.map(field => `${field} = ?`).join(', ')} WHERE id = ?`,
        [...fields.map(field => data[field]), id]
      );
    }

    // 2. Update types if present
    if (data.tipos !== undefined) {
      // Remove old associations
      await connection.query('DELETE FROM actor_tipos WHERE actor_id = ?', [id]);

      if (data.tipos.length > 0) {
        const [typeRows] = await connection.query(
          'SELECT id, codigo FROM tipos_actor WHERE codigo IN (?)',
          [data.tipos]
        );

        for (const typeRow of typeRows) {
          await connection.query(
            'INSERT INTO actor_tipos (actor_id, tipo_actor_id) VALUES (?, ?)',
            [id, typeRow.id]
          );
        }
      }
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function softDeleteActor(id) {
  const [result] = await db.query(
    'UPDATE actores_cadena_valor SET activo = 0 WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}

module.exports = {
  getValueChainMapData,
  getProvincias,
  getDistritosByProvincia,
  getActores,
  createActor,
  updateActor,
  softDeleteActor,
};
