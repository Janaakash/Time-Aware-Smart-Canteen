const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  billNumber: { type: String },
  message: { type: String, required: true },
  type: { type: String, default: 'INFO' }, // e.g., 'FOOD_READY'
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
