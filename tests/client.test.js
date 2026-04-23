import request from 'supertest';
import app from '../src/app.js';

describe('Client endpoints', () => {
  const testUser = {
    email: `client_${Date.now()}@example.com`,
    password: '12345678'
  };

  let token = '';

  beforeEach(async () => {
    await request(app)
      .post('/api/user/register')
      .send(testUser);

    const loginRes = await request(app)
      .post('/api/user/login')
      .send(testUser);

    token = loginRes.body.data.accessToken;

    await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Empresa Test',
        cif: 'B11111111',
        address: {
          street: 'Calle Empresa',
          number: '1',
          postal: '28001',
          city: 'Madrid',
          province: 'Madrid'
        },
        isFreelance: false
      });
  });

  it('debería crear un cliente', async () => {
    const res = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Test',
        cif: 'B12345678',
        email: 'cliente@test.com',
        phone: '600123123',
        address: {
          street: 'Calle Mayor',
          number: '10',
          postal: '28001',
          city: 'Madrid',
          province: 'Madrid'
        }
      });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.name).toBe('Cliente Test');
  });

  it('debería listar clientes', async () => {
    await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Lista',
        cif: 'B87654321',
        email: 'lista@test.com'
      });

    const res = await request(app)
      .get('/api/client')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data || res.body.items)).toBe(true);
  });
});