const Consultation = require('../models/Consultation');

// @desc    Get all consultations (admin only)
// @route   GET /api/consultations
// @access  Private (admin)
const getConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .sort({ createdAt: -1 }) // Most recent first
      .select('-__v'); // Exclude version key

    res.status(200).json({
      status: 'success',
      data: consultations
    });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching consultations'
    });
  }
};

// @desc    Create a new consultation
// @route   POST /api/consultations
// @access  Private (authenticated user)
const createConsultation = async (req, res) => {
  try {
    const { fullName, email, phone, category, description, type, mode, dateTime } = req.body;

    // Basic validation (Mongoose will handle schema validation)
    if (!fullName || !email || !phone || !category || !description || !type || !mode || !dateTime) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required'
      });
    }

    // Check if dateTime is in the future
    if (new Date(dateTime) < new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'Consultation date must be in the future'
      });
    }

    const consultation = await Consultation.create({
      fullName,
      email,
      phone,
      category,
      description,
      type,
      mode,
      dateTime
    });

    // TODO: Send confirmation email/SMS here (e.g., using Nodemailer or Twilio)

    res.status(201).json({
      status: 'success',
      data: consultation
    });
  } catch (error) {
    console.error('Error creating consultation:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        status: 'error',
        message: messages
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating consultation'
    });
  }
};

// @desc    Update consultation status/notes (admin only)
// @route   PUT /api/consultations/:id
// @access  Private (admin)
const updateConsultationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, agentNotes } = req.body;

    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'Status is required'
      });
    }

    const consultation = await Consultation.findByIdAndUpdate(
      id,
      { status, agentNotes, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!consultation) {
      return res.status(404).json({
        status: 'error',
        message: 'Consultation not found'
      });
    }

    // TODO: Send notification to user (email/SMS) about status change

    res.status(200).json({
      status: 'success',
      data: consultation
    });
  } catch (error) {
    console.error('Error updating consultation:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        status: 'error',
        message: messages
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating consultation'
    });
  }
};

// @desc    Delete a consultation (admin only, optional)
// @route   DELETE /api/consultations/:id
// @access  Private (admin)
const deleteConsultation = async (req, res) => {
  try {
    const { id } = req.params;

    const consultation = await Consultation.findByIdAndDelete(id);

    if (!consultation) {
      return res.status(404).json({
        status: 'error',
        message: 'Consultation not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Consultation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting consultation:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting consultation'
    });
  }
};

module.exports = {
  getConsultations,
  createConsultation,
  updateConsultationStatus,
  deleteConsultation
};