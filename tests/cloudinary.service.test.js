import { jest } from '@jest/globals';
import { Writable } from 'node:stream';

const uploadStreamMock = jest.fn();
const destroyMock = jest.fn();
const deleteResourcesMock = jest.fn();
const urlMock = jest.fn();

jest.unstable_mockModule('cloudinary', async () => {
  const { Writable } = await import('node:stream');

  return {
    v2: {
      config: jest.fn(),
      uploader: {
        upload_stream: uploadStreamMock,
        destroy: destroyMock
      },
      api: {
        delete_resources: deleteResourcesMock
      },
      url: urlMock
    }
  };
});

const { default: cloudinaryService } = await import('../src/services/cloudinary.service.js');

describe('cloudinary.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    uploadStreamMock.mockImplementation((options, callback) => {
      const writable = new Writable({
        write(chunk, encoding, done) {
          done();
        }
      });

      writable.on('finish', () => {
        callback(null, {
          secure_url: 'https://fake.cloudinary.com/file',
          public_id: options.public_id,
          resource_type: options.resource_type
        });
      });

      return writable;
    });

    destroyMock.mockResolvedValue({ result: 'ok' });
    deleteResourcesMock.mockResolvedValue({ deleted: {} });
    urlMock.mockReturnValue('https://fake.cloudinary.com/optimized');
  });

  test('sube una firma correctamente', async () => {
    const result = await cloudinaryService.uploadSignature(
      Buffer.from('firma'),
      'note123'
    );

    expect(result.secure_url).toBeDefined();
    expect(uploadStreamMock).toHaveBeenCalled();
  });

  test('sube un PDF correctamente', async () => {
    const result = await cloudinaryService.uploadPdf(
      Buffer.from('pdf'),
      'note123'
    );

    expect(result.secure_url).toBeDefined();
    expect(uploadStreamMock).toHaveBeenCalled();
  });

  test('sube una imagen correctamente', async () => {
    const result = await cloudinaryService.uploadImage(
      Buffer.from('image')
    );

    expect(result.secure_url).toBeDefined();
  });

  test('sube avatar correctamente', async () => {
    const result = await cloudinaryService.uploadAvatar(
      Buffer.from('avatar'),
      'user123'
    );

    expect(result.secure_url).toBeDefined();
  });

  test('elimina un archivo', async () => {
    const result = await cloudinaryService.delete('public-id');

    expect(result.result).toBe('ok');
    expect(destroyMock).toHaveBeenCalledWith('public-id', {
      resource_type: 'image'
    });
  });

  test('elimina varios archivos', async () => {
    await cloudinaryService.deleteMany(['id1', 'id2']);

    expect(deleteResourcesMock).toHaveBeenCalledWith(['id1', 'id2'], {
      resource_type: 'image'
    });
  });

  test('genera URL optimizada', () => {
    const url = cloudinaryService.getOptimizedUrl('public-id');

    expect(url).toBe('https://fake.cloudinary.com/optimized');
    expect(urlMock).toHaveBeenCalled();
  });

  test('genera URL transformada', () => {
    const url = cloudinaryService.getTransformedUrl('public-id', [
      { width: 300 }
    ]);

    expect(url).toBe('https://fake.cloudinary.com/optimized');
    expect(urlMock).toHaveBeenCalled();
  });
});