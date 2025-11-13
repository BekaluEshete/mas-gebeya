const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true,
    match: [/^\+251\d{9}$/, 'Please enter a valid Ethiopian phone number (+251 followed by 9 digits)']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Research', 'Cases in law', 'Health', 'Business'],
      message: 'Category must be one of: Research, Cases in law, Health, Business'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Consultation type is required'],
    enum: {
      values: ['Research', 'Cases in law', 'Health', 'Business'],
      message: 'Type must be one of: Research, Cases in law, Health, Business'
    }
  },
  mode: {
    type: String,
    required: [true, 'Consultation mode is required'],
    enum: {
      values: ['Online video call', 'Phone call', 'In-person'],
      message: 'Mode must be one of: Online video call, Phone call, In-person'
    }
  },
  dateTime: {
    type: Date,
    required: [true, 'Date and time is required']
  },
  status: {
    type: String,
    default: 'pending',
    enum: {
      values: ['pending', 'accepted', 'rescheduled', 'cancelled', 'completed'],
      message: 'Status must be one of: pending, accepted, rescheduled, cancelled, completed'
    }
  },
  agentNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Agent notes cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
consultationSchema.index({ status: 1, dateTime: -1 });
consultationSchema.index({ email: 1 });

const Consultation = mongoose.model('Consultation', consultationSchema);

module.exports = Consultation;