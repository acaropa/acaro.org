const jwt = require('jsonwebtoken');

jest.mock('../../src/services/sessions.service', () => ({
  getActiveSession: jest.fn(),
  REFRESH_COOKIE: 'acaro_refresh',
  setRefreshCookie: jest.fn(),
  clearRefreshCookie: jest.fn(),
  createSession: jest.fn(),
  rotateSession: jest.fn(),
  revokeSessionByRefreshToken: jest.fn(),
  revokeSessionById: jest.fn(),
  revokeAllUserSessions: jest.fn(),
  cleanupOldSessions: jest.fn(),
}));

jest.mock('../../src/config/db', () => ({ query: jest.fn(), end: jest.fn() }));

const { getActiveSession } = require('../../src/services/sessions.service');
const { verifyToken, requirePermission } = require('../../src/middlewares/auth.middleware');

const SECRET = 'test-secret-32-characters-long!!';

beforeAll(() => { process.env.JWT_SECRET = SECRET; });

function makeReq(token) {
  return { headers: { authorization: token ? `Bearer ${token}` : undefined } };
}

function makeRes() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

function validToken(overrides = {}) {
  return jwt.sign(
    { id: 1, sid: 10, type: 'access', ...overrides },
    SECRET,
    { expiresIn: '15m', algorithm: 'HS256', issuer: 'acaro-api', audience: 'acaro-web' }
  );
}

const ACTIVE_SESSION = {
  user_id: 1, email: 'test@acaro.org', role: 'visitante', activo: 1,
};

describe('verifyToken', () => {
  beforeEach(() => jest.clearAllMocks());

  test('pasa cuando token y sesión son válidos', async () => {
    getActiveSession.mockResolvedValue(ACTIVE_SESSION);
    const req = makeReq(validToken());
    const res = makeRes();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ id: 1, email: 'test@acaro.org', role: 'visitante' });
  });

  test('devuelve 401 si no hay header Authorization', async () => {
    const req = makeReq(null);
    const res = makeRes();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('devuelve 401 si el token está firmado con secreto incorrecto', async () => {
    const badToken = jwt.sign({ id: 1, sid: 10, type: 'access' }, 'otro-secreto', {
      expiresIn: '15m', algorithm: 'HS256', issuer: 'acaro-api', audience: 'acaro-web',
    });
    const req = makeReq(badToken);
    const res = makeRes();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('devuelve 401 si el token está expirado', async () => {
    const expiredToken = jwt.sign(
      { id: 1, sid: 10, type: 'access' },
      SECRET,
      { expiresIn: -1, algorithm: 'HS256', issuer: 'acaro-api', audience: 'acaro-web' }
    );
    const req = makeReq(expiredToken);
    const res = makeRes();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('devuelve 401 si la sesión está inactiva', async () => {
    getActiveSession.mockResolvedValue(null);
    const req = makeReq(validToken());
    const res = makeRes();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('devuelve 401 si la cuenta está desactivada', async () => {
    getActiveSession.mockResolvedValue({ ...ACTIVE_SESSION, activo: 0 });
    const req = makeReq(validToken());
    const res = makeRes();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe('requirePermission', () => {
  test('pasa si el usuario tiene el permiso', () => {
    const req = { user: { permissions: ['noticias.read.public', 'proyectos.read.public'] } };
    const res = makeRes();
    const next = jest.fn();

    requirePermission('noticias.read.public')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test('devuelve 403 si el usuario no tiene el permiso', () => {
    const req = { user: { permissions: ['noticias.read.public'] } };
    const res = makeRes();
    const next = jest.fn();

    requirePermission('usuarios.create')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
