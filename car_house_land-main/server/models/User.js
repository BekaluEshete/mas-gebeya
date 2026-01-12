const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [80, 'Full name cannot exceed 80 characters']
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\+251\d{9}$/, 'Please enter a valid Ethiopian phone number']
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'owner', 'consultant', 'consult_requester'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  address: {
    street: String,
    city: String,
    region: String,
    country: {
      type: String,
      default: 'ETHIOPIA',
      uppercase: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: String,
  verificationCodeExpire: Date,
  resetCode: String,
  resetCodeExpire: Date,
  lastLogin: Date
}, {
  timestamps: true
});


// Middleware
userSchema.pre('save', async function (next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }

  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    throw new Error('Password not set or not selected in query');
  }
  return bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model('User', userSchema);
