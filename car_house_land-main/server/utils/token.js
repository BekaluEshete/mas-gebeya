const jwt = require('jsonwebtoken');

// Validate environment variables
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET or JWT_REFRESH_SECRET is not defined in environment variables');
}
 
const generateAccessToken = (user) => {
  if (!user._id || !user.role) {
    throw new Error('Invalid user object: _id and role are required');
  }
  return jwt.sign(
    { id: user._id, role: user.role },
    "land",
    { expiresIn: '15m' }
  );
};
 
const generateRefreshToken = (user) => {
  if (!user._id || !user.role) {
    throw new Error('Invalid user object: _id and role are required');
  }
  return jwt.sign(
    { id: user._id, role: user.role },
    "land",
    { expiresIn: '30d' }
  );
};
 
const verifyToken = (token) => {
  if (!token) {
    throw new Error('No token provided');
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    throw error;
  }
};

 
const verifyRefreshToken = (token) => {
  if (!token) {
    throw new Error('No refresh token provided');
  }
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    }
    throw error;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
};