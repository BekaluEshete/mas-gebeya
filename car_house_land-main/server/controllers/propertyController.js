const Property = require('../models/Property');
const asyncHandler = require('express-async-handler');
const { cloudinary } = require('../utils/cloudinary');
const mongoose = require('mongoose');
const User = require('../models/User');

const getProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find().lean();
  res.json(properties);
});

const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).lean();
  
  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  await Property.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
  res.json(property);
});


const createProperty = asyncHandler(async (req, res) => {
  const {
    title, type, propertyType, price, size, bedrooms, bathrooms,
    floors, parkingSpaces, yearBuilt, features, amenities, description,
    city, address, region, owner
  } = req.body;
  

  // Validate owner ObjectId
  if (!mongoose.isValidObjectId(owner)) {
    res.status(400);
    throw new Error('Invalid owner ID');
  }

  // Check if owner exists
  const ownerExists = await User.findById(owner);
  if (!ownerExists) {
    res.status(400);
    throw new Error('Owner not found');
  }

  // Validate features is an array
  let parsedFeatures = [];
  if (features) {
    try {
      parsedFeatures = Array.isArray(features) ? features : JSON.parse(features);
      if (!Array.isArray(parsedFeatures)) {
        res.status(400);
        throw new Error('Features must be an array');
      }
    } catch (error) {
      res.status(400);
      throw new Error('Invalid features format');
    }
  }

  // Handle image uploads
  let images = [];
  if (req.files && req.files.length > 0) {
    if (req.files.length > 3) {
      res.status(400);
      throw new Error('Maximum 3 images allowed');
    }
    images = req.files.map((file, index) => ({
      url: file.path, // Cloudinary URL
      publicId: file.filename, // Cloudinary public ID
      isPrimary: index === 0
    }));
  }

  try {
    const property = await Property.create({
      title,
      type,
      propertyType,
      price: parseFloat(price),
      size ,
      bedrooms: parseInt(bedrooms),
      bathrooms: parseInt(bathrooms),
      floors: floors ? parseInt(floors) : undefined,
      parkingSpaces: parkingSpaces ? parseInt(parkingSpaces) : undefined,
      yearBuilt: yearBuilt ? parseInt(yearBuilt) : undefined,
      features: parsedFeatures,
      amenities: amenities ? (Array.isArray(amenities) ? amenities : JSON.parse(amenities)) : [],
      description,
      images,
      city,
      address,
      region,
      owner
    });

    // Ensure response is sent only once
    return res.status(201).json({
      success: true,
      data: property,
      message: 'Property created successfully'
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(400);
    throw new Error(`Invalid property data: ${error.message}`);
  }
});


const updateProperty = asyncHandler(async (req, res) => {
  console.log('Update request body:', req.body);
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  const updatedProperty = await Property.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  res.json(updatedProperty);
});

const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  await property.deleteOne();
  res.json({ message: 'Property removed' });
});

const toggleFavorite = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  const userId = req.user._id;
  const isFavorited = property.favorites.includes(userId);

  if (isFavorited) {
    property.favorites = property.favorites.filter(id => id.toString() !== userId.toString());
  } else {
    property.favorites.push(userId);
  }

  await property.save();
  res.json({ favorited: !isFavorited });
});

const getPropertyStats = asyncHandler(async (req, res) => {
  const totalProperties = await Property.countDocuments();
  const propertiesByType = await Property.aggregate([
    { $group: { _id: '$propertyType', count: { $sum: 1 } } }
  ]);
  const propertiesByStatus = await Property.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  const avgPrice = await Property.aggregate([
    { $group: { _id: null, avgPrice: { $avg: '$price' } } }
  ]);

  res.json({
    totalProperties,
    propertiesByType,
    propertiesByStatus,
    averagePrice: avgPrice[0]?.avgPrice || 0
  });
});

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  toggleFavorite,
  getPropertyStats
};