const request = require('supertest');

jest.mock('../src/config/db', () => ({ query: jest.fn(), end: jest.fn() }));
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash:    jest.fn().mockResolvedValue('$hashed'),
}));
jest.mock('../src/services/sessions.service', () => ({
  REFRESH_COOKIE:           'acaro_refresh',
  setRefreshCookie:         jest.fn(),
  clearRefreshCookie:       jest.fn(),
  createSession:            jest.fn(),
  rotateSession:            jest.fn(),
  revokeSessionByRefreshToken: jest.fn(),
  revokeSessionById:        jest.fn(),
  revokeAllUserSessions:    jest.fn(),
  cleanupOldSessions:       jest.fn(),
  getActiveSession:         jest.fn(),
}));

const db = require('../src/config/db');
const bcrypt = require('bcryptjs');
const { createSession, setRefreshCookie } = require('../src/services/sessions.service');

beforeAll(() => { process.env.JWT_SECRET = 'test-secret-32-characters-long!!'; });

const app = require('../src/app');

const ACTIVE_USER = {
  id: 1, email: 'user@acaro.org', password_hash: '$2b$10$hashed',
  role: 'visitante', activo: 1,
  failed_login_attempts: 0, locked_until: null, login_locked: 0,
};

describe('POST /api/auth/login', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 — credenciales correctas', async () => {
    db.query.mockResolvedValueOnce([[ACTIVE_USER]])           // findUserByEmail
            .mockResolvedValueOnce([[{ affectedRows: 1 }]])  // resetLoginSecurity
            .mockResolvedValueOnce([[{ insertId: 5 }]]);     // createSession INSERT
    bcrypt.compare.mockResolvedValue(true);
    createSession.mockResolvedValue({ id: 5, refreshToken: 'tok.secret' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@acaro.org', password: 'ContraseñaSegura!' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user.email).toBe('user@acaro.org');
  });

  test('401 — contraseña incorrecta', async () => {
    db.query.mockResolvedValueOnce([[ACTIVE_USER]]);
    bcrypt.compare.mockResolvedValue(false);
    db.query.mockResolvedValueOnce([[{ affectedRows: 1 }]]); // recordFailedLogin

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@acaro.org', password: 'ContraseñaIncorrecta!' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('401 — usuario no existe', async () => {
    db.query.mockResolvedValueOnce([[]]); // findUserByEmail returns empty
    bcrypt.compare.mockResolvedValue(false); // verifyUnknownUserPassword timing defense

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@acaro.org', password: 'ContraseñaSegura!' });

    expect(res.status).toBe(401);
  });

  test('400 — email inválido rechazado por Zod', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'no-es-un-email', password: 'ContraseñaSegura!' });

    expect(res.status).toBe(400);
    expect(db.query).not.toHaveBeenCalled();
  });

  test('400 — campos vacíos rechazados por Zod', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(db.query).not.toHaveBeenCalled();
  });
});

describe('POST /api/auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  test('201 — registro exitoso', async () => {
    db.query.mockResolvedValueOnce([[]])                     // findUserByEmail (no existe)
            .mockResolvedValueOnce([[{ insertId: 2 }]]);    // INSERT user
    createSession.mockResolvedValue({ id: 1, refreshToken: 'tok.secret' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'nuevo@acaro.org', password: 'ContraseñaSegura123!' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
  });

  test('400 — contraseña demasiado corta rechazada por Zod', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'nuevo@acaro.org', password: 'corta' });

    expect(res.status).toBe(400);
    expect(db.query).not.toHaveBeenCalled();
  });

  test('409 — email ya registrado', async () => {
    db.query.mockResolvedValueOnce([[ACTIVE_USER]]); // findUserByEmail retorna usuario existente

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@acaro.org', password: 'ContraseñaSegura123!' });

    expect(res.status).toBe(409);
  });
});
