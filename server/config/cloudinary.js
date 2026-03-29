const cloudinaryModule = require('cloudinary');
const CloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');

// no config() call needed — SDK reads CLOUDINARY_URL from .env automatically

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryModule,
  params: {
    folder: 'videogamestats/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  },
});

module.exports = { cloudinary: cloudinaryModule.v2, upload: multer({ storage }) };