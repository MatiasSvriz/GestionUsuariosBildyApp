import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  const allowed = ['image/png', 'image/jpeg', 'image/webp'];

  if (!allowed.includes(file.mimetype)) {
    return cb(AppError.badRequest('Tipo de archivo no permitido'));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

export const uploadLogo = upload.single('logo');
export const uploadSignature = upload.single('signature');

export default upload;