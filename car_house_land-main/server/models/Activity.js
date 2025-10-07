// models/Activity.js
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['created', 'updated', 'deleted', 'logged_in', 'signed_up', 'approved', 'rejected', 'completed', 'cancelled', 'viewed']
  },
  entityType: {
    type: String,
    required: true,
    enum: ['user', 'car', 'property', 'land', 'machine', 'deal', 'consultation']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityType'
  },
  description: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster queries
activitySchema.index({ timestamp: -1 });
activitySchema.index({ user: 1, timestamp: -1 });
activitySchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('Activity', activitySchema);