// src/services/storage.service.js
import { mkdir, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import crypto from 'node:crypto';

class StorageService {
  async uploadFile(buffer, { folder = 'uploads', fileName = 'file', mimetype = 'application/octet-stream' } = {}) {
    const baseDir = join(process.cwd(), folder);
    await mkdir(baseDir, { recursive: true });

    let extension = '';

    if (mimetype === 'image/png') extension = '.png';
    else if (mimetype === 'image/jpeg') extension = '.jpg';
    else if (mimetype === 'image/webp') extension = '.webp';
    else if (mimetype === 'application/pdf') extension = '.pdf';

    const safeName = `${fileName}-${crypto.randomBytes(6).toString('hex')}${extension}`;
    const filePath = join(baseDir, safeName);

    await writeFile(filePath, buffer);

    return {
      url: `/${folder}/${safeName}`,
      path: filePath
    };
  }
}

export default new StorageService();