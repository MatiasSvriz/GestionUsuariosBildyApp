import request from 'supertest';
import app from '../src/app.js';

describe('Client endpoints', () => {
  const testUser = {
    email: `client_${Date.now()}@example.com`,
    password: '12345678'
  };

  let token = '';

  const createCompany = async () => {
    await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Empresa Test',
        cif: `B${Date.now()}`,
        address: {
          street: 'Calle Empresa',
          number: '1',
          postal: '28001',
          city: 'Madrid',
          province: 'Madrid'
        },
        isFreelance: false
      });
  };

  const createClient = async (overrides = {}) => {
    const res = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Test',
        cif: `B${Date.now()}`,
        email: 'cliente@test.com',
        phone: '600123123',
        address: {
          street: 'Calle Mayor',
          number: '10',
          postal: '28001',
          city: 'Madrid',
          province: 'Madrid'
        },
        ...overrides
      });

    return res;
  };

  beforeEach(async () => {
    await request(app)
      .post('/api/user/register')
      .send(testUser);

    const loginRes = await request(app)
      .post('/api/user/login')
      .send(testUser);

    token = loginRes.body.data.accessToken;

    await createCompany();
  });

  it('debería crear un cliente', async () => {
    const res = await createClient({
      name: 'Cliente Crear'
    });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.name).toBe('Cliente Crear');
  });

  it('debería listar clientes', async () => {
    await createClient({
      name: 'Cliente Lista'
    });

    const res = await request(app)
      .get('/api/client')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('debería obtener un cliente por id', async () => {
    const created = await createClient({
      name: 'Cliente Obtener'
    });

    const clientId = created.body.data._id;

    const res = await request(app)
      .get(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data._id).toBe(clientId);
    expect(res.body.data.name).toBe('Cliente Obtener');
  });

  it('debería actualizar un cliente', async () => {
    const created = await createClient({
      name: 'Cliente Original'
    });

    const clientId = created.body.data._id;

    const res = await request(app)
      .put(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Actualizado',
        email: 'actualizado@test.com'
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.name).toBe('Cliente Actualizado');
    expect(res.body.data.email).toBe('actualizado@test.com');
  });

  it('debería archivar un cliente con soft delete', async () => {
    const created = await createClient({
      name: 'Cliente Soft Delete'
    });

    const clientId = created.body.data._id;

    const res = await request(app)
      .delete(`/api/client/${clientId}?soft=true`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('debería listar clientes archivados', async () => {
    const created = await createClient({
      name: 'Cliente Archivado'
    });

    const clientId = created.body.data._id;

    await request(app)
      .delete(`/api/client/${clientId}?soft=true`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get('/api/client/archived')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('debería restaurar un cliente archivado', async () => {
    const created = await createClient({
      name: 'Cliente Restaurar'
    });

    const clientId = created.body.data._id;

    await request(app)
      .delete(`/api/client/${clientId}?soft=true`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .patch(`/api/client/${clientId}/restore`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.deleted).toBe(false);
  });

  it('debería eliminar un cliente permanentemente', async () => {
    const created = await createClient({
      name: 'Cliente Hard Delete'
    });

    const clientId = created.body.data._id;

    const res = await request(app)
      .delete(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const getRes = await request(app)
      .get(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(404);
  });
});