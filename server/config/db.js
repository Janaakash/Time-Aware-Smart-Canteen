const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  // In cloud deployments (Render, Vercel, or production), if no cloud MONGO_URI is set, immediately use hybrid data store
  const isCloudDeployment = Boolean(process.env.VERCEL || process.env.RENDER || process.env.NODE_ENV === 'production');
  const isLocalMongoUri = !process.env.MONGO_URI || process.env.MONGO_URI.includes('127.0.0.1') || process.env.MONGO_URI.includes('localhost');

  if (isCloudDeployment && isLocalMongoUri) {
    console.log('Running in cloud without external MongoDB: using built-in hybrid data store.');
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
    if (!isCloudDeployment) {
      // In local development, exit so developer knows MongoDB is not running
      process.exit(1);
    } else {
      console.log('Falling back to built-in hybrid data store.');
    }
  }
};

module.exports = connectDB;

