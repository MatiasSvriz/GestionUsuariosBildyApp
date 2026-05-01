import { imageFilter } from '../src/middleware/upload.js';

describe('upload middleware', () => {

  test('acepta imagen válida', (done) => {
    const file = { mimetype: 'image/png' };

    imageFilter({}, file, (err, result) => {
      expect(err).toBeNull();
      expect(result).toBe(true);
      done();
    });
  });

  test('rechaza archivo inválido', (done) => {
    const file = { mimetype: 'application/pdf' };

    imageFilter({}, file, (err) => {
      expect(err).toBeDefined();
      expect(err.statusCode).toBe(400); // 🔥 AppError
      done();
    });
  });

});