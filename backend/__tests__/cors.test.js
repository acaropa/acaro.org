const request = require('supertest');

jest.mock('../src/config/db', () => ({ query: jest.fn(), end: jest.fn() }));

const app = require('../src/app');

describe('CORS', () => {
  test('permite el frontend local configurado', async () => {
    const response = await request(app)
      .options('/api/auth/login')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST');

    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  test('rechaza un origen desconocido con 403', async () => {
    const response = await request(app)
      .options('/api/auth/login')
      .set('Origin', 'https://evil.example')
      .set('Access-Control-Request-Method', 'POST');

    expect(response.status).toBe(403);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});