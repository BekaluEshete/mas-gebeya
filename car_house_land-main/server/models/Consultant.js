const mongoose = require('mongoose');

const consultantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },

  // Consultant Profile Information
  specialization: {
    type: [String],
    required: [true, 'Specialization is required'],
    validate: {
      validator: function(v) {
        return v.length > 0 && v.length <= 5;
      },
      message: 'Please select between 1 and 5 specializations'
    }
  },

  experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Experience cannot be negative'],
    max: [50, 'Experience cannot exceed 50 years']
  },

  education: {
    type: String,
    required: [true, 'Education background is required'],
    maxlength: [500, 'Education description cannot exceed 500 characters']
  },

  bio: {
    type: String,
    required: [true, 'Professional bio is required'],
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },

  languages: {
    type: [String],
    required: [true, 'Languages spoken is required'],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one language is required'
    }
  },

  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: [0, 'Hourly rate cannot be negative']
  },

  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'weekends', 'evenings'],
    required: [true, 'Availability is required']
  },

  // Document Verification
  documents: [{
    type: {
      type: String,
      required: true,
      enum: ['degree', 'certificate', 'license', 'cv', 'other']
    },
    title: {
      type: String,
      required: true
    },
    // Original filename (keeps extension like .pdf/.docx) to support correct downloads
    originalName: {
      type: String,
      default: null
    },
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Approval Status
  isApproved: {
    type: Boolean,
    default: false
  },

  approvedAt: Date,

  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },

  // Consultant Status
  isActive: {
    type: Boolean,
    default: true
  },

  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },

  totalConsultations: {
    type: Number,
    default: 0
  },

  // Additional fields for consultants
  linkedin: String,
  website: String,
  certifications: [String],

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
consultantSchema.index({ userId: 1 });
consultantSchema.index({ isApproved: 1, isActive: 1 });
consultantSchema.index({ specialization: 1 });
consultantSchema.index({ rating: -1 });

// Middleware to update updatedAt
consultantSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for full consultant info
consultantSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('Consultant', consultantSchema);