require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
const socketHandler = require('./socket/socketHandler');

const authRoutes = require('./routes/auth');
const foodRoutes = require('./routes/foods');
const orderRoutes = require('./routes/orders');
const staffRoutes = require('./routes/staff');
const billRoutes = require('./routes/bills');
const notificationRoutes = require('./routes/notifications');
const timeRoutes = require('./routes/time');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();

// Initialize Socket.io
socketHandler.init(server);

// Middleware
app.use(cors());
app.use(express.json());

// Ensure Database connection for serverless requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB middleware connection error:', err);
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/time', timeRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

