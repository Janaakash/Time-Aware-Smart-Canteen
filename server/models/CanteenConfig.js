const mongoose = require('mongoose');
const { createHybridModel } = require('./modelHelper');

const canteenConfigSchema = new mongoose.Schema({
  maxOrdersPerPickupWindow: { type: Number, default: 5 },
  kitchenPrepSlots: { type: Number, default: 3 },
  pickupWindowDurationMins: { type: Number, default: 10 },
  pickupHandlingMins: { type: Number, default: 1 },
  walkingTimeMins: { type: Number, default: 3 },
  eatingTimeMins: { type: Number, default: 5 },
  lowDelayThresholdMins: { type: Number, default: 5 },
  highDelayThresholdMins: { type: Number, default: 15 },
  openingTime: { type: String, default: '08:00' },
  closingTime: { type: String, default: '20:00' }
}, { timestamps: true });

module.exports = createHybridModel('CanteenConfig', canteenConfigSchema, 'config');

