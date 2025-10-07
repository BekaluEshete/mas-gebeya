// controllers/activityController.js
const Activity = require('../models/Activity');
const User = require('../models/User');

// Get recent activities
exports.getRecentActivities = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    
    const activities = await Activity.find()
      .populate('user', 'fullName email avatar')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Activity.countDocuments();

    res.json({
      success: true,
      activities,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get user-specific activities
exports.getUserActivities = async (req, res) => {
  try {
    const { limit = 15 } = req.query;
    
    const activities = await Activity.find({ user: req.userId })
      .populate('user', 'fullName email avatar')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Create activity (utility function for other controllers)
exports.createActivity = async (userId, action, entityType, entityId, description, metadata = {}) => {
  try {
    const activity = new Activity({
      user: userId,
      action,
      entityType,
      entityId,
      description,
      metadata
    });
    
    await activity.save();
    
    // Populate user info before returning
    await activity.populate('user', 'fullName email avatar');
    return activity;
  } catch (error) {
    console.error('Error creating activity:', error);
    return null;
  }
};

// Get activities by entity
exports.getEntityActivities = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { limit = 10 } = req.query;
    
    const activities = await Activity.find({
      entityType,
      entityId
    })
    .populate('user', 'fullName email avatar')
    .sort({ timestamp: -1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};