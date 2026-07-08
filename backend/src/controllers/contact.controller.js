const contact = require('../services/contact.service');

async function send(req, res, next) {
  try {
    res.json(await contact.sendContactMessage(req.body || {}));
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    res.json(await contact.listMessages());
  } catch (err) { next(err); }
}

async function get(req, res, next) {
  try {
    res.json(await contact.getMessage(Number(req.params.id)));
  } catch (err) { next(err); }
}

async function reply(req, res, next) {
  try {
    res.json(await contact.replyMessage(Number(req.params.id), req.body || {}));
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    res.json(await contact.deleteMessage(Number(req.params.id)));
  } catch (err) { next(err); }
}

module.exports = { send, list, get, reply, remove };
