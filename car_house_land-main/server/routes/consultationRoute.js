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
const { protect } = require('../middlewares/auth'); //


// GET /api/consultations - Get all consultations (admin only)
router.get('/', protect, getConsultations);

// POST /api/consultations - Create new consultation
router.post('/', createConsultation); // Authenticated users only

// PUT /api/consultations/:id - Update status/notes (admin only)
router.put('/:id', protect, updateConsultationStatus);

// DELETE /api/consultations/:id - Delete consultation (admin only, optional)
router.delete('/:id', protect,  deleteConsultation);

module.exports = router;