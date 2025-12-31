const { body } = require('express-validator');

const registerValidation = [
  body('fullName').trim().isLength({ min: 2, max: 50 }).withMessage('Full name must be between 2 and 50 characters').matches(/^[a-zA-Z\s]+$/).withMessage('Full name can only contain letters and spaces'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('phone').matches(/^\+251[0-9]{9}$/).withMessage('Please provide a valid Ethiopian phone number (+251xxxxxxxx)'),
  body('role').optional().isIn(['user', 'owner']).withMessage('Invalid role selection')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const updateProfileValidation = [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('phone').optional().matches(/^\+251[0-9]{9}$/).withMessage('Please provide a valid Ethiopian phone number'),
  body('avatar').optional().isURL().withMessage('Invalid avatar URL')
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address')
];

const resetPasswordValidation = [
  body('email').isEmail(),
  body('code').isLength({ min: 6, max: 6 }),
  body('password').isLength({ min: 6 })
];

const refreshTokenValidation = [
  body('refreshToken').optional().isString().withMessage('Invalid refresh token format')
];

module.exports = {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  updateProfileValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  refreshTokenValidation
};
