const express = require('express');
const router = express.Router();
const {
  getConsultations,
  createConsultation,
  updateConsultationStatus,
  deleteConsultation
} = require('../controllers/consultationController');

// Assume you have middleware like this (protect/auth for admin check)
// If not, add a basic one below or in a separate middleware file
const protect = require('../middleware/authMiddleware'); // Your existing auth middleware
const admin = require('../middleware/adminMiddleware'); // If you have admin check

// GET /api/consultations - Get all consultations (admin only)
router.get('/', protect, admin, getConsultations);

// POST /api/consultations - Create new consultation
router.post('/', protect, createConsultation); // Authenticated users only

// PUT /api/consultations/:id - Update status/notes (admin only)
router.put('/:id', protect, admin, updateConsultationStatus);

// DELETE /api/consultations/:id - Delete consultation (admin only, optional)
router.delete('/:id', protect, admin, deleteConsultation);

module.exports = router;