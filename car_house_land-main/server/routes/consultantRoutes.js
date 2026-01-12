const express = require('express');
const router = express.Router();
const { uploadDocuments } = require('../utils/cloudinary');
const {
  registerConsultant,
  getConsultantProfile,
  updateConsultantProfile,
  getConsultantApplications,
  approveConsultant,
  verifyDocument,
  getApprovedConsultants,
  deleteDocument
} = require('../controllers/consultantController');

const { protect, authorize } = require('../middlewares/auth');

// Public routes
router.get('/', getApprovedConsultants);

// Protected routes (authenticated users)
router.use(protect);

// Consultant registration with document upload
router.post('/register', uploadDocuments.array('documents', 5), registerConsultant);

// Consultant profile management
router.get('/profile', authorize('consultant'), getConsultantProfile);
router.put('/profile', authorize('consultant'), updateConsultantProfile);

// Document management
router.delete('/documents/:docId', authorize('consultant'), deleteDocument);

// Admin only routes
router.get('/applications', authorize('admin'), getConsultantApplications);
router.put('/:id/approve', authorize('admin'), approveConsultant);
router.put('/:id/documents/:docId/verify', authorize('admin'), verifyDocument);

module.exports = router;