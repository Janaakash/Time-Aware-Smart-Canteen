const mongoose = require('mongoose');
const { createHybridModel } = require('./modelHelper');

const billSchema = new mongoose.Schema({
  billNumber: { type: String, required: true, unique: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['PENDING', 'SUCCESSFUL', 'FAILED'], default: 'PENDING' },
  generatedAt: { type: Date, default: Date.now }
});

module.exports = createHybridModel('Bill', billSchema, 'bills');

