const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb+srv://temesgenmarie:123456Tom@cluster0.mxzpylr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    console.log(`[connectDB] Attempting to connect to MongoDB... (URI: ${uri.split('@')[1]})`);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });

    console.log(`✅ [connectDB] MongoDB Connected: ${mongoose.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('[connectDB] MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('[connectDB] MongoDB disconnected');
    });
  } catch (error) {
    console.error('❌ [connectDB] MongoDB connection error:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
};

module.exports = connectDB;