const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema(
  {
    

    // Buyer and Seller
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer is required'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
    },

    // Item being sold or rented
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Item is required'],
      refPath: 'itemType', // dynamic reference
    },
    itemType: {
      type: String,
      required: [true, 'Item type is required'],
      enum: ['Car', 'Property', 'Land', 'Machine'],
    },

    
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },

    completedAt: Date,
    cancelledAt: Date,
    cancellationReason: String,

    
  },
  {
    timestamps: true,
  
  }
);
 
 

module.exports = mongoose.model('Deal', dealSchema);
