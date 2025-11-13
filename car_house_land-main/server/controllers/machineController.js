const asyncHandler = require('express-async-handler');
const Machine = require('../models/Machine');
const { cloudinary, uploadImages } = require('../utils/cloudinary');
const mongoose = require("mongoose");
const User = require('../models/User');

const getMachines = asyncHandler(async (req, res) => {
  const machines = await Machine.find().lean();
  res.json(machines);
});

const getMachineById = asyncHandler(async (req, res) => {
  const machine = await Machine.findById(req.params.id).lean();
  if (!machine) {
    res.status(404);
    throw new Error('Machine not found');
  }
  await Machine.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
  res.json(machine);
});

const createMachine = asyncHandler(async (req, res) => {
  const {
    title,
    category,
    brand,
    model,
    condition,
    price,
    yearManufactured,
    features,
    description,
    address,
    city,
    region,
    zone,
    owner,
    status,
    type, //  type to destructuring added ... this fucking bug hussles me
  } = req.body;

  // Validate required fields
  const requiredFields = ['title', 'category', 'brand', 'condition', 'price', 'description', 'address', 'city', 'owner', 'type']; // Added type to required fields
  for (const field of requiredFields) {
    if (!req.body[field]) {
      res.status(400);
      throw new Error(`Missing required field: ${field}`);
    }
  }

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

  // Handle image uploads (Cloudinary via multer-storage-cloudinary)
  let images = [];
  if (req.files && req.files.length > 0) {
    if (req.files.length > 3) {
      res.status(400);
      throw new Error('Maximum 3 images allowed');
    }
    images = req.files.map((file, index) => ({
      url: file.path, // Cloudinary URL
      publicId: file.filename, // Cloudinary public ID
      isPrimary: req.body[`images[${index}][isPrimary]`] === 'true' || index === 0,
      description: req.body[`images[${index}][description]`] || `Image for ${title || 'machine'}`,
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

  // Handle features array
  const parsedFeatures = Array.isArray(features)
    ? features.map(f => f.trim())
    : typeof features === 'string'
    ? features.split(',').map(f => f.trim())
    : [];

  try {
    const machine = await Machine.create({
      title,
      category,
      brand,
      model,
      condition,
      price: parseFloat(price), // Ensure price is a number
      yearManufactured: yearManufactured ? parseInt(yearManufactured) : undefined,
      features: parsedFeatures,
      description,
      images,
      address,
      city,
      region,
      zone,
      owner,
      status: status || 'available', // Default to 'available' if not provided
      type, // Include type in the create call
    });

    res.status(201).json({
      status: 'success',
      message: 'Machine created successfully',
      data: machine,
    });
  } catch (error) {
    console.error('Create machine error:', error);
    res.status(400).json({
      status: 'error',
      message: `Failed to create machine: ${error.message}`,
      body: req.body,
    });
  }
});

const updateMachine = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized, admin access required');
  }

  const machine = await Machine.findById(req.params.id);
  if (!machine) {
    res.status(404);
    throw new Error('Machine not found');
  }

  const updatedMachine = await Machine.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  res.json(updatedMachine);
});

const deleteMachine = asyncHandler(async (req, res) => {
  const machine = await Machine.findById(req.params.id);
  if (!machine) {
    res.status(404);
    throw new Error('Machine not found');
  }

  // Delete associated images from Cloudinary
  if (machine.images && machine.images.length > 0) {
    try {
      await Promise.all(
        machine.images.map(async (image) => {
          await cloudinary.uploader.destroy(image.publicId);
        })
      );
    } catch (error) {
      // Proceed with deletion despite Cloudinary errors
    }
  }

  await machine.deleteOne();
  res.json({ message: 'Machine removed' });
});

const toggleFavorite = asyncHandler(async (req, res) => {
  const machine = await Machine.findById(req.params.id);
  if (!machine) {
    res.status(404);
    throw new Error('Machine not found');
  }

  const userId = req.user._id;
  const isFavorited = machine.favorites.includes(userId);

  if (isFavorited) {
    machine.favorites = machine.favorites.filter(id => id.toString() !== userId.toString());
  } else {
    machine.favorites.push(userId);
  }

  await machine.save();
  res.json({ favorited: !isFavorited });
});

const getMachineStats = asyncHandler(async (req, res) => {
  const totalMachines = await Machine.countDocuments();
  const machinesByCategory = await Machine.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  const machinesByCondition = await Machine.aggregate([
    { $group: { _id: '$condition', count: { $sum: 1 } } }
  ]);
  const avgPrice = await Machine.aggregate([
    { $group: { _id: null, avgPrice: { $avg: '$price' } } }
  ]);

  res.json({
    totalMachines,
    machinesByCategory,
    machinesByCondition,
    averagePrice: avgPrice[0]?.avgPrice || 0
  });
});

module.exports = {
  getMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  toggleFavorite,
  getMachineStats
};