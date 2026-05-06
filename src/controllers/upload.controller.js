// src/controllers/upload.controller.js
import cloudinaryService from '../services/cloudinary.service.js';
import User from '../models/User.js';

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió imagen' });
    }

    const result = await cloudinaryService.uploadAvatar(
      req.file.buffer,
      req.user._id
    );

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar: result.secure_url,
        avatarPublicId: result.public_id
      },
      { new: true }
    );

    res.json({
      message: 'Avatar actualizado',
      avatar: user.avatar
    });
  } catch (error) {
    next(error);
  }
};

export const uploadProductImages = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!req.files?.length) {
      return res.status(400).json({ error: 'No se enviaron imágenes' });
    }

    const uploadPromises = req.files.map((file, index) =>
      cloudinaryService.uploadProductImage(
        file.buffer,
        productId,
        index
      )
    );

    const results = await Promise.all(uploadPromises);

    const images = results.map(r => ({
      url: r.secure_url,
      publicId: r.public_id,
      thumbnails: r.eager?.map(e => e.secure_url) || []
    }));

    res.json({
      message: `${images.length} imágenes subidas`,
      images
    });
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.params;

    await cloudinaryService.delete(publicId);

    res.json({ message: 'Imagen eliminada' });
  } catch (error) {
    next(error);
  }
};