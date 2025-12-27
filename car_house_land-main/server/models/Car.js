const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Car title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  make: {
    type: String,
    required: [true, 'Car make is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Car model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Manufacturing year is required'],
    min: [1990, 'Year cannot be before 1990'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  type: {
    type: String,
    enum: ['sale', 'rent'],
    required: [true, 'Car type (sale/rent) is required']
  },
  condition: {
    type: String,
    enum: ['new', 'used'],
    required: [true, 'Car condition is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },

  mileage: {
    type: Number,
    min: [0, 'Mileage cannot be negative']
  },
  fuelType: {
    type: String,
    enum: ['gasoline', 'diesel', 'hybrid', 'electric'],
    required: [true, 'Fuel type is required']
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic'],
    required: [true, 'Transmission type is required']
  },

  color: {
    type: String,
    required: [true, 'Car color is required'],
    trim: true
  },
  bodyType: {
    type: String,
    enum: ['sedan', 'suv', 'hatchback', 'coupe', 'pickup', 'van', 'convertible'],
    required: [true, 'Body type is required']
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
    isPrimary: { type: Boolean, default: false }
  }],
  city: { type: String, required: true },
  region: { type: String, required: true },
  address: { type: String, required: true },
  kebele: { type: String, trim: true },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Car owner is required']
  },
  approved: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'rented', 'pending', 'maintenance'],
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

// Indexes for better query performance
carSchema.index({ make: 1, model: 1 });
carSchema.index({ type: 1, status: 1 });
carSchema.index({ price: 1 });
carSchema.index({ createdAt: -1 });

// Virtual for primary image
carSchema.virtual('primaryImage').get(function () {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0];
});

// Method to increment views
carSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model('Car', carSchema);
