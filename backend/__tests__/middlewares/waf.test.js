jest.mock('../../src/config/db', () => ({ query: jest.fn(), end: jest.fn() }));
jest.mock('../../src/services/sessions.service', () => ({
  REFRESH_COOKIE: 'acaro_refresh', setRefreshCookie: jest.fn(), clearRefreshCookie: jest.fn(),
  createSession: jest.fn(), rotateSession: jest.fn(), revokeSessionByRefreshToken: jest.fn(),
  revokeSessionById: jest.fn(), revokeAllUserSessions: jest.fn(), cleanupOldSessions: jest.fn(),
  getActiveSession: jest.fn(),
}));

const request = require('supertest');
const app = require('../../src/app');

describe('WAF — query params', () => {
  test('bloquea XSS en query param', async () => {
    const res = await request(app).get('/api/health?q=<script>alert(1)</script>');
    expect(res.status).toBe(400);
  });

  test('bloquea UNION SELECT en query param', async () => {
    const res = await request(app).get("/api/health?id=1' UNION SELECT * FROM users--");
    expect(res.status).toBe(400);
  });

  test('permite query params normales', async () => {
    const res = await request(app).get('/api/health?page=1&limit=10');
    // health devuelve 503 porque db está mockeada (sin resolve) — pero no 400 del WAF
    expect(res.status).not.toBe(400);
    expect(res.status).not.toBe(403);
  });
});

describe('WAF — path traversal', () => {
  test('bloquea ../ en el path', async () => {
    const res = await request(app).get('/api/../../../etc/passwd');
    expect([400, 404]).toContain(res.status);
  });
});

describe('WAF — User-Agent', () => {
  test('bloquea sqlmap por User-Agent', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('User-Agent', 'sqlmap/1.7.8');
    expect(res.status).toBe(403);
  });

  test('bloquea nikto por User-Agent', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('User-Agent', 'Nikto/2.1.6');
    expect(res.status).toBe(403);
  });

  test('permite User-Agent de navegador normal', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0');
    expect(res.status).not.toBe(403);
  });
});

describe('WAF — body XSS (log-only, no bloquea)', () => {
  test('permite body con XSS pero lo registra — sanitize.js lo limpia', async () => {
    // El WAF no bloquea el body (sanitize.js lo limpia antes de guardarlo)
    // El endpoint devuelve 400 por Zod (email inválido), no por el WAF
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: '<script>x</script>', password: 'test' });
    expect(res.status).toBe(400); // Zod rechaza el email, no el WAF
    expect(res.status).not.toBe(403);
  });
});
