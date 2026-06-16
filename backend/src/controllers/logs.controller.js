const logs = require('../services/logs.service');

async function getAuditLogs(req, res, next) {
  try {
    const { limit, module: modulo, search } = req.query;
    res.json(await logs.getAuditLogs({ limit, module: modulo, search }));
  } catch (err) { next(err); }
}

async function getSessionLogs(req, res, next) {
  try {
    const { limit } = req.query;
    res.json(await logs.getSessionLogs({ limit }));
  } catch (err) { next(err); }
}

async function getModules(req, res, next) {
  try {
    res.json(await logs.getModules());
  } catch (err) { next(err); }
}

module.exports = { getAuditLogs, getSessionLogs, getModules };
