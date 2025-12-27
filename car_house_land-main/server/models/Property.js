const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: ['sale', 'rent'],
    required: [true, 'Property type (sale/rent) is required']
  },
  propertyType: {
    type: String,
    enum: ['house', 'apartment', 'condo', 'villa', 'commercial', 'office', 'warehouse'],
    required: [true, 'Property type is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },

  size: {
    type: String,
    required: [true, 'Size is required'],
  },
  bedrooms: {
    type: Number,
    required: [true, 'Number of bedrooms is required'],
    min: [0, 'Bedrooms cannot be negative']
  },
  bathrooms: {
    type: Number,
    required: [true, 'Number of bathrooms is required'],
    min: [0, 'Bathrooms cannot be negative']
  },
  floors: {
    type: Number,
    min: [1, 'Floors must be at least 1'],
    default: 1
  },
  parkingSpaces: {
    type: Number,
    min: [0, 'Parking spaces cannot be negative'],
    default: 0
  },
  yearBuilt: {
    type: Number,
    min: [1900, 'Year built cannot be before 1900'],
    max: [new Date().getFullYear(), 'Year built cannot be in the future']
  },
  features: [{
    type: String,
    trim: true
  }],
  amenities: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1500, 'Description cannot exceed 1500 characters']
  },
  images: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    room: { type: String, trim: true } // bedroom, bathroom, kitchen, etc.
  }],

  address: { type: String, required: true },
  city: { type: String, required: true },
  region: { type: String, required: true },


  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Property owner is required']
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




module.exports = mongoose.model('Property', propertySchema);
