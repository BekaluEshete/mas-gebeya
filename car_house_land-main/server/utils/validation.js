const { body, param } = require('express-validator');

const registerValidation = [
  body('fullName').trim().isLength({ min: 2, max: 50 }).matches(/^[a-zA-Z\s]+$/),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('phone').matches(/^\+251[0-9]{9}$/),
  body('role').optional().isIn(['user', 'owner'])
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const changePasswordValidation = [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
];

const updateProfileValidation = [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).matches(/^[a-zA-Z\s]+$/),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).matches(/^[a-zA-Z\s]+$/),
  body('phone').optional().matches(/^\+251[0-9]{9}$/),
  body('avatar').optional().isURL()
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail()
];

const resetPasswordValidation = [
  param('token').isLength({ min: 64, max: 64 }),
  body('password').isLength({ min: 6 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
];

const refreshTokenValidation = [
  body('refreshToken').optional().isString()
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
