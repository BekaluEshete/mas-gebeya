const Deal = require('../models/Deal');
const User = require('../models/User');
const { sanitizeSearchString } = require('../utils/helper');
const Car = require('../models/Car');
const Land = require('../models/Land');
const Property = require('../models/Property');
const Machine = require('../models/Machine');
const mongoose = require('mongoose');
const { sendEmail, emailTemplates } = require('../utils/email');


const getDeals = async (req, res) => {
  try {
    const { search, status, dealType, itemType, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const userId = req.user.id;
    const role = req.user.role;

    const filter = {};
    if (search) {
      const searchRegex = new RegExp(sanitizeSearchString(search), 'i');
      filter.dealId = searchRegex;
    }
    if (status) filter.status = status;
    if (dealType) filter.dealType = dealType;
    if (itemType) filter.itemType = itemType;
    if (role === 'user') {
      filter.$or = [{ buyer: userId }, { seller: userId }];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    let query = Deal.find(filter).sort(sort);
    if (role === 'admin') {
      query = query.populate('buyer', 'fullName email phone').populate('seller', 'fullName email phone').populate('item');
    } else {
      query = query.populate('item');
    }

    const deals = await query;

    res.status(200).json({
      status: 'success',
      data: { deals },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch deals',
    });
  }
};

const getDealById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    let deal;
    if (role === 'admin') {
      deal = await Deal.findById(id)
        .populate('buyer', 'fullName email phone')
        .populate('seller', 'fullName email phone')
        .populate('item');
    } else {
      deal = await Deal.findOne({
        _id: id,
        $or: [{ buyer: userId }, { seller: userId }],
      }).populate('item');
    }

    if (!deal) {
      return res.status(404).json({
        status: 'error',
        message: 'Deal not found or you are not authorized to view this deal',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { deal },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch deal',
    });
  }
};

const createDeal = async (req, res) => {
  try {
    const { item, itemType, dealType, buyer, seller } = req.body;

    // Validate itemType
    const validItemTypes = ['Car', 'Property', 'Land', 'Machine'];
    if (!validItemTypes.includes(itemType)) {
      return res.status(400).json({
        status: 'error',  
        message: 'Invalid item type',
      });
    }

    // Select ItemModel based on itemType
    let ItemModel;
    if (itemType === 'Car') {
      ItemModel = Car;
    } else if (itemType === 'Property') {
      ItemModel = Property;
    } else if (itemType === 'Land') {
      ItemModel = Land;
    } else if (itemType === 'Machine') {
      ItemModel = Machine;
    }

    // Find item
    const itemExists = await ItemModel.findById(item);
    if (!itemExists) {
      return res.status(404).json({
        status: 'error',
        message: `Item not found in ${itemType} collection`,
      });
    }

    // Find buyer and seller
    const buyerExists = await User.findById(buyer);
    const sellerExists = await User.findById(seller);
    if (!buyerExists || !sellerExists) {
      return res.status(404).json({
        status: 'error',
        message: 'Buyer or seller not found',
      });
    }

    // Check if a deal already exists with the same buyer, seller, item, and itemType
    const existingDeal = await Deal.findOne({
      buyer,
      seller,
      item,
      itemType,
    });

    if (existingDeal) {
      return res.status(400).json({
        status: 'error',
        message: 'A deal with the same buyer, seller, and item already exists',
      });
    }

    // Create deal
    const deal = await Deal.create({
      buyer,
      seller,
      item,
      itemType,
      dealType, // Include dealType if it's part of your schema
    });
try {
  await sendEmail({
    email: "tommr2323@gmail.com", // Admin email
    ...emailTemplates.adminNotification(
      `A new deal has been created on Massgebeya. <br><br>
       <strong>Item:</strong> ${itemExists.title || itemExists.name || "Unnamed"} <br>
       <strong>Type:</strong> ${itemType} <br>
       <strong>Deal Type:</strong> ${dealType} <br>
       <strong>Deal ID:</strong> ${deal._id} <br>
       <a href="${process.env.CLIENT_URL}/deals/${deal._id}" target="_blank">View Deal</a>`,
      {
        fullName: buyerExists.fullName,
        email: buyerExists.email,
        phoneNumber: buyerExists.phone,
        location: buyerExists.address,
      }
    )
  });

  console.log("✅ Admin notified about new deal");
} catch (emailErr) {
  console.error("❌ Failed to notify admin:", emailErr);
}



    res.status(201).json({
      status: 'success',
      message: 'Deal created successfully',
      data: { deal },
    });
  } catch (error) {
    console.error('Create deal error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create deal',
      error: error.message, // Include error message for debugging
    });
  }
};

const updateDealStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status',
      });
    }

    const deal = await Deal.findById(id);
    if (!deal) {
      return res.status(404).json({
        status: 'error',
        message: 'Deal not found',
      });
    }

    deal.status = status;
    if (status === 'completed') deal.completedAt = new Date();
    if (status === 'cancelled') {
      deal.cancelledAt = new Date();
      deal.cancellationReason = cancellationReason || 'No reason provided';
    }

    await deal.save();

    res.status(200).json({
      status: 'success',
      message: `Deal ${status} successfully`,
      data: { deal },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update deal status',
    });
  }
};

const deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;

    const deal = await Deal.findById(id);
    if (!deal) {
      return res.status(404).json({
        status: 'error',
        message: 'Deal not found',
      });
    }

    if (['pending', 'approved'].includes(deal.status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete active deal',
      });
    }

    await Deal.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'Deal deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete deal',
    });
  }
};

const getDealStats = async (req, res) => {
  try {
    const stats = await Deal.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await Deal.countDocuments();

    const formattedStats = stats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    formattedStats.total = total;

    res.status(200).json({
      status: 'success',
      data: formattedStats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch deal stats',
    });
  }
};

module.exports = {
  getDeals,
  getDealById,
  createDeal,
  updateDealStatus,
  deleteDeal,
  getDealStats,
};