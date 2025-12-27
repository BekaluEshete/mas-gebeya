const mongoose = require('mongoose');

const landSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Land title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },

  size: {
    value: { type: Number, required: true, min: [0.1, 'Size must be positive'] },
    unit: { type: String, enum: ['hectare', 'acre', 'sqm'], default: 'hectare' }
  },
  zoning: {
    type: String,
    enum: ['residential', 'commercial', 'industrial', 'agricultural', 'recreational', 'mixed'],
    required: [true, 'Zoning type is required']
  },
  landUse: {
    type: String,
    enum: ['development', 'farming', 'commercial', 'recreation', 'vineyard', 'mining', 'tourism', 'technology'],
    required: [true, 'Land use is required']
  },
  topography: {
    type: String,
    enum: ['flat', 'hilly', 'mountainous', 'rolling', 'desert', 'sloped'],
    required: [true, 'Topography is required']
  },

  waterAccess: {
    type: String,
    enum: ['none', 'well', 'river', 'lake', 'municipal', 'borehole'],
    default: 'none'
  },

  utilities: {
    electricity: { type: Boolean, default: false },
    water: { type: Boolean, default: false },
    sewer: { type: Boolean, default: false },
    gas: { type: Boolean, default: false },
    internet: { type: Boolean, default: false }
  },

  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1500, 'Description cannot exceed 1500 characters']
  },
  images: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    description: { type: String, trim: true }
  }],

  city: { type: String, required: true },
  region: { type: String, required: true },
  zone: { type: String, trim: true },
  kebele: { type: String, trim: true },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Land owner is required']
  },

  approved: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'pending', 'reserved'],
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

  nearbyAmenities: [{
    name: { type: String, required: true },
    distance: { type: Number, required: true }, // in km
    type: { type: String, enum: ['school', 'hospital', 'market', 'transport', 'religious', 'government'] }
  }]
}, {
  timestamps: true,

});

// Indexes
landSchema.index({ zoning: 1, landUse: 1, status: 1 });
landSchema.index({ price: 1 });
landSchema.index({ 'size.value': 1 });
landSchema.index({ location: '2dsphere' });
landSchema.index({ createdAt: -1 });

// Virtual for price per unit
landSchema.virtual('pricePerUnit').get(function () {
  return this.size.value > 0 ? Math.round(this.price / this.size.value) : 0;
});

// Virtual for primary image
landSchema.virtual('primaryImage').get(function () {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0];
});

module.exports = mongoose.model('Land', landSchema);
