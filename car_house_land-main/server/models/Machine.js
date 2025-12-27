const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Machine title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  category: {
    type: String,
    enum: ['electronics', 'appliances', 'industrial', 'agricultural', 'construction', 'medical', 'automotive'],
    required: [true, 'Machine category is required']
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['sale', 'rent'],
    required: [true, 'machine type (sale/rent) is required']
  },
  condition: {
    type: String,
    enum: ['new', 'used', 'refurbished'],
    required: [true, 'Machine condition is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  yearManufactured: {
    type: Number,
    min: [1990, 'Year cannot be before 1990'],
    max: [new Date().getFullYear(), 'Year cannot be in the future']
  },

  features: [{
    type: String,
    trim: true
  }],

  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  images: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    description: { type: String, trim: true }
  }],
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  zone: {
    type: String,
    trim: true,
  },
  region: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Machine owner is required']
  },
  approved: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'pending', 'maintenance', 'reserved'],
    default: 'available'
  },
  views: {
    type: Number,
    default: 0
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

}, {
  timestamps: true,
});

// Indexes
machineSchema.index({ category: 1, subcategory: 1, status: 1 });
machineSchema.index({ brand: 1, model: 1 });
machineSchema.index({ price: 1 });
machineSchema.index({ condition: 1 });
machineSchema.index({ createdAt: -1 });

// Virtual for primary image
machineSchema.virtual('primaryImage').get(function () {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0];
});

module.exports = mongoose.model('Machine', machineSchema);