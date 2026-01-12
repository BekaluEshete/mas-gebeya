const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Validate Cloudinary configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error('Cloudinary configuration missing');
}

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 30000,
});

// Configure Cloudinary storage for images (marketplace)
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'marketplace',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

// Configure Cloudinary storage for documents (consultants)
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'consultant-documents',
    allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'png', 'jpeg'],
    resource_type: 'raw'
  }
});

// Multer setup for multiple image uploads (max 3 images)
const uploadImages = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024, files: 3 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(file.originalname.split('.').pop().toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error(`Invalid file type for ${file.originalname}. Only JPG, JPEG, and PNG are allowed.`));
  }
});

// Multer setup for document uploads (max 5 documents, 10MB each)
const uploadDocuments = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx|jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(file.originalname.split('.').pop().toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error(`Invalid file type for ${file.originalname}. Only PDF, DOC, DOCX, JPG, JPEG, and PNG are allowed.`));
  }
});

// Backward compatibility
const upload = uploadImages;

module.exports = { cloudinary, upload, uploadImages, uploadDocuments };