const asyncHandler = require('express-async-handler');
const Land = require('../models/Land');
const User = require('../models/User');
const { cloudinary } = require('../utils/cloudinary');
const mongoose =require("mongoose")

const getLands = asyncHandler(async (req, res) => {
  const lands = await Land.find().lean();
  res.json(lands);
});

const getLandById = asyncHandler(async (req, res) => {
  const land = await Land.findById(req.params.id).lean();
  if (!land) {
    res.status(404);
    throw new Error('Land not found');
  }
  await Land.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
  res.json(land);
});

const createLand = asyncHandler(async (req, res) => {
  const {
    title, price, size, zoning, landUse, topography, waterAccess,
     utilities, waterRights, description, nearbyAmenities, owner, city, region, zone, kebele
  } = req.body;

  // Log request body for debugging
  console.log('Request body:', req.body);
  console.log('Uploaded files:', req.files);

   

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
      isPrimary: index === 0,
      description: `Image for ${title || 'land'}`
    }));
  }

  // Parse nested fields safely
  const parseJSONSafely = (str, field) => {
    try {
      return str ? JSON.parse(str) : undefined;
    } catch (error) {
      res.status(400);
      throw new Error(`Invalid JSON format for ${field}: ${error.message}`);
    }
  };

  try {
    const land = await Land.create({
      title,
      price: parseFloat(price), // Ensure price is a number
      size: parseJSONSafely(size, 'size'),
      zoning,
      landUse,
      topography,
      waterAccess,
       utilities: parseJSONSafely(utilities, 'utilities'),
      waterRights: waterRights ? waterRights === 'true' : undefined, // Convert string to boolean
      description,
      images,
      zone,
      city,
      region,
      kebele,
      nearbyAmenities: parseJSONSafely(nearbyAmenities, 'nearbyAmenities'),
      owner,
    });

    res.status(201).json({
      status: 'success',
      message: 'Land created successfully',
      data: land,
    });
  } catch (error) {
    console.error('Create land error:', error);
    res.status(400).json({
      status: 'error',
      message: `Failed to create land: ${error.message}`,
      body: req.body,
    });
  }
});

const updateLand = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized, admin access required');
  }

  const land = await Land.findById(req.params.id);
  if (!land) {
    res.status(404);
    throw new Error('Land not found');
  }

  const updatedLand = await Land.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  res.json(updatedLand);
});

const deleteLand = asyncHandler(async (req, res) => {
  const land = await Land.findById(req.params.id);
  if (!land) {
    res.status(404);
    throw new Error('Land not found');
  }

  // Delete associated images from Cloudinary
  let cloudinaryErrors = [];
  if (land.images && land.images.length > 0) {
    try {
      await Promise.all(
        land.images.map(async (image) => {
          try {
            await cloudinary.uploader.destroy(image.publicId);
            console.log('Deleted image from Cloudinary', { publicId: image.publicId });
          } catch (error) {
            console.error('Failed to delete image from Cloudinary:', {
              publicId: image.publicId,
              error: error.message || 'Unknown error',
            });
            cloudinaryErrors.push({
              publicId: image.publicId,
              error: error.message || 'Unknown error',
            });
          }
        })
      );
    } catch (error) {
      console.error('Error during Cloudinary deletion process:', error.message || 'Unknown error');
      cloudinaryErrors.push({ error: error.message || 'Unknown error' });
    }
  }

  await land.deleteOne();
  console.log('Land deleted successfully', { landId: req.params.id });

  // Send a single response
  if (cloudinaryErrors.length > 0) {
    res.status(200).json({
      status: 'warning',
      message: 'Land deleted successfully, but failed to delete some images from Cloudinary',
      errors: cloudinaryErrors,
    });
  } else {
    res.status(200).json({
      status: 'success',
      message: 'Land and associated images removed successfully',
    });
  }
});



const toggleFavorite = asyncHandler(async (req, res) => {
  const land = await Land.findById(req.params.id);
  if (!land) {
    res.status(404);
    throw new Error('Land not found');
  }

  const userId = req.user._id;
  const isFavorited = land.favorites.includes(userId);

  if (isFavorited) {
    land.favorites = land.favorites.filter(id => id.toString() !== userId.toString());
  } else {
    land.favorites.push(userId);
  }

  await land.save();
  res.json({ favorited: !isFavorited });
});

const getLandStats = asyncHandler(async (req, res) => {
  const totalLands = await Land.countDocuments();
  const landsByZoning = await Land.aggregate([
    { $group: { _id: '$zoning', count: { $sum: 1 } } }
  ]);
  const landsByLandUse = await Land.aggregate([
    { $group: { _id: '$landUse', count: { $sum: 1 } } }
  ]);
  const avgPrice = await Land.aggregate([
    { $group: { _id: null, avgPrice: { $avg: '$price' } } }
  ]);

  res.json({
    totalLands,
    landsByZoning,
    landsByLandUse,
    averagePrice: avgPrice[0]?.avgPrice || 0
  });
});

module.exports = {
  getLands,
  getLandById,
  createLand,
  updateLand,
  deleteLand,
  toggleFavorite,
  getLandStats
};