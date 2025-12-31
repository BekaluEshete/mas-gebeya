const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  requestEmailVerification,
  verifyEmail,
} = require('../controllers/authController');

const { protect, sensitiveOperationLimit } = require('../middlewares/auth');
const { validateRequest } = require('../middlewares/validatorMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');

const {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  updateProfileValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  refreshTokenValidation,
} = require('../utils/validation');

const router = express.Router();

// Public routes
router.post('/register', registerValidation, validateRequest, register);
router.post('/login', authLimiter, loginValidation, validateRequest, login); // Added loginValidation
router.post('/forgot-password', authLimiter, forgotPasswordValidation, validateRequest, sensitiveOperationLimit, forgotPassword);
router.post('/reset-password', (req, res, next) => {
  console.log(`[ROUTE_DEBUG] POST /reset-password. Body Keys:`, Object.keys(req.body));
  next();
}, resetPasswordValidation, validateRequest, resetPassword);
//router.post('/refresh-token', refreshTokenValidation, validateRequest, refreshToken);

// Email verification routes
router.post('/request-email-verification', authLimiter, protect, requestEmailVerification);
router.post('/verify-email', authLimiter, verifyEmail);

// Check auth sync header (new route)
router.get('/check-auth-sync', (req, res) => {
  console.log('[check-auth-sync] Request received, headers:', req.headers);
  const syncHeader = req.headers['x-auth-sync'] || null;
  res.status(200).json({ syncHeader });
});

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.put('/update-profile', updateProfileValidation, validateRequest, updateProfile);
router.put('/change-password', changePasswordValidation, validateRequest, sensitiveOperationLimit, changePassword);
router.post('/logout', logout);

module.exports = router;