import request from 'supertest';
import app from '../src/app.js';

describe('Project endpoints', () => {
  const testUser = {
    email: `project_${Date.now()}@example.com`,
    password: '12345678'
  };

  let token = '';
  let clientId = '';

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
        name: 'Empresa Proyecto',
        cif: 'B22222222',
        address: {
          street: 'Calle Proyecto',
          number: '2',
          postal: '28002',
          city: 'Madrid',
          province: 'Madrid'
        },
        isFreelance: false
      });

    const clientRes = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Proyecto',
        cif: `B${Date.now()}`,
        email: 'clienteproyecto@test.com'
      });

    clientId = clientRes.body.data._id;
  });

  it('debería crear un proyecto', async () => {
    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        client: clientId,
        name: 'Proyecto Test',
        projectCode: 'PR-001',
        email: 'proyecto@test.com',
        active: true
      });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.name).toBe('Proyecto Test');
  });

  it('debería listar proyectos', async () => {
    await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        client: clientId,
        name: 'Proyecto Lista',
        projectCode: 'PR-002',
        active: true
      });

    const res = await request(app)
      .get('/api/project')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data || res.body.items)).toBe(true);
  });
});