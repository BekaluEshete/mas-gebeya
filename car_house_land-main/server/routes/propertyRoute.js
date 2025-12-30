const express = require('express');
const { body, param } = require('express-validator');
const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  toggleFavorite,
  getPropertyStats
} = require('../controllers/propertyController');
const { protect, adminOnly, optionalAuth } = require('../middlewares/auth');
const { validateRequest } = require('../middlewares/requestValidator');
const { upload } = require('../utils/cloudinary');
const rateLimit = require('express-rate-limit');
const multer = require('multer');

const router = express.Router();

// Multer error handler
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ status: 'error', message: `Multer error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
  next();
};



// Public routes
router.get('/', optionalAuth, getProperties);
router.get('/property/stats', getPropertyStats);
router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid property ID'),

  optionalAuth,
  getPropertyById
);

// Protected routes
router.use(protect);

router.post(
  '/:id/favorite',
  param('id').isMongoId().withMessage('Invalid property ID'),
  toggleFavorite
);

// Admin only routes
router.post(
  '/',
  protect,
  upload.array('images', 5),
  handleMulterError,
  createProperty
);

router.put(
  '/:id',
  adminOnly,
  param('id').isMongoId().withMessage('Invalid property ID'),

  updateProperty
);

router.delete(
  '/:id',
  adminOnly,
  param('id').isMongoId().withMessage('Invalid property ID'),
  deleteProperty
);

module.exports = router;