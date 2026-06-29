const router = require('express').Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', message: 'database unavailable', timestamp: new Date().toISOString() });
  }
});

module.exports = router;
