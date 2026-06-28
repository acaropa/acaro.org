const { z } = require('zod');

function formatIssues(issues) {
  return issues.map(i => ({ field: i.path.join('.') || '_root', message: i.message }));
}

// Valida req.body contra un schema Zod. Mantiene { error } para compatibilidad
// y agrega { errors: [{field, message}] } para detalle por campo.
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.issues;
      return res.status(400).json({
        error:  issues[0]?.message || 'Datos inválidos',
        errors: formatIssues(issues),
      });
    }
    next();
  };
}

// Valida req.params (parámetros de ruta como :id, :slug).
function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const issues = result.error.issues;
      return res.status(400).json({ error: issues[0]?.message || 'Parámetro de ruta inválido' });
    }
    next();
  };
}

// Valida req.query (query strings como ?page=1&limit=20).
function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const issues = result.error.issues;
      return res.status(400).json({ error: issues[0]?.message || 'Parámetro de consulta inválido' });
    }
    next();
  };
}

module.exports = { validate, validateParams, validateQuery, z };
