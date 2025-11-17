const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats,
  getUserDashboard,
  toggleUserRole
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middlewares/auth');
const { validateRequest } = require('../middlewares/validation');
const User=require('../models/User.js')
const router = express.Router();



router.get('/owner/list', async (req, res) => {
  try {
    const owners = await User.find({ role: 'owner' })
      .select('_id fullName'); // only include id & fullName

    res.status(200).json({
      success: true,
      count: owners.length,
      data: owners
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Public endpoint to get admin contact information
router.get('/admin/contact', async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' })
      .select('fullName email phone'); // only include contact info

    if (!admin) {
      return res.status(404).json({
        status: 'error',
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        name: admin.fullName,
        email: admin.email,
        phone: admin.phone
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// All routes require authentication
router.use(protect);

// Validation rules
const userIdParam = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];
 

 

// Routes
router.get('/dashboard', getUserDashboard);
router.get('/', adminOnly, validateRequest, getUsers);
router.get('/user/stats', adminOnly, getUserStats);
router.get('/:id', adminOnly, userIdParam, validateRequest, getUserById);
router.put('/:id', adminOnly, userIdParam, validateRequest, updateUser);
router.put('/:id/toggle-status', adminOnly, userIdParam, validateRequest, toggleUserStatus);
router.put('/:id/toggle-role', adminOnly, userIdParam, validateRequest, toggleUserRole);

router.delete('/:id', adminOnly, userIdParam, validateRequest, deleteUser);

module.exports = router;