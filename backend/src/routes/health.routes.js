const router = require('express').Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', message: 'database unavailable', detail: err.message, timestamp: new Date().toISOString() });
  }
});

router.get('/debug', async (req, res) => {
  const https = require('https');
  const getIp = () => new Promise((resolve, reject) => {
    https.get('https://api.ipify.org?format=json', (r) => {
      let data = '';
      r.on('data', c => data += c);
      r.on('end', () => resolve(JSON.parse(data).ip));
    }).on('error', reject);
  });

  try {
    const ip = await getIp();
    let dbStatus = 'ok';
    let dbError = null;
    try { await db.query('SELECT 1'); } catch (e) { dbStatus = 'error'; dbError = e.message; }
    res.json({
      serverIp: ip,
      dbHost: process.env.DB_HOST,
      dbPort: process.env.DB_PORT,
      dbUser: process.env.DB_USER,
      dbName: process.env.DB_NAME,
      nodeEnv: process.env.NODE_ENV,
      dbStatus,
      dbError,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
