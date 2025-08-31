const User = require('../models/User');
const Deal = require('../models/Deal');
const Cart = require('../models/Cart');
const { getPaginationInfo, sanitizeSearchString } = require('../utils/helper');
const getUsers = async (req, res) => {
  try {
    const {
      search,
      role,
      isActive,
      isVerified,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filter = {};
    if (search) {
      const searchRegex = new RegExp(sanitizeSearchString(search), 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(filter)
      .select('-password')
      .sort(sort);

    res.status(200).json({
      status: 'success',
      data: {
        users,
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
    });
  }
};

// Get a single user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    const dealStats = await Deal.aggregate([
      { $match: { $or: [{ buyer: user._id }, { seller: user._id }] } },
      {
        $group: {
          _id: null,
          totalDeals: { $sum: 1 },
          completedDeals: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          totalSpent: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$finalPrice', 0] } },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        user,
        dealStats: dealStats[0] || {
          totalDeals: 0,
          completedDeals: 0,
          totalSpent: 0,
        },
      },
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user details',
    });
  }
};

// Update a user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating sensitive fields
    delete updates.password;
    delete updates.email;
    delete updates.resetPasswordToken;
    delete updates.resetPasswordExpire;

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: { user },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user',
    });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    const activeDeals = await Deal.countDocuments({
      $or: [{ buyer: id }, { seller: id }],
      status: { $in: ['pending', 'approved'] },
    });

    if (activeDeals > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete user with active deals',
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user',
    });
  }
};

// Toggle user status (active/inactive)
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: {
          _id: user._id,
          isActive: user.isActive,
        },
      },
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to toggle user status',
    });
  }
};

const toggleUserRole = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Toggle role between 'admin' and 'user'
    user.role = user.role === 'admin' ? 'user' : 'user' === user.role ? 'admin' : 'user';
    await user.save();

    res.status(200).json({
      status: 'success',
      message: `User role changed to ${user.role} successfully`,
      data: {
        user: {
          _id: user._id,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Toggle user role error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to toggle user role',
    });
  }
};

// Get user statistics (for admins)
const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
           
          adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          ownerUsers: { $sum: { $cond: [{ $eq: ['$role', 'owner'] }, 1, 0] } },
          
        },
      },
    ]);

    const registrationTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const locationStats = await User.aggregate([
      { $match: { 'address.region': { $exists: true, $ne: null } } },
      { $group: { _id: '$address.region', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        overview: stats[0] || {},
        registrationTrends,
        locationBreakdown: locationStats,
      },
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user statistics',
    });
  }
};

// Get user dashboard (for authenticated user)
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Recent deals where user is buyer or seller
    const recentDeals = await Deal.find({ $or: [{ buyer: userId }, { seller: userId }] })
      .populate('item')
      .populate('seller', 'fullName email')
      .populate('buyer', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Deal statistics
    const dealStats = await Deal.aggregate([
      { $match: { $or: [{ buyer: userId }, { seller: userId }] } },
      {
        $group: {
          _id: null,
          totalDeals: { $sum: 1 },
          pendingDeals: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approvedDeals: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          completedDeals: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        },
      },
    ]);

    // Fetch user's cart items
    let cart = { items: [] };
    try {
      cart = await Cart.findOne({ user: userId }).populate('items.product').lean();
    } catch (err) {
      console.warn('Cart fetch error (possibly no Cart model):', err);
    }

    // Fetch favorite items
    const favoriteItems = [];
    if (req.user.favoriteItems?.length > 0) {
      for (let i = 0; i < Math.min(req.user.favoriteItems.length, 6); i++) {
        const itemId = req.user.favoriteItems[i];
        const itemType = req.user.favoriteItemTypes?.[i];
        if (!itemType || !['Car', 'Property', 'Land', 'Machine'].includes(itemType)) continue;
        try {
          const ItemModel = require(`../models/${itemType}`);
          const item = await ItemModel.findById(itemId)
            .select('title images location status');
          if (item) {
            favoriteItems.push({
              ...item.toObject(),
              itemType,
            });
          }
        } catch (err) {
          console.error(`Error fetching favorite ${itemType}:`, err);
        }
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: req.user,
        recentDeals,
        dealStats: dealStats[0] || {
          totalDeals: 0,
          pendingDeals: 0,
          approvedDeals: 0,
          completedDeals: 0,
        },
        cart: cart?.items || [],
        favoriteItems,
      },
    });
  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard data',
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats,
  getUserDashboard,
  toggleUserRole,
};