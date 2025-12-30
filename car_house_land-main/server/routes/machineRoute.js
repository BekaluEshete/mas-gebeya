const express = require('express');
const { body, param } = require('express-validator');
const {
  getMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  toggleFavorite,
  getMachineStats
} = require('../controllers/machineController');
const { protect, adminOnly, optionalAuth } = require('../middlewares/auth');
const { validateRequest } = require('../middlewares/requestValidator');
const { upload } = require('../utils/cloudinary');
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
router.get('/', optionalAuth, getMachines);
router.get('/machine/stats', getMachineStats);
router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid machine ID'),
  validateRequest,
  optionalAuth,
  getMachineById
);

// Protected routes
router.use(protect);

router.post(
  '/:id/favorite',
  param('id').isMongoId().withMessage('Invalid machine ID'),
  toggleFavorite
);

// Admin only routes
router.post(
  '/',


  upload.array('images', 3),
  validateRequest,
  createMachine
);

router.put(
  '/:id',
  adminOnly,

  validateRequest,
  updateMachine
);

router.delete(
  '/:id',
  adminOnly,
  param('id').isMongoId().withMessage('Invalid machine ID'),
  validateRequest,
  deleteMachine
);

module.exports = router;