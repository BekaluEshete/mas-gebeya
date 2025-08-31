require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const { verifyRefreshToken, generateAccessToken } = require('./utils/token');
const User = require('./models/User');
const authRoutes = require("./routes/authRoute");
const CarRoutes=require("./routes/carRoute");
const LandRoutes=require("./routes/landRoute");
const MachineRoutes=require("./routes/machineRoute")
const UserRoutes = require("./routes/userRoute");
const DealRoutes = require("./routes/dealRoute");
const PropertyRoute=require("./routes/propertyRoute");
const app = express();
app.set("trust proxy", 1);

// Middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(cors());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', CarRoutes);
app.use('/api/lands', LandRoutes);
app.use('/api/machines', MachineRoutes);
app.use('/api/users', UserRoutes);
app.use('/api/deals', DealRoutes);
app.use('/api/properties', PropertyRoute);

// Refresh token route
app.post('/api/auth/refresh-token', async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ status: 'error', message: 'No refresh token provided' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({ status: 'error', message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user._id);
    res.json({ status: 'success', accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ status: 'error', message: 'Refresh token invalid or expired' });
  }
});
 

// 404 handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ status: 'error', message: 'Server error' });
});

// Start server after DB connection
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
