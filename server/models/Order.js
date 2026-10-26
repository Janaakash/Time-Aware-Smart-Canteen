const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  foodItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem', required: true },
  foodName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  itemStatus: { type: String, enum: ['PREPARING', 'READY'], default: 'PREPARING' }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  billNumber: { type: String, required: true, unique: true }, // Merged bill logic directly into order as requested sometimes, wait, prompt asked for a Bill model too. Let's keep it here and in Bill.
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['ORDER PLACED', 'PAYMENT CONFIRMED', 'PREPARING', 'FOOD PREPARED', 'COLLECTED'], 
    default: 'ORDER PLACED' 
  },
  paymentStatus: { type: String, enum: ['PENDING', 'SUCCESSFUL', 'FAILED'], default: 'PENDING' },
  paymentMethod: { type: String },
  transactionId: { type: String, unique: true, sparse: true },
  paidAmount: { type: Number },
  paidAt: { type: Date },
  actualPrepStartTime: { type: Date },
  preparedAt: { type: Date },
  collectedAt: { type: Date },
  // Time-Aware extensions
  pickupWindow: {
    startTime: { type: Date },
    endTime: { type: Date },
    slotLabel: { type: String }
  },
  estimatedPrepTime: { type: Number, default: 0 },
  estimatedQueueDelay: { type: Number, default: 0 },
  estimatedTotalTime: { type: Number, default: 0 },
  estimatedReadyAt: { type: Date },
  isAtRisk: { type: Boolean, default: false },
  delayReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
