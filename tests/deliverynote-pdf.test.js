import request from 'supertest';
import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/middleware/auth.middleware.js', () => ({
  default: (req, res, next) => {
    req.user = {
      _id: 'user123',
      company: 'company123',
      role: 'admin'
    };
    next();
  },
  authMiddleware: (req, res, next) => {
    req.user = {
      _id: 'user123',
      company: 'company123',
      role: 'admin'
    };
    next();
  }
}));

jest.unstable_mockModule('../src/models/DeliveryNote.js', () => ({
  default: {
    findOne: jest.fn()
  }
}));

const { default: app } = await import('../src/app.js');
const { default: DeliveryNote } = await import('../src/models/DeliveryNote.js');

describe('GET /api/deliverynote/pdf/:id', () => {
  it('debería devolver un PDF si no existe pdfUrl', async () => {
    DeliveryNote.findOne.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      then: undefined,
      exec: undefined
    });

    const fakeNote = {
      _id: 'note123',
      company: 'company123',
      deleted: false,
      signed: false,
      pdfUrl: null,
      workDate: new Date(),
      format: 'material',
      description: 'Entrega de cemento',
      material: 'Cemento',
      quantity: 20,
      unit: 'sacos',
      user: {
        name: 'Matías',
        lastName: 'Test',
        email: 'test@test.com'
      },
      client: {
        name: 'Cliente Test',
        cif: 'B12345678',
        email: 'cliente@test.com'
      },
      project: {
        name: 'Proyecto Test',
        projectCode: 'PR-001',
        email: 'obra@test.com'
      },
      workers: []
    };

    DeliveryNote.findOne.mockImplementation(() => ({
      populate() {
        return this;
      },
      then(resolve) {
        return resolve(fakeNote);
      }
    }));

    const res = await request(app)
      .get('/api/deliverynote/pdf/note123')
      .expect(200);

    expect(res.headers['content-type']).toMatch(/application\/pdf/);
  });

  it('debería devolver pdfUrl si el albarán ya está firmado y subido', async () => {
    const fakeNote = {
      _id: 'note456',
      company: 'company123',
      deleted: false,
      signed: true,
      pdfUrl: '/uploads/test.pdf',
      user: {},
      client: {},
      project: {}
    };

    DeliveryNote.findOne.mockImplementation(() => ({
      populate() {
        return this;
      },
      then(resolve) {
        return resolve(fakeNote);
      }
    }));

    const res = await request(app)
      .get('/api/deliverynote/pdf/note456')
      .expect(200);

    expect(res.body.pdfUrl).toBe('/uploads/test.pdf');
  });
});