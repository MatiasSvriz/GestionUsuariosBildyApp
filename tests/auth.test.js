import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Company from '../src/models/Company.js';

describe('Auth/User endpoints', () => {
  let testUser;
  let token;
  let refreshToken;
  let user;

  beforeEach(async () => {
    testUser = {
      email: `test_${Date.now()}_${Math.random()}@example.com`,
      password: '12345678'
    };

    const res = await request(app)
      .post('/api/user/register')
      .send(testUser);

    token = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;

    user = await User.findOne({ email: testUser.email }).select(
      '+verificationCode +password +refreshToken +refreshTokenExpiresAt'
    );
  });

  it('debería registrar un usuario', async () => {
    const newUser = {
      email: `nuevo_${Date.now()}@example.com`,
      password: '12345678'
    };

    const res = await request(app)
      .post('/api/user/register')
      .send(newUser);

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user.email).toBe(newUser.email);
  });

  it('debería rechazar un registro duplicado', async () => {
    const res = await request(app)
      .post('/api/user/register')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.ok).toBe(false);
  });

  it('debería hacer login correctamente', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send(testUser);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
  });

  it('debería fallar login con credenciales incorrectas', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({
        email: testUser.email,
        password: 'password_incorrecta'
      });

    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });

  it('debería fallar login con usuario inexistente', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({
        email: `noexiste_${Date.now()}@example.com`,
        password: '12345678'
      });

    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });

  it('debería rechazar una ruta protegida sin token', async () => {
    const res = await request(app)
      .get('/api/user');

    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });

  it('debería rechazar una ruta protegida con token inválido', async () => {
    const res = await request(app)
      .get('/api/user')
      .set('Authorization', 'Bearer token_falso');

    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });

  it('debería validar el email con código correcto', async () => {
    const res = await request(app)
      .put('/api/user/validation')
      .set('Authorization', `Bearer ${token}`)
      .send({
        code: user.verificationCode
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('debería fallar validación con código incorrecto', async () => {
    const res = await request(app)
      .put('/api/user/validation')
      .set('Authorization', `Bearer ${token}`)
      .send({
        code: '000000'
      });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  it('debería actualizar datos personales', async () => {
    const res = await request(app)
      .put('/api/user/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Matias',
        lastName: 'Test',
        nif: '12345678A',
        address: {
          street: 'Calle Test',
          number: '1',
          postal: '28001',
          city: 'Madrid',
          province: 'Madrid'
        }
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.user.name).toBe('Matias');
  });

  it('debería crear datos de compañía', async () => {
    await User.findByIdAndUpdate(user._id, {
      name: 'Matias',
      lastName: 'Test',
      nif: '12345678A',
      address: {
        street: 'Calle Test',
        number: '1',
        postal: '28001',
        city: 'Madrid',
        province: 'Madrid'
      }
    });

    const res = await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Empresa Test',
        cif: `B${Date.now().toString().slice(-8)}`,
        isFreelance: false,
        address: {
          street: 'Calle Empresa',
          number: '2',
          postal: '28002',
          city: 'Madrid',
          province: 'Madrid'
        }
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveProperty('company');
  });

  it('debería unirse como guest si la compañía ya existe', async () => {
    const existingCompany = await Company.create({
      owner: user._id,
      name: 'Empresa Existente',
      cif: 'B99999999',
      address: {
        street: 'Calle Empresa',
        number: '2',
        postal: '28002',
        city: 'Madrid',
        province: 'Madrid'
      },
      isFreelance: false
    });

    const res = await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: existingCompany.name,
        cif: existingCompany.cif,
        isFreelance: false,
        address: existingCompany.address
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.user.role).toBe('guest');
  });

  it('debería obtener el usuario autenticado', async () => {
    const company = await Company.create({
      owner: user._id,
      name: 'Empresa User',
      cif: 'B11111111',
      address: {
        street: 'Calle User',
        number: '1',
        postal: '28001',
        city: 'Madrid',
        province: 'Madrid'
      }
    });

    user.company = company._id;
    await user.save();

    const res = await request(app)
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveProperty('user');
  });

  it('debería refrescar el access token', async () => {
    const res = await request(app)
      .post('/api/user/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('debería fallar refresh con token inválido', async () => {
    const res = await request(app)
      .post('/api/user/refresh')
      .send({ refreshToken: 'token_invalido' });

    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });

  it('debería cerrar sesión', async () => {
    const res = await request(app)
      .post('/api/user/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('debería cambiar la contraseña', async () => {
    const res = await request(app)
      .put('/api/user/password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: testUser.password,
        newPassword: '87654321'
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('debería fallar al cambiar contraseña con contraseña actual incorrecta', async () => {
    const res = await request(app)
      .put('/api/user/password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'contraseña_mal',
        newPassword: '87654321'
      });

    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });

  it('debería eliminar usuario lógicamente', async () => {
    const res = await request(app)
      .delete('/api/user?soft=true')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('validación email devuelve ok si el usuario ya está verificado', async () => {
    await User.findByIdAndUpdate(user._id, { status: 'verified' });

    const res = await request(app)
      .put('/api/user/validation')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: user.verificationCode });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('validación email bloquea cuando no quedan intentos', async () => {
    await User.findByIdAndUpdate(user._id, {
      verificationAttempts: 0
    });

    const res = await request(app)
      .put('/api/user/validation')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: '000000' });

    expect(res.status).toBe(429);
    expect(res.body.ok).toBe(false);
  });

  it('company falla si no se envía CIF', async () => {
    const res = await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Empresa sin CIF',
        isFreelance: false,
        address: {
          street: 'Calle Test',
          number: '1',
          postal: '28001',
          city: 'Madrid',
          province: 'Madrid'
        }
      });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  it('logo falla si el usuario no tiene compañía asociada', async () => {
    await User.findByIdAndUpdate(user._id, { company: null });

    const res = await request(app)
      .patch('/api/user/logo')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  it('refresh falla si el refresh token está expirado', async () => {
    await User.findByIdAndUpdate(user._id, {
      refreshToken,
      refreshTokenExpiresAt: new Date(Date.now() - 1000)
    });

    const res = await request(app)
      .post('/api/user/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });

  it('elimina usuario permanentemente', async () => {
    const res = await request(app)
      .delete('/api/user')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

});