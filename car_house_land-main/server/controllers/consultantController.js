const Consultant = require('../models/Consultant');
const User = require('../models/User');
const { cloudinary } = require('../utils/cloudinary');

// @desc    Register as a consultant
// @route   POST /api/consultants/register
// @access  Private (authenticated user)
const registerConsultant = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      specialization,
      experience,
      education,
      bio,
      languages,
      hourlyRate,
      availability,
      linkedin,
      website,
      certifications
    } = req.body;

    // Check if user already has a consultant profile
    const existingConsultant = await Consultant.findOne({ userId });
    if (existingConsultant) {
      return res.status(400).json({
        status: 'error',
        message: 'Consultant profile already exists for this user'
      });
    }

    // Validate required fields
    if (!specialization || !experience || !education || !bio || !languages || !hourlyRate || !availability) {
      return res.status(400).json({
        status: 'error',
        message: 'All required fields must be provided'
      });
    }

    // Parse arrays
    let parsedSpecialization = [];
    let parsedLanguages = [];
    let parsedCertifications = [];

    try {
      parsedSpecialization = Array.isArray(specialization) ? specialization : JSON.parse(specialization);
      parsedLanguages = Array.isArray(languages) ? languages : JSON.parse(languages);
      if (certifications) {
        parsedCertifications = Array.isArray(certifications) ? certifications : JSON.parse(certifications);
      }
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid array format for specialization, languages, or certifications'
      });
    }

    // Handle document uploads
    let documents = [];
    if (req.files && req.files.length > 0) {
      documents = req.files.map((file, index) => ({
        type: req.body.documentTypes ? JSON.parse(req.body.documentTypes)[index] : 'other',
        title: req.body.documentTitles ? JSON.parse(req.body.documentTitles)[index] : `Document ${index + 1}`,
        originalName: file.originalname || null,
        url: file.path,
        publicId: file.filename,
        verified: false,
        uploadedAt: new Date()
      }));
    }

    // Create consultant profile
    const consultant = await Consultant.create({
      userId,
      specialization: parsedSpecialization,
      experience: parseInt(experience),
      education,
      bio,
      languages: parsedLanguages,
      hourlyRate: parseFloat(hourlyRate),
      availability,
      documents,
      linkedin,
      website,
      certifications: parsedCertifications
    });

    // Update user role to consultant
    await User.findByIdAndUpdate(userId, { role: 'consultant' });

    res.status(201).json({
      status: 'success',
      message: 'Consultant registration submitted successfully. Please wait for admin approval.',
      data: consultant
    });
  } catch (error) {
    console.error('Consultant registration error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        status: 'error',
        message: messages
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Server error while registering consultant'
    });
  }
};

// @desc    Get consultant profile
// @route   GET /api/consultants/profile
// @access  Private (consultant)
const getConsultantProfile = async (req, res) => {
  try {
    const consultant = await Consultant.findOne({ userId: req.user._id })
      .populate('userId', 'fullName email phone avatar')
      .select('-__v');

    if (!consultant) {
      return res.status(404).json({
        status: 'error',
        message: 'Consultant profile not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: consultant
    });
  } catch (error) {
    console.error('Get consultant profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching consultant profile'
    });
  }
};

// @desc    Update consultant profile
// @route   PUT /api/consultants/profile
// @access  Private (consultant)
const updateConsultantProfile = async (req, res) => {
  try {
    const {
      specialization,
      experience,
      education,
      bio,
      languages,
      hourlyRate,
      availability,
      linkedin,
      website,
      certifications
    } = req.body;

    const updateData = {};

    if (specialization) {
      updateData.specialization = Array.isArray(specialization) ? specialization : JSON.parse(specialization);
    }
    if (experience !== undefined) updateData.experience = parseInt(experience);
    if (education) updateData.education = education;
    if (bio) updateData.bio = bio;
    if (languages) {
      updateData.languages = Array.isArray(languages) ? languages : JSON.parse(languages);
    }
    if (hourlyRate !== undefined) updateData.hourlyRate = parseFloat(hourlyRate);
    if (availability) updateData.availability = availability;
    if (linkedin !== undefined) updateData.linkedin = linkedin;
    if (website !== undefined) updateData.website = website;
    if (certifications) {
      updateData.certifications = Array.isArray(certifications) ? certifications : JSON.parse(certifications);
    }

    const consultant = await Consultant.findOneAndUpdate(
      { userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'fullName email phone avatar');

    if (!consultant) {
      return res.status(404).json({
        status: 'error',
        message: 'Consultant profile not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Consultant profile updated successfully',
      data: consultant
    });
  } catch (error) {
    console.error('Update consultant profile error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        status: 'error',
        message: messages
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating consultant profile'
    });
  }
};

// @desc    Get all consultant applications (admin only)
// @route   GET /api/consultants/applications
// @access  Private (admin)
const getConsultantApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status === 'pending') {
      filter.isApproved = false;
    } else if (req.query.status === 'approved') {
      filter.isApproved = true;
    }

    const consultants = await Consultant.find(filter)
      .populate('userId', 'fullName email phone avatar createdAt')
      .populate('approvedBy', 'fullName')
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Consultant.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: consultants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get consultant applications error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching consultant applications'
    });
  }
};

// @desc    Approve or reject consultant application
// @route   PUT /api/consultants/:id/approve
// @access  Private (admin)
const approveConsultant = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, rejectionReason } = req.body;

    const consultant = await Consultant.findById(id);
    if (!consultant) {
      return res.status(404).json({
        status: 'error',
        message: 'Consultant application not found'
      });
    }

    if (approved) {
      consultant.isApproved = true;
      consultant.approvedAt = new Date();
      consultant.approvedBy = req.user._id;
      consultant.rejectionReason = undefined;

      // Update user role to consultant (in case it was changed)
      await User.findByIdAndUpdate(consultant.userId, { role: 'consultant' });
    } else {
      consultant.isApproved = false;
      consultant.rejectionReason = rejectionReason;

      // Reset user role to user
      await User.findByIdAndUpdate(consultant.userId, { role: 'user' });
    }

    await consultant.save();

    res.status(200).json({
      status: 'success',
      message: approved ? 'Consultant approved successfully' : 'Consultant application rejected',
      data: consultant
    });
  } catch (error) {
    console.error('Approve consultant error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while processing consultant approval'
    });
  }
};

// @desc    Verify consultant document
// @route   PUT /api/consultants/:id/documents/:docId/verify
// @access  Private (admin)
const verifyDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;
    const { verified } = req.body;

    const consultant = await Consultant.findById(id);
    if (!consultant) {
      return res.status(404).json({
        status: 'error',
        message: 'Consultant not found'
      });
    }

    const document = consultant.documents.id(docId);
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found'
      });
    }

    document.verified = verified;
    await consultant.save();

    res.status(200).json({
      status: 'success',
      message: verified ? 'Document verified successfully' : 'Document verification removed',
      data: document
    });
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while verifying document'
    });
  }
};

// @desc    Get approved consultants (public)
// @route   GET /api/consultants
// @access  Public
const getApprovedConsultants = async (req, res) => {
  try {
    const { specialization, minRating, maxRate } = req.query;

    const filter = {
      isApproved: true,
      isActive: true
    };

    if (specialization) {
      filter.specialization = { $in: [specialization] };
    }

    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }

    if (maxRate) {
      filter.hourlyRate = { $lte: parseFloat(maxRate) };
    }

    const consultants = await Consultant.find(filter)
      .populate('userId', 'fullName email phone avatar')
      .select('-documents -rejectionReason -__v')
      .sort({ rating: -1, totalConsultations: -1 });

    res.status(200).json({
      status: 'success',
      data: consultants
    });
  } catch (error) {
    console.error('Get approved consultants error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching consultants'
    });
  }
};

// @desc    Delete consultant document
// @route   DELETE /api/consultants/documents/:docId
// @access  Private (consultant)
const deleteDocument = async (req, res) => {
  try {
    const { docId } = req.params;

    const consultant = await Consultant.findOne({ userId: req.user._id });
    if (!consultant) {
      return res.status(404).json({
        status: 'error',
        message: 'Consultant profile not found'
      });
    }

    const document = consultant.documents.id(docId);
    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found'
      });
    }

    // Delete from Cloudinary
    if (document.publicId) {
      await cloudinary.uploader.destroy(document.publicId);
    }

    // Remove from database
    consultant.documents.pull(docId);
    await consultant.save();

    res.status(200).json({
      status: 'success',
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting document'
    });
  }
};

module.exports = {
  registerConsultant,
  getConsultantProfile,
  updateConsultantProfile,
  getConsultantApplications,
  approveConsultant,
  verifyDocument,
  getApprovedConsultants,
  deleteDocument
};