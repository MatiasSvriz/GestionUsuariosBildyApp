// tests/pdf.service.test.js
import pdfService from '../src/services/pdf.service.js';

describe('pdf.service', () => {
  it('debería generar un PDF válido', async () => {
    const fakeNote = {
      _id: '1234567890',
      workDate: new Date('2026-04-23'),
      format: 'material',
      description: 'Entrega de ladrillos',
      material: 'Ladrillos',
      quantity: 200,
      unit: 'uds',
      signed: false,
      signedAt: null,
      signatureUrl: null,
      user: {
        name: 'Matías',
        lastName: 'García',
        email: 'matias@test.com'
      },
      client: {
        name: 'Cliente Demo',
        cif: 'B12345678',
        email: 'cliente@test.com'
      },
      project: {
        name: 'Reforma local',
        projectCode: 'PR-001',
        email: 'obra@test.com'
      },
      workers: []
    };

    const pdfBuffer = await pdfService.generateDeliveryNotePdf(fakeNote);

    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(0);

    const header = pdfBuffer.toString('utf8', 0, 4);
    expect(header).toBe('%PDF');
  });
});