const Car = require('../models/Car');
const asyncHandler = require('express-async-handler');
const { uploadImages } = require('../utils/cloudinary');
const mongoose = require('mongoose');
const Activity = require('../models/Activity'); // NEW


const getCars = asyncHandler(async (req, res) => {
  const cars = await Car.find().lean();
  res.json(cars);
});

const getCarById = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id).lean();
  
  if (!car) {
    res.status(404);
    throw new Error('Car not found');
  }

  await Car.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
  // Log activity
  if (req.user && req.user._id) {
    await Activity.create({
      user: req.user._id,
      action: 'viewed',
      entityType: 'car',
      entityId: car._id,
      description: `viewed car: ${car.title}`,
      metadata: { carId: car._id, title: car.title }
    });
  }
  res.json(car);
});

const createCar = asyncHandler(async (req, res) => {
  const {
    title, make, model, year, type, condition, price, mileage,
    fuelType, transmission, color, bodyType, features, description,
    owner, city, region, address, kebele
  } = req.body;
 

  // Validate owner ObjectId
  if (!mongoose.isValidObjectId(owner)) {
    res.status(400);
    throw new Error('Invalid owner ID');
  }

  // Check if owner exists
  const User = require('../models/User'); // Adjust path as needed
  const ownerExists = await User.findById(owner);
  if (!ownerExists) {
    res.status(400);
    throw new Error('Owner not found');
  }

  // Parse location if it's a string
   

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
    const car = await Car.create({
      title,
      make,
      model,
      year: parseInt(year), // Ensure year is a number
      type,
      condition,
      price: parseFloat(price), // Ensure price is a number
      mileage: mileage ? parseInt(mileage) : undefined, // Ensure mileage is a number or undefined
      fuelType,
      transmission,
      color,
      bodyType,
      features: features && typeof features === 'string' ? features.split(',').map(f => f.trim()) : [],
      description,
      images,
       owner,
      city,
      region,
      address,
      kebele
    });
     // Log activity
    await Activity.create({
      user: req.userId,
      action: 'created',
      entityType: 'car',
      entityId: car._id,
      description: `added a new car: ${car.title}`,
      metadata: { 
        make: car.make, 
        model: car.model, 
        price: car.price,
        year: car.year 
      }
    });

    res.status(201).json(car);
  } catch (error) {
    console.error('Create car error:', error);
    res.status(400);
    throw new Error(`Invalid car data: ${error.message}`);
  }
});
const updateCar = asyncHandler(async (req, res) => {
   console.log('Update request body:', req.body);
  const car = await Car.findById(req.params.id);

  if (!car) {
    res.status(404);
    throw new Error('Car not found');
  }

  const updatedCar = await Car.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  
  // Log activity
  await Activity.create({
    user: req.userId,
    action: 'updated',
    entityType: 'car',
    entityId: car._id,
    description: `updated car: ${car.title}`,
    metadata: { 
      previousTitle: car.title,
      newTitle: updatedCar.title,
      price: updatedCar.price 
    }
  });

  res.json(updatedCar);
});

const deleteCar = asyncHandler(async (req, res) => {
   

  const car = await Car.findById(req.params.id);

  if (!car) {
    res.status(404);
    throw new Error('Car not found');
  }
  // Log activity before deletion
  await Activity.create({
    user: req.userId,
    action: 'deleted',
    entityType: 'car',
    entityId: car._id,
    description: `deleted car: ${car.title}`,
    metadata: { 
      title: car.title,
      make: car.make,
      model: car.model 
    }
  });

  await car.deleteOne();
  res.json({ message: 'Car removed' });
});

const toggleFavorite = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);

  if (!car) {
    res.status(404);
    throw new Error('Car not found');
  }

  const userId = req.user._id;
  const isFavorited = car.favorites.includes(userId);

  if (isFavorited) {
    car.favorites = car.favorites.filter(id => id.toString() !== userId.toString());
  } else {
    car.favorites.push(userId);
  }

  await car.save();
  res.json({ favorited: !isFavorited });
});

const getCarStats = asyncHandler(async (req, res) => {
  const totalCars = await Car.countDocuments();
  const carsByType = await Car.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);
  const carsByCondition = await Car.aggregate([
    { $group: { _id: '$condition', count: { $sum: 1 } } }
  ]);
  const avgPrice = await Car.aggregate([
    { $group: { _id: null, avgPrice: { $avg: '$price' } } }
  ]);

  res.json({
    totalCars,
    carsByType,
    carsByCondition,
    averagePrice: avgPrice[0]?.avgPrice || 0
  });
});

module.exports = {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  toggleFavorite,
  getCarStats
};


