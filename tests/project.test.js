import request from 'supertest';
import app from '../src/app.js';

describe('Project endpoints', () => {
  const testUser = {
    email: `project_${Date.now()}@example.com`,
    password: '12345678'
  };

  let token = '';
  let clientId = '';

  const createCompany = async () => {
    await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Empresa Proyecto',
        cif: `B${Date.now()}`,
        address: {
          street: 'Calle Proyecto',
          number: '2',
          postal: '28002',
          city: 'Madrid',
          province: 'Madrid'
        },
        isFreelance: false
      });
  };

  const createClient = async () => {
    const res = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Proyecto',
        cif: `B${Date.now()}`,
        email: 'clienteproyecto@test.com'
      });

    return res.body.data._id;
  };

  const createProject = async (overrides = {}) => {
    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        client: clientId,
        name: 'Proyecto Test',
        projectCode: `PR-${Date.now()}`,
        email: 'proyecto@test.com',
        active: true,
        address: {
          street: 'Calle Obra',
          number: '15',
          postal: '28003',
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
    clientId = await createClient();
  });

  it('debería crear un proyecto', async () => {
    const res = await createProject({
      name: 'Proyecto Crear'
    });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.name).toBe('Proyecto Crear');
  });

  it('debería listar proyectos', async () => {
    await createProject({
      name: 'Proyecto Lista'
    });

    const res = await request(app)
      .get('/api/project')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('debería obtener un proyecto por id', async () => {
    const created = await createProject({
      name: 'Proyecto Obtener'
    });

    const projectId = created.body.data._id;

    const res = await request(app)
      .get(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data._id).toBe(projectId);
    expect(res.body.data.name).toBe('Proyecto Obtener');
  });

  it('debería actualizar un proyecto', async () => {
    const created = await createProject({
      name: 'Proyecto Original'
    });

    const projectId = created.body.data._id;

    const res = await request(app)
      .put(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto Actualizado',
        email: 'actualizado@test.com',
        notes: 'Notas actualizadas',
        active: false
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.name).toBe('Proyecto Actualizado');
    expect(res.body.data.email).toBe('actualizado@test.com');
    expect(res.body.data.active).toBe(false);
  });

  it('debería archivar un proyecto con soft delete', async () => {
    const created = await createProject({
      name: 'Proyecto Soft Delete'
    });

    const projectId = created.body.data._id;

    const res = await request(app)
      .delete(`/api/project/${projectId}?soft=true`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('debería listar proyectos archivados', async () => {
    const created = await createProject({
      name: 'Proyecto Archivado'
    });

    const projectId = created.body.data._id;

    await request(app)
      .delete(`/api/project/${projectId}?soft=true`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get('/api/project/archived')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('debería restaurar un proyecto archivado', async () => {
    const created = await createProject({
      name: 'Proyecto Restaurar'
    });

    const projectId = created.body.data._id;

    await request(app)
      .delete(`/api/project/${projectId}?soft=true`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .patch(`/api/project/${projectId}/restore`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.deleted).toBe(false);
  });

  it('debería eliminar un proyecto permanentemente', async () => {
    const created = await createProject({
      name: 'Proyecto Hard Delete'
    });

    const projectId = created.body.data._id;

    const res = await request(app)
      .delete(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const getRes = await request(app)
      .get(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(404);
  });
});