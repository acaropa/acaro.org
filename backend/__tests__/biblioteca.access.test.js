jest.mock('../src/config/db', () => ({ query: jest.fn() }));
jest.mock('../src/utils/memoryCache', () => ({ getOrSet: (_key, factory) => factory(), invalidatePrefix: jest.fn() }));
const db = require('../src/config/db');
const biblioteca = require('../src/services/biblioteca.service');

beforeEach(() => { db.query.mockReset(); db.query.mockResolvedValue([[]]); });

test.each([null, { id: 1, role: 'visitante' }])('anonymous and visitor queries only expose approved public documents', async user => {
  await biblioteca.getAll({ user, scope: 'mine' });
  const [sql, values] = db.query.mock.calls[0];
  expect(sql).toContain("b.estado = 'aprobado'");
  expect(sql).toContain("b.visibilidad = 'publica'");
  expect(values).toEqual([]);
});

test.each(['tecnico', 'supervisor', 'admin'])('mine scope filters the %s owner', async role => {
  await biblioteca.getAll({ user: { id: 42, role }, scope: 'mine' });
  const [sql, values] = db.query.mock.calls[0];
  expect(sql).toContain('WHERE b.creado_por = ?');
  expect(values).toEqual([42]);
});

test('technicians see approved documents or their own drafts', async () => {
  await biblioteca.getAll({ user: { id: 42, role: 'tecnico' } });
  expect(db.query.mock.calls[0][0]).toContain("((b.estado = 'aprobado') OR b.creado_por = ?)");
  expect(db.query.mock.calls[0][1]).toEqual([42]);
});

test('supervisors are limited to their own documents and assigned technicians', async () => {
  await biblioteca.getAll({ user: { id: 42, role: 'supervisor' } });
  expect(db.query.mock.calls[0][0]).toContain('st.supervisor_id = ? AND t.user_id = b.creado_por');
  expect(db.query.mock.calls[0][1]).toEqual([42, 42]);
});

test('pagination keeps the requested limit and offset', async () => {
  await biblioteca.getAll({ limit: 12, offset: 24 });
  expect(db.query.mock.calls[0][0]).toContain('LIMIT 12 OFFSET 24');
});
