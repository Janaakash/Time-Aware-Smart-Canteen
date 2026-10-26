const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  // In Vercel serverless, if no cloud MONGO_URI is set, immediately use hybrid data store (no 5s timeout!)
  if (process.env.VERCEL && (!process.env.MONGO_URI || process.env.MONGO_URI.includes('127.0.0.1') || process.env.MONGO_URI.includes('localhost'))) {
    console.log('Running on Vercel: using built-in hybrid data store.');
    return;
  }

  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_canteen';
    const db = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
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

