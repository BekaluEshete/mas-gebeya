const express = require('express');
const { body, param } = require('express-validator');
const {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  toggleFavorite,
  getCarStats
} = require('../controllers/carController');
const { protect, adminOnly, optionalAuth } = require('../middlewares/auth');
const { validateRequest } = require('../middlewares/validatorMiddleware');
const { upload } = require('../utils/cloudinary');
const rateLimit = require('express-rate-limit');
const multer = require('multer'); // Added to fix ReferenceError
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

// Rate limiter
const createCarLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: { status: 'error', message: 'Too many requests, please try again later' }
});

// Validation rules
const createCarValidation = [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('make').trim().notEmpty().withMessage('Car make is required'),
  body('model').trim().notEmpty().withMessage('Car model is required'),
  body('year')
    .isInt({ min: 1990, max: new Date().getFullYear() + 1 })
    .withMessage('Year must be between 1990 and next year'),
  body('type').isIn(['sale', 'rent']).withMessage('Type must be either sale or rent'),
  body('condition').isIn(['new', 'used']).withMessage('Condition must be either new or used'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('fuelType')
    .isIn(['gasoline', 'diesel', 'hybrid', 'electric'])
    .withMessage('Invalid fuel type'),
  body('transmission')
    .isIn(['manual', 'automatic'])
    .withMessage('Transmission must be either manual or automatic'),
  body('bodyType')
    .isIn(['sedan', 'suv', 'hatchback', 'coupe', 'pickup', 'van', 'convertible'])
    .withMessage('Invalid body type'),
  body('color').trim().notEmpty().withMessage('Color is required'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('owner').isMongoId().withMessage('Invalid owner ID'),

];

const updateCarValidation = [
  param('id').isMongoId().withMessage('Invalid car ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters')
];

// Public routes
router.get('/', optionalAuth, getCars);
router.get('/car/stats', getCarStats);
router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid car ID'),
  validateRequest,
  optionalAuth,
  getCarById
);

// Protected routes
router.use(protect);

router.post(
  '/:id/favorite',
  param('id').isMongoId().withMessage('Invalid car ID'),
  validateRequest,
  toggleFavorite
);

// Admin only routes
router.post(
  '/',
  protect,
  createCarLimiter,
  upload.array('images', 3),
  handleMulterError,
  createCarValidation,
  validateRequest,
  createCar
);

router.put(
  '/:id',
  adminOnly,
  param('id').isMongoId().withMessage('Invalid car ID'),
  upload.array('images', 10),
  updateCarValidation,
  validateRequest,
  updateCar
);

router.delete(
  '/:id',
  adminOnly,
  param('id').isMongoId().withMessage('Invalid car ID'),
  validateRequest,
  deleteCar
);

module.exports = router;