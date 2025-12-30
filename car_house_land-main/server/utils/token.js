const jwt = require('jsonwebtoken');

// Validate environment variables
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.warn('⚠️ JWT_SECRET or JWT_REFRESH_SECRET is not defined. Using insecure defaults for local development.');
}

const generateAccessToken = (userOrId) => {
  const payload = typeof userOrId === 'object'
    ? { id: userOrId._id, role: userOrId.role }
    : { id: userOrId, role: 'user' }; // Fallback role

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || "land",
    { expiresIn: '7h' }
  );
};

const generateRefreshToken = (userOrId) => {
  const payload = typeof userOrId === 'object'
    ? { id: userOrId._id, role: userOrId.role }
    : { id: userOrId, role: 'user' };

  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || "land",
    { expiresIn: '7h' }
  );
};

const verifyToken = (token) => {
  if (!token) {
    throw new Error('No token provided');
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "land");
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
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || "land");
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
