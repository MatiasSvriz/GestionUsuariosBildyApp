import request from 'supertest';
import app from '../src/app.js';

describe('Auth endpoints', () => {
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: '12345678'
  };

  it('debería registrar un usuario', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body).toBeDefined();
    expect(res.body.ok ?? true).toBeTruthy();
  });

  it('debería hacer login correctamente', async () => {
    await request(app)
      .post('/api/user/register')
      .send(testUser);

    const res = await request(app)
      .post('/api/user/login')
      .send(testUser);

    const token = res.body.data?.accessToken;
    expect(token).toBeDefined();

    expect(res.status).toBe(200);
  });

  it('debería fallar con credenciales incorrectas', async () => {
    await request(app)
      .post('/api/user/register')
      .send(testUser);

    const res = await request(app)
      .post('/api/user/login')
      .send({
        email: testUser.email,
        password: 'password_incorrecta'
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});