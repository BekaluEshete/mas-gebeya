const { verifyToken } = require('../utils/token');
const User = require('../models/User');
 
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.',
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Token is not valid. User not found.',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated. Please contact support.',
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.message === 'Invalid token' || error.message === 'Token expired') {
      return res.status(401).json({
        status: 'error',
        message: error.message,
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Server error in authentication',
    });
  }
};
 
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin privileges required.',
    });
  }
};

 
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
};
 
const sensitiveOperationLimit = (req, res, next) => {
  const userAttempts = global.userAttempts || {};
  const userId = req.user ? req.user._id.toString() : req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 5;

  if (!userAttempts[userId]) {
    userAttempts[userId] = { count: 1, resetTime: now + windowMs };
  } else if (now > userAttempts[userId].resetTime) {
    userAttempts[userId] = { count: 1, resetTime: now + windowMs };
  } else if (userAttempts[userId].count >= maxAttempts) {
    return res.status(429).json({
      status: 'error',
      message: 'Too many attempts. Please try again later.',
      retryAfter: Math.ceil((userAttempts[userId].resetTime - now) / 1000),
    });
  } else {
    userAttempts[userId].count++;
  }

  global.userAttempts = userAttempts;
  next();
};

module.exports = {
  protect,
  adminOnly,
  optionalAuth,
  sensitiveOperationLimit,
};