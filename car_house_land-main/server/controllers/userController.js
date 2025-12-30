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
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

    const { limit, skip, page } = getPaginationInfo(req.query);
    const users = await User.find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .limit(limit)
      .skip(skip)
      .select('-password');

    const total = await User.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
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

    // Get user's deal stats
    const dealStats = await Deal.aggregate([
      { $match: { $or: [{ buyer: user._id }, { seller: user._id }] } },
      {
        $group: {
          _id: null,
          totalDeals: { $sum: 1 },
          completedDeals: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          totalSpent: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$buyer', user._id] },
                    { $eq: ['$status', 'completed'] },
                  ],
                },
                '$price',
                0, // Assuming 'price' field exists for completed deals
              ],
            },
          },
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

    // Explicitly select password for isModified check
    const user = await User.findById(id).select('+password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // List of allowed fields for admin update
    const allowedUpdates = [
      'fullName',
      'password',
      'phone',
      'role',
      'avatar',
      'address',
      'isActive',
      'isVerified',
    ];

    // Apply updates
    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        // Handle nested address object
        if (field === 'address' && typeof updates.address === 'object') {
          user.address = { ...user.address, ...updates.address };
        } else if (field === 'password') {
          if (updates.password && updates.password.trim().length >= 6) {
            user.password = updates.password;
            user.markModified('password');
          }
        } else {
          user[field] = updates[field];
        }
      }
    });

    await user.save();

    // Return updated user without password
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user',
      detail: error.message
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

    user.role = user.role === 'admin' ? 'user' : 'admin';
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

const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const admins = await User.countDocuments({ role: 'admin' });

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        admins,
      },
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user stats',
    });
  }
};

const getPublicUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments({ isActive: true });
    res.json({ status: 'success', count });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error fetching user count' });
  }
};

const getUserDashboard = async (req, res) => {
  try {
    const { _id: id } = req.user;

    // Get recent deals
    const recentDeals = await Deal.find({
      $or: [{ buyer: id }, { seller: id }],
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get deal stats
    const dealStats = await Deal.aggregate([
      { $match: { $or: [{ buyer: id }, { seller: id }] } },
      {
        $group: {
          _id: null,
          totalDeals: { $sum: 1 },
          pendingDeals: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
          approvedDeals: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] },
          },
          completedDeals: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
    ]);

    // Get cart
    const cart = await Cart.findOne({ user: id });

    // Get favorites (simplified mockup check)
    const favoriteItems = [];

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
  getPublicUserCount,
};
