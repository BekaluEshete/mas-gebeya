const express = require('express');
const { body, param } = require('express-validator');
const {
  getLands,
  getLandById,
  createLand,
  updateLand,
  deleteLand,
  toggleFavorite,
  getLandStats
} = require('../controllers/landController');
const { protect, adminOnly, optionalAuth } = require('../middlewares/auth');
const { validateRequest } = require('../middlewares/validation');
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


// Validation rules
// const createLandValidation = [
//   body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
//   body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
//   body('zoning').isIn(['residential', 'commercial', 'industrial', 'agricultural', 'recreational', 'mixed']).withMessage('Invalid zoning type'),
//   body('landUse').isIn(['development', 'farming', 'commercial', 'recreation', 'vineyard', 'mining', 'tourism', 'technology']).withMessage('Invalid land use'),
//    body('waterAccess').optional().isIn(['none', 'well', 'river', 'lake', 'municipal', 'borehole']).withMessage('Invalid water access type'),
//    body('waterRights').optional().isBoolean().withMessage('Water rights must be a boolean'),
//   body('description').trim().isLength({ min: 20, max: 1500 }).withMessage('Description must be between 20 and 1500 characters'),
//   body('owner').isMongoId().withMessage('Invalid owner ID'),
//  ];

const updateLandValidation = [
  param('id').isMongoId().withMessage('Invalid land ID'),
  body('title').optional().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('description').optional().trim().isLength({ min: 20, max: 1500 }).withMessage('Description must be between 20 and 1500 characters')
];

// Public routes
router.get('/', optionalAuth, getLands);
router.get('/land/stats', getLandStats);
router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid land ID'),
  validateRequest,
  optionalAuth,
  getLandById
);

// Protected routes
router.use(protect);

router.post(
  '/:id/favorite',
  param('id').isMongoId().withMessage('Invalid land ID'),
  validateRequest,
  toggleFavorite
);

// Admin only routes
router.post(
  '/',

  upload.array('images', 3),
  handleMulterError,
  createLand
);

router.put(
  '/:id',
  adminOnly,
  updateLand
);

router.delete(
  '/:id',
  adminOnly,
  param('id').isMongoId().withMessage('Invalid land ID'),
  validateRequest,
  deleteLand
);

module.exports = router;