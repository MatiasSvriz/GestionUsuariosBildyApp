import request from 'supertest';
import app from '../src/app.js';

describe('Project endpoints', () => {
  let testUser;
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
        cif: `C${Date.now()}${Math.floor(Math.random()*1000)}`,
        email: `cliente_${Date.now()}@test.com`,
        phone: '600000000',
        address: {
          street: 'Calle Cliente',
          number: '1',
          postal: '28001',
          city: 'Madrid',
          province: 'Madrid'
        }
      });

    expect(res.status).toBe(201); // 🔥 clave

    return res.body.data._id;
  };

  const createProject = async (overrides = {}) => {
    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        client: clientId,
        name: 'Proyecto Test',
        projectCode: `PR-${Date.now()}-${Math.random()}`,
        email: `proyecto_${Date.now()}@test.com`,
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
    testUser = {
      email: `project_${Date.now()}_${Math.random()}@example.com`,
      password: '12345678'
    };

    const registerRes = await request(app)
      .post('/api/user/register')
      .send(testUser);

    expect(registerRes.status).toBe(201); // 🔥 importante

    const loginRes = await request(app)
      .post('/api/user/login')
      .send(testUser);

    expect(loginRes.status).toBe(200); // 🔥 evita undefined

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

  it('no crea proyecto sin compañía', async () => {
    // registrar usuario SIN company
    const user = {
      email: `no_company_${Date.now()}@test.com`,
      password: '12345678'
    };

    await request(app).post('/api/user/register').send(user);

    const login = await request(app)
      .post('/api/user/login')
      .send(user);

    const badToken = login.body.data.accessToken;

    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${badToken}`)
      .send({
        client: clientId,
        name: 'Proyecto Error',
        projectCode: 'PR-ERROR'
      });

    expect(res.status).toBe(400);
  });

  it('no crea proyecto con cliente inexistente', async () => {
    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        client: '507f1f77bcf86cd799439011',
        name: 'Proyecto Error',
        projectCode: 'PR-ERROR'
      });

    expect(res.status).toBe(404);
  });

  it('no crea proyecto con código duplicado', async () => {
    const code = `PR-DUP-${Date.now()}`;

    await createProject({ projectCode: code });

    const res = await createProject({ projectCode: code });

    expect(res.status).toBe(409);
  });

  it('no actualiza proyecto inexistente', async () => {
    const res = await request(app)
      .put('/api/project/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Error' });

    expect(res.status).toBe(404);
  });

  it('no actualiza con cliente inválido', async () => {
    const created = await createProject();

    const res = await request(app)
      .put(`/api/project/${created.body.data._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        client: '507f1f77bcf86cd799439011'
      });

    expect(res.status).toBe(404);
  });

  it('no actualiza con projectCode duplicado', async () => {
      const p1 = await createProject();
      const p2 = await createProject();

      const res = await request(app)
        .put(`/api/project/${p2.body.data._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectCode: p1.body.data.projectCode
        });

      expect(res.status).toBe(409);
  });

  it('filtra proyectos por nombre', async () => {
    await createProject({ name: 'FiltroTest' });

    const res = await request(app)
      .get('/api/project?name=Filtro')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('filtra proyectos por active true', async () => {
    await createProject({ active: true });

    const res = await request(app)
      .get('/api/project?active=true')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('filtra proyectos por active false', async () => {
    await createProject({ active: false });

    const res = await request(app)
      .get('/api/project?active=false')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('ordena proyectos', async () => {
    await createProject();

    const res = await request(app)
      .get('/api/project?sort=name')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('no elimina proyecto inexistente', async () => {
    const res = await request(app)
      .delete('/api/project/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });


  it('no archiva proyecto ya archivado', async () => {
    const created = await createProject();

    const id = created.body.data._id;

    await request(app)
      .delete(`/api/project/${id}?soft=true`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .delete(`/api/project/${id}?soft=true`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it('no restaura proyecto inexistente', async () => {
    const res = await request(app)
      .patch('/api/project/507f1f77bcf86cd799439011/restore')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

});