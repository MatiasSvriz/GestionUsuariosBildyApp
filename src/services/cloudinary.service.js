// src/services/cloudinary.service.js
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

class CloudinaryService {

  async uploadBuffer(buffer, options = {}) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || 'uploads',
          resource_type: options.resourceType || 'auto',
          public_id: options.publicId,
          transformation: options.transformation,
          ...options
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Convertir buffer a stream y enviarlo
      const readableStream = Readable.from(buffer);
      readableStream.pipe(uploadStream);
    });
  }

  async uploadImage(buffer, options = {}) {
    return this.uploadBuffer(buffer, {
      folder: 'images',
      resourceType: 'image',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      ...options
    });
  }

  async uploadAvatar(buffer, userId) {
    return this.uploadBuffer(buffer, {
      folder: 'avatars',
      public_id: `user_${userId}`,
      overwrite: true,
      transformation: [
        { width: 300, height: 300, crop: 'fill', gravity: 'face' },
        { radius: 'max' },
        { quality: 'auto' }
      ]
    });
  }

  async uploadProductImage(buffer, productId, index = 0) {
    return this.uploadBuffer(buffer, {
      folder: 'products',
      public_id: `product_${productId}_${index}`,
      eager: [
        { width: 150, height: 150, crop: 'fill' },   // Thumbnail
        { width: 400, height: 400, crop: 'fill' },   // Card
        { width: 800, height: 800, crop: 'limit' }   // Detail
      ],
      eager_async: true
    });
  }

  async delete(publicId, resourceType = 'image') {
    return cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
  }

  async deleteMany(publicIds, resourceType = 'image') {
    return cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType
    });
  }

  getOptimizedUrl(publicId, options = {}) {
    return cloudinary.url(publicId, {
      fetch_format: 'auto',
      quality: 'auto',
      ...options
    });
  }

  getTransformedUrl(publicId, transformations) {
    return cloudinary.url(publicId, {
      transformation: transformations
    });
  }

  async uploadSignature(buffer, deliveryNoteId) {
    return this.uploadBuffer(buffer, {
      folder: 'bildyapp/signatures',
      resourceType: 'image',
      publicId: `signature_${deliveryNoteId}`,
      overwrite: true,
      transformation: [
        { width: 800, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'webp' }
      ]
    });
  }

  async uploadPdf(buffer, deliveryNoteId) {
    return this.uploadBuffer(buffer, {
      folder: 'bildyapp/pdfs',
      resourceType: 'raw',
      publicId: `deliverynote_${deliveryNoteId}`,
      overwrite: true,
      format: 'pdf'
    });
  }

}

export default new CloudinaryService();