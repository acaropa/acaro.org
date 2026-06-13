const crypto = require('crypto');

const IDEMPOTENCY_TTL_MS = 10 * 60 * 1000;
const MAX_ENTRIES = 1000;
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const entries = new Map();

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function requestFingerprint(req) {
  const authorization = req.headers.authorization || '';
  const identity = authorization
    ? `auth:${hash(authorization)}`
    : `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
  return hash(JSON.stringify({
    identity,
    method: req.method,
    path: req.originalUrl,
    body: req.body || null,
  }));
}

function pruneEntries() {
  const now = Date.now();
  for (const [key, entry] of entries) {
    if (entry.expiresAt <= now) entries.delete(key);
  }
  while (entries.size > MAX_ENTRIES) {
    entries.delete(entries.keys().next().value);
  }
}

async function idempotency(req, res, next) {
  if (!MUTATING_METHODS.has(req.method)) return next();

  const key = req.get('Idempotency-Key');
  if (!key) return next();
  if (!/^[A-Za-z0-9._:-]{16,128}$/.test(key)) {
    return res.status(400).json({ error: 'Idempotency-Key inválido' });
  }

  pruneEntries();
  const fingerprint = requestFingerprint(req);
  const existing = entries.get(key);

  if (existing) {
    if (existing.fingerprint !== fingerprint) {
      return res.status(409).json({
        error: 'La clave de idempotencia ya fue usada para otra solicitud',
      });
    }

    const replay = await existing.promise;
    if (!replay) return next();
    res.set('Idempotency-Replayed', 'true');
    if (replay.contentType) res.set('Content-Type', replay.contentType);
    return res.status(replay.status).send(replay.body);
  }

  let resolveEntry;
  const promise = new Promise(resolve => {
    resolveEntry = resolve;
  });
  const entry = {
    fingerprint,
    promise,
    resolve: resolveEntry,
    expiresAt: Date.now() + IDEMPOTENCY_TTL_MS,
    completed: false,
  };
  entries.set(key, entry);
  pruneEntries();

  const originalSend = res.send.bind(res);
  res.send = body => {
    if (!entry.completed) {
      entry.completed = true;
      if (res.statusCode >= 200 && res.statusCode < 300) {
        entry.resolve({
          status: res.statusCode,
          body,
          contentType: res.get('Content-Type'),
        });
      } else {
        entries.delete(key);
        entry.resolve(null);
      }
    }
    return originalSend(body);
  };

  res.on('close', () => {
    if (!entry.completed) {
      entries.delete(key);
      entry.resolve(null);
      entry.completed = true;
    }
  });

  next();
}

module.exports = idempotency;
