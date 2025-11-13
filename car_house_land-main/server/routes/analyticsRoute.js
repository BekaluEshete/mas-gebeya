// routes/analytics.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Monthly User Growth
router.get('/user-growth', analyticsController.getUserGrowth);

// Monthly Deal Completion
router.get('/deal-completion', analyticsController.getDealCompletion);

// Today's Daily Traffic
router.get('/daily-traffic', analyticsController.getDailyTraffic);

module.exports = router;