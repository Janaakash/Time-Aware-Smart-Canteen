const path = require('path');
const fs = require('fs');

// Load environment variables reliably from multiple possible paths
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

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

// Serve frontend static build in production (e.g. Render fullstack deployment)
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // Fallback to index.html for client-side React routing in Express 5
  app.use((req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    // Do not rewrite asset requests with extensions (e.g. .js, .css, .jpg) to HTML
    if (path.extname(req.path) && req.path !== '/index.html') {
      return next();
    }
    const indexPath = path.join(clientDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
}

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

