const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/token');
const { sendEmail, emailTemplates } = require('../utils/email');
const { generateRandomString } = require('../utils/helper');

const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      role = 'user',
      avatar = null,
      address = { street: '', city: '', region: '', country: 'ETHIOPIA' }
    } = req.body;

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { phone }
      ]
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'phone';
      return res.status(400).json({
        status: 'error',
        message: `User with this ${field} already exists`
      });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim(),
      role,
      avatar,
      address,
      verificationCode,
      verificationCodeExpire: Date.now() + 10 * 60 * 1000, // 10 minutes
      isVerified: false
    });

    // Send email
    setImmediate(async () => {
      try {
        const emailContent = emailTemplates.verificationCode(fullName, verificationCode);
        await sendEmail({
          email: user.email,
          ...emailContent
        });
      } catch (emailError) {
        console.error('Verification email failed:', emailError);
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully. Please check your email for the verification code.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Registration failed'
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Validate request body
    if (!email || !code) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and verification code are required'
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user with valid verification code
    const user = await User.findOne({
      email: normalizedEmail,
      verificationCode: code,
      verificationCodeExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired verification code'
      });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpire = undefined;

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);

    // Handle specific errors
    if (error.name === 'MongoServerError') {
      return res.status(500).json({
        status: 'error',
        message: 'Database error occurred'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user data'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Failed to verify email'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated. Please contact support.',
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate tokens
    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Set access token in cookie (to support req.cookies.token in middleware)
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 15 minutes, matching access token expiry
    });

    // Prepare user data (exclude password)
    const userData = await User.findById(user._id).select('-password');

    // Set user cookie
    res.cookie('user', JSON.stringify({
      _id: userData._id,
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      avatar: userData.avatar,
      address: userData.address,
      isActive: userData.isActive,
      isVerified: userData.isVerified,
      lastLogin: userData.lastLogin,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // Match accessToken expiry
    });

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userData,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user data'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['fullName', 'phone', 'address'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key) && req.body[key] !== undefined) {
        if (typeof req.body[key] === 'string') {
          updates[key] = req.body[key].trim();
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid fields to update'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile'
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to change password'
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`[forgotPassword] Request received for email: '${email}'`);

    if (!email) {
      console.log('[forgotPassword] Email not provided');
      return res.status(400).json({ status: 'error', message: 'Please provide email address' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[forgotPassword] Searching for user with email: '${normalizedEmail}'`);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`[forgotPassword] User NOT found for email: '${normalizedEmail}'`);
      // We still return success to prevent email enumeration, but log internally
      return res.status(200).json({
        status: 'success',
        message: 'If an account with that email exists, a reset code has been sent'
      });
    }

    console.log(`[forgotPassword] User found: ${user.fullName} (${user._id})`);
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = resetCode;
    user.resetCodeExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    console.log(`[forgotPassword] Reset code generated and saved for ${normalizedEmail}`);

    const resetEmail = emailTemplates.passwordReset(user.fullName, resetCode);
    console.log(`[forgotPassword] Attempting to send email to ${user.email}...`);
    try {
      await sendEmail({ email: user.email, ...resetEmail });
      console.log(`[forgotPassword] Email sent successfully to ${user.email}`);
    } catch (emailError) {
      console.error(`[forgotPassword] FAILED to send email to ${user.email}:`, emailError);
      // Depending on requirements, might want to return error or silent fail
      // For now, let's throw it to be caught by outer catch if critical, or just log.
      // If email fails, user can't reset. Better to fail the request?
      // But standard practice is not to reveal much.
      // However, for debugging we need to know.
      throw emailError;
    }

    res.status(200).json({
      status: 'success',
      message: 'If an account with that email exists, a reset code has been sent'
    });
  } catch (error) {
    console.error('[forgotPassword] Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to process forgot password request' });
  }
};

const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetCode: code,
      resetCodeExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired reset code'
      });
    }

    // Do NOT clear resetCode here. Just confirm it's valid.
    res.status(200).json({
      status: 'success',
      message: 'Code verified. You can now reset your password.'
    });
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to verify code' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, password } = req.body;
    console.log(`[resetPassword] Received request. Email: ${email}, Code: ${code}`);

    if (!email || !code || !password) {
      console.log('[resetPassword] Missing fields');
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email, verification code, and new password'
      });
    }

    if (password.length < 6) {
      console.log('[resetPassword] Password too short');
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[resetPassword] Querying for user: ${normalizedEmail} with code: ${code}`);

    const user = await User.findOne({
      email: normalizedEmail,
      resetCode: code.toString(), // Ensure string comparison
      resetCodeExpire: { $gt: Date.now() }
    });

    if (!user) {
      console.log(`[resetPassword] User NOT found or code expired/incorrect for ${normalizedEmail}`);
      // Log what's in DB for comparison (only for debugging)
      const u = await User.findOne({ email: normalizedEmail });
      if (u) {
        console.log(`[resetPassword] Debug - DB code: ${u.resetCode}, Expiry: ${u.resetCodeExpire}, Now: ${new Date()}`);
      }
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired reset code'
      });
    }

    console.log(`[resetPassword] User found. Updating password...`);
    // Update password and clear reset code
    user.password = password;
    user.resetCode = undefined;
    user.resetCodeExpire = undefined;

    try {
      await user.save();
      console.log(`[resetPassword] User saved successfully`);
    } catch (saveError) {
      console.error(`[resetPassword] user.save() FAILED:`, saveError.message);
      if (saveError.errors) {
        console.error(`[resetPassword] Validation errors:`, Object.keys(saveError.errors).join(', '));
      }
      throw saveError; // Re-throw to be caught by outer catch
    }

    // Checking if generateAccessToken/generateRefreshToken exists and works
    console.log(`[resetPassword] Generating tokens...`);
    const authToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.cookie('accessToken', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful',
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        token: authToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('❌ [resetPassword] Critical error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset password'
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const incoming = req.cookies.refreshToken || req.body.refreshToken;

    if (!incoming) {
      return res.status(400).json({
        status: 'error',
        message: 'Refresh token is required'
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(incoming);
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired refresh token'
      });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found or inactive'
      });
    }

    const token = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });

    return res.status(200).json({
      status: 'success',
      message: 'Token refreshed',
      data: {
        token,
        refreshToken: newRefreshToken,
        user
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to refresh token'
    });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.clearCookie('user', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to logout',
    });
  }
};

const requestEmailVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = verificationCode;
    user.verificationCodeExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const emailContent = emailTemplates.verificationCode(user.fullName, verificationCode);
    await sendEmail({ email: user.email, ...emailContent });

    res.status(200).json({ status: 'success', message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('Request email verification error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to request email verification' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  verifyEmail,
  requestEmailVerification,
  verifyResetCode
};