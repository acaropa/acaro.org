const contact = require('../services/contact.service');

async function send(req, res, next) {
  try {
    res.json(await contact.sendContactMessage(req.body || {}));
  } catch (err) { next(err); }
}

module.exports = { send };
