const settings = require('../services/settings.service');

async function getLanding(req, res, next) {
  try {
    res.json(await settings.getLanding());
  } catch (err) { next(err); }
}

async function updateLanding(req, res, next) {
  try {
    res.json(await settings.updateLanding(req.body || {}, req.user));
  } catch (err) { next(err); }
}

module.exports = { getLanding, updateLanding };
