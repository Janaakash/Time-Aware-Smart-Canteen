const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_canteen';
    const db = await mongoose.connect(mongoUri);
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message || error);
    if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
      // In local development, exit so developer knows MongoDB is not running
      process.exit(1);
    }
  }
};

module.exports = connectDB;

