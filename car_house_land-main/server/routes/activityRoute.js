// routes/activityRoute.js
const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const auth = require('../middleware/auth');

// Get recent activities
router.get('/recent', auth, activityController.getRecentActivities);

// Get user activities
router.get('/user/my-activities', auth, activityController.getUserActivities);

// Get activities for specific entity
router.get('/entity/:entityType/:entityId', auth, activityController.getEntityActivities);

// Create activity (mainly for internal use, but exposed for testing)
router.post('/', auth, async (req, res) => {
  try {
    const { action, entityType, entityId, description, metadata } = req.body;
    
    const activity = await activityController.createActivity(
      req.userId,
      action,
      entityType,
      entityId,
      description,
      metadata
    );
    
    if (activity) {
      res.status(201).json({
        success: true,
        activity
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create activity'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;